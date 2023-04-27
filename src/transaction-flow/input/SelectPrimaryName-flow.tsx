import { ReactNode, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'
import { useInfiniteQuery } from 'wagmi'

import { decryptName } from '@ensdomains/ensjs/utils/labels'
import { Button, Dialog, Heading, RadioButton, RadioButtonGroup } from '@ensdomains/thorin'

import { InnerDialog } from '@app/components/@atoms/InnerDialog'
import { NamePill } from '@app/components/@molecules/NamePill'
import {
  LoadingContainer,
  ScrollBoxWithSpinner,
  SpinnerRow,
} from '@app/components/@molecules/ScrollBoxWithSpinner'
import { useChainId } from '@app/hooks/useChainId'
import { useEns } from '@app/utils/EnsProvider'

import { makeTransactionItem } from '../transaction'
import { TransactionDialogPassthrough } from '../types'

type Data = {
  address: string
  existingPrimary: string | null
}

type Domain = {
  id: string
  name: string
}

export type Props = {
  data: Data
} & TransactionDialogPassthrough

const StyledScrollBox = styled(ScrollBoxWithSpinner)(
  ({ theme }) => css`
    width: ${theme.space.full};
  `,
)

const NamePillWrapper = styled.div`
  width: 100%;
  display: inline-block;
`

const NameList = styled.div(
  () => css`
    padding-top: 0.5rem;
    input {
      margin-top: 8px;
    }
  `,
)

const querySize = 50

const SelectPrimaryName = ({ data: { address, existingPrimary }, dispatch, onDismiss }: Props) => {
  const { t } = useTranslation('settings')

  const chainId = useChainId()
  const { gqlInstance } = useEns()

  const { data, fetchNextPage, isLoading } = useInfiniteQuery(
    [address, 'primaryNameOptions'],
    async ({ pageParam }: { pageParam?: string }) => {
      const { domains } = await gqlInstance.client.request(
        gqlInstance.gql`
      query getEthRecordAvailableNames($address: String!, $lastID: String, $size: Int!) {
        domains(first: $size, where: { id_gt: $lastID, resolvedAddress: $address }) {
          id
          name
        }
      }
    `,
        {
          address: address.toLowerCase(),
          lastID: pageParam || '0',
          size: querySize,
        },
      )

      if (!domains) return []
      return domains
        .map((domain: any) => {
          const decryptedName = decryptName(domain.name)
          if (decryptedName.includes('[')) return null
          return {
            ...domain,
            name: decryptedName,
          }
        })
        .filter((domain: any) => domain) as Domain[]
    },
    {
      keepPreviousData: true,
      getNextPageParam: (lastPage) => lastPage[lastPage.length - 1]?.id,
    },
  )

  const unfilteredNames = data?.pages?.reduce((prev, curr) => [...prev, ...curr], [] as Domain[])

  const names = unfilteredNames?.filter((x) => x.name !== existingPrimary)

  const hasNextPage = data?.pages[data.pages.length - 1].length === querySize

  const [selectedName, setSelectedName] = useState<string | undefined>(undefined)

  const handleSubmit = () => {
    dispatch({
      name: 'setTransactions',
      payload: [
        makeTransactionItem('setPrimaryName', {
          address,
          name: selectedName!,
        }),
      ],
    })
    dispatch({
      name: 'setFlowStage',
      payload: 'transaction',
    })
  }

  let Content: ReactNode

  if (isLoading) {
    Content = (
      <LoadingContainer>
        <Heading>{t('section.primary.input.loading')}</Heading>
        <SpinnerRow />
      </LoadingContainer>
    )
  } else if (names && names.length > 0) {
    Content = (
      <StyledScrollBox showSpinner={hasNextPage} onReachedBottom={() => fetchNextPage()}>
        <NameList>
          <RadioButtonGroup value={selectedName} onChange={(e) => setSelectedName(e.target.value)}>
            {names.map((name) => (
              <RadioButton
                label={
                  <NamePillWrapper>
                    <NamePill
                      name={name.name}
                      truncatedName={name.name}
                      network={chainId}
                      key={name.id}
                    />
                  </NamePillWrapper>
                }
                key={name.id}
                name={name.name}
                value={name.name}
              />
            ))}
          </RadioButtonGroup>
        </NameList>
      </StyledScrollBox>
    )
  } else {
    Content = (
      <LoadingContainer>
        <Heading>
          {unfilteredNames && unfilteredNames.length > 0
            ? t('section.primary.input.noOtherNames')
            : t('section.primary.input.noNames')}
        </Heading>
      </LoadingContainer>
    )
  }

  return (
    <>
      <Dialog.Heading title="Select a primary name" />
      <InnerDialog>{Content}</InnerDialog>
      <Dialog.Footer
        leading={
          <Button colorStyle="accentSecondary" onClick={onDismiss}>
            {t('action.cancel', { ns: 'common' })}
          </Button>
        }
        trailing={
          <Button data-testid="primary-next" onClick={handleSubmit} disabled={!selectedName}>
            {t('action.next', { ns: 'common' })}
          </Button>
        }
      />
    </>
  )
}

export default SelectPrimaryName
