import { useMemo, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'
import { useQueryClient } from 'wagmi'

import {
  decodeLabelhash,
  isEncodedLabelhash,
  labelhash,
  saveName,
} from '@ensdomains/ensjs/utils/labels'
import { validateName } from '@ensdomains/ensjs/utils/validation'
import { Button, Dialog, Input, Typography, mq } from '@ensdomains/thorin'

import { isLabelTooLong } from '@app/utils/utils'

import { TransactionDialogPassthrough, TransactionFlowItem } from '../../types'

const Container = styled.div(
  ({ theme }) => css`
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: stretch;
    gap: ${theme.space['4']};

    & > div {
      text-align: center;
      max-width: ${theme.space['112']};
      margin: 0 auto;
    }

    ${mq.sm.min(css`
      gap: ${theme.space['6']};
      width: calc(80vw - 2 * ${theme.space['6']});
      max-width: ${theme.space['128']};
    `)}
  `,
)

const LabelsContainer = styled.form(
  ({ theme }) => css`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: stretch;
    gap: ${theme.space['1']};

    & > div > div > label {
      visibility: hidden;
      display: none;
    }
  `,
)

type FormData = Record<string, string>

type Data = {
  name: string
  key: string
  transactionFlowItem: TransactionFlowItem
}

type UnknownLabelItem = [index: number, hash: string]

type LabelReducer = {
  inputs: { label: string; value: string; suffix: string; disabled: boolean }[]
  unknownLabels: UnknownLabelItem[]
}

export type Props = {
  data: Data
} & TransactionDialogPassthrough

const validateLabel = (hash: string) => (label: string) => {
  if (!label) {
    return 'Label is required'
  }
  if (isLabelTooLong(label)) {
    return 'Label is too long'
  }
  try {
    if (!validateName(label) || label.indexOf('.') !== -1) throw new Error()
  } catch {
    return 'Invalid label'
  }
  if (hash !== labelhash(label)) {
    return 'Label is incorrect'
  }
  return true
}

const UnknownLabels = ({
  data: { name, key, transactionFlowItem },
  dispatch,
  onDismiss,
}: Props) => {
  const queryClient = useQueryClient()

  const { t } = useTranslation('transactionFlow')

  const formRef = useRef<HTMLFormElement>(null)

  const labels = name.split('.')

  const { inputs, unknownLabels } = useMemo(
    () =>
      labels.reduce(
        (prev, curr, inx, arr) => {
          if (isEncodedLabelhash(curr)) {
            // if unknown label, set value to empty string, enable input
            // and add to unknownLabels
            const decoded = decodeLabelhash(curr)
            return {
              inputs: [...prev.inputs, { label: decoded, value: '', suffix: '.', disabled: false }],
              unknownLabels: [...prev.unknownLabels, [inx, decoded] as UnknownLabelItem],
            }
          }
          if (inx === arr.length - 1) {
            // if label is TLD, set the suffix of the previous label to be the TLD
            const newInputs = [...prev.inputs]
            newInputs[newInputs.length - 1].suffix = `.${curr}`
            return {
              inputs: newInputs,
              unknownLabels: [...prev.unknownLabels],
            }
          }
          // if known label, set value to label, disable input
          return {
            inputs: [...prev.inputs, { label: curr, value: curr, suffix: '.', disabled: true }],
            unknownLabels: [...prev.unknownLabels],
          }
        },
        { inputs: [], unknownLabels: [] } as LabelReducer,
      ),
    [labels],
  )

  const {
    register,
    formState,
    handleSubmit: _handleSubmit,
    getFieldState,
  } = useForm<FormData>({
    mode: 'onChange',
    defaultValues: unknownLabels.reduce(
      (acc, [inx, hash]) => ({ ...acc, [`${inx}-${hash}`]: '' }),
      {},
    ),
  })

  const handleSubmitForm = () => {
    formRef.current?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))
  }

  const handleSubmit = (data: Record<string, string>) => {
    const newName = labels
      .map((label, inx) =>
        isEncodedLabelhash(label) ? data[`${inx}-${decodeLabelhash(label)}`] : label,
      )
      .join('.')

    saveName(newName)

    const { transactions, intro } = transactionFlowItem

    const newKey = key.replace(name, newName)

    const newTransactions = transactions.map((tx) =>
      typeof tx.data === 'object' && tx.data.name
        ? { ...tx, data: { ...tx.data, name: newName } }
        : tx,
    )

    const newIntro =
      intro && typeof intro.content.data === 'object' && intro.content.data.name
        ? {
            ...intro,
            content: { ...intro.content, data: { ...intro.content.data, name: newName } },
          }
        : intro

    queryClient.resetQueries({ exact: true, queryKey: ['validate', name] })

    dispatch({
      name: 'startFlow',
      key: newKey,
      payload: {
        ...transactionFlowItem,
        transactions: newTransactions,
        intro: newIntro as any,
      },
    })
  }

  const hasErrors = Object.keys(formState.errors).length > 0
  const isComplete = Object.keys(formState.dirtyFields || {}).length === unknownLabels.length
  const canConfirm = !hasErrors && isComplete

  return (
    <>
      <Dialog.Heading title={t('input.unknownLabels.title')} />
      <Container>
        <Typography>{t('input.unknownLabels.subtitle')}</Typography>
        <LabelsContainer ref={formRef} onSubmit={_handleSubmit(handleSubmit)}>
          {inputs.map(({ label, value, suffix, disabled }, inx) => (
            <Input
              // eslint-disable-next-line react/no-array-index-key
              key={`${inx}-${label}`}
              placeholder={label}
              label={label}
              suffix={suffix}
              disabled={disabled}
              defaultValue={value}
              error={getFieldState(`${inx}-${label}`).error?.message}
              spellCheck={false}
              autoCorrect="off"
              autoComplete="off"
              data-testid={`unknown-label-input-${label}`}
              {...(disabled
                ? {}
                : register(`${inx}-${label}`, {
                    validate: validateLabel(label),
                  }))}
            />
          ))}
        </LabelsContainer>
      </Container>
      <Dialog.Footer
        leading={
          <Button colorStyle="accentSecondary" onClick={onDismiss}>
            {t('action.cancel', { ns: 'common' })}
          </Button>
        }
        trailing={
          <Button
            data-testid="unknown-labels-confirm"
            onClick={handleSubmitForm}
            disabled={!canConfirm}
          >
            {t('action.confirm', { ns: 'common' })}
          </Button>
        }
      />
    </>
  )
}

export default UnknownLabels
