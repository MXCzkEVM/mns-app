import { getResolution, isValidCell } from 'h3-js'
import { useMemo, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'
import { useQueryClient } from 'wagmi'

import { decodeLabelhash, isEncodedLabelhash } from '@ensdomains/ensjs/utils/labels'
import { Button, Dialog, Helper, Input, Typography, mq } from '@ensdomains/thorin'

import { makeTransactionItem } from '@app/transaction-flow/transaction'

import { TransactionDialogPassthrough } from '../../types'

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
}
type LabelReducer = {
  inputs: { label: string; value: string; suffix: string; disabled: boolean }[]
}
export type Props = {
  data: Data
} & TransactionDialogPassthrough

const validateH3Index = (h3index: string) => {
  if (!isValidCell(h3index)) {
    return 'Invalid h3index'
  }
  return getResolution(h3index) === 7 ? true : 'Invalid resolution of h3 index'
}

const MEP1002Mint = ({ data: { name }, dispatch, onDismiss }: Props) => {
  const queryClient = useQueryClient()

  const { t } = useTranslation('transactionFlow')

  const formRef = useRef<HTMLFormElement>(null)

  const labels = name.split('.')
  const {
    register,
    formState,
    handleSubmit: _handleSubmit,
  } = useForm<FormData>({
    mode: 'onChange',
  })

  const handleSubmitForm = () => {
    formRef.current?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))
  }

  const handleSubmit = (data: Record<string, string>) => {
    queryClient.resetQueries({ exact: true, queryKey: ['validate', name] })
    console.log(data,"data")
    console.log(labels,"labels")
    // MEP1002
    dispatch({
      name: 'setTransactions',
      payload: [
        makeTransactionItem('mep1002Mint', {
          h3index: data.mintToMEP1002Hexagon,
        }),
      ],
    })
    dispatch({ name: 'setFlowStage', payload: 'transaction' })
  }

  const hasErrors = Object.keys(formState.errors).length > 0
  const canConfirm = !hasErrors
  return (
    <>
      <Dialog.Heading title={t('input.mintToMEP1002Hexagon.title')} />
      <Container>
        <Typography>{t('input.mintToMEP1002Hexagon.subtitle')}</Typography>
        <LabelsContainer ref={formRef} onSubmit={_handleSubmit(handleSubmit)}>
          {hasErrors && formState.errors.mintToMEP1002Hexagon?.message && (
            <Helper type="error">{formState.errors.mintToMEP1002Hexagon?.message}</Helper>
          )}
          <Input
            key="h3index"
            placeholder={t('input.mintToMEP1002Hexagon.h3index')}
            label="h3index"
            {...register(`mintToMEP1002Hexagon`, {
              validate: validateH3Index,
              required: true,
            })}
          />
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
            data-testid="setToMEP1002Token-confirm"
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

export default MEP1002Mint
