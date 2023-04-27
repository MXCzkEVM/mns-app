import { ReactNode, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'
import { useAccount } from 'wagmi'

import { Button, PlusSVG, Spinner, Typography, mq } from '@ensdomains/thorin'

import { DisabledButtonWithTooltip } from '@app/components/@molecules/DisabledButtonWithTooltip'
import {
  NameTableHeader,
  SortDirection,
  SortType,
} from '@app/components/@molecules/NameTableHeader/NameTableHeader'
import { Card } from '@app/components/Card'
import { Outlink } from '@app/components/Outlink'
import { TabWrapper } from '@app/components/pages/profile/TabWrapper'
import { SubnameSortType, useSubnameInfiniteQuery } from '@app/hooks/useSubnameInfiniteQuery'
import { useTransactionFlow } from '@app/transaction-flow/TransactionFlowProvider'
import { emptyAddress } from '@app/utils/constants'

import useDebouncedCallback from '../../../../../hooks/useDebouncedCallback'
import { useQueryParameterState } from '../../../../../hooks/useQueryParameterState'
import { InfiniteScrollContainer } from '../../../../@atoms/InfiniteScrollContainer/InfiniteScrollContainer'
import { TaggedNameItem } from '../../../../@atoms/NameDetailItem/TaggedNameItem'

const TabWrapperWithButtons = styled.div(
  ({ theme }) => css`
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: flex-start;
    width: 100%;
    gap: ${theme.space['4']};
  `,
)

const StyledTabWrapper = styled(TabWrapper)(() => css``)

const Footer = styled.div(
  ({ theme }) => css`
    display: flex;
    align-items: center;
    justify-content: center;
    height: ${theme.space['8']};
    border-top: 1px solid ${theme.colors.border};
  `,
)

const NoMoreResultsContainer = styled.div(
  ({ theme }) => css`
    padding: ${theme.space['2']};
    display: flex;
    align-items: center;
    justify-content: center;
    height: ${theme.space['15']};
  `,
)

const AddSubnamesCard = styled(Card)(
  ({ theme }) => css`
    padding: ${theme.space['6']};
    flex-direction: column;
    text-align: center;
    gap: ${theme.space['4']};

    & > button {
      width: 100%;
    }

    ${mq.sm.min(css`
      flex-direction: row;
      text-align: left;
      & > button {
        width: min-content;
      }
    `)}
  `,
)

const PlusPrefix = styled.svg(
  ({ theme }) => css`
    display: block;
    stroke-width: ${theme.space['0.75']};
    height: ${theme.space['5']};
    width: ${theme.space['5']};
  `,
)

const SpinnerContainer = styled.div<{ $showBorder?: boolean }>(
  ({ theme, $showBorder }) => css`
    display: flex;
    align-items: center;
    justify-content: center;
    height: ${theme.space['15']};
    ${$showBorder && `border-top: 1px solid ${theme.colors.border};`}
  `,
)

export const SubnamesTab = ({
  name,
  network,
  canEdit,
  canCreateSubdomains,
  isWrapped,
}: {
  name: string
  network: number
  canEdit: boolean
  canCreateSubdomains: boolean
  isWrapped: boolean
}) => {
  const { t } = useTranslation('profile')
  const { address } = useAccount()
  const { prepareDataInput } = useTransactionFlow()
  const showCreateSubnameInput = prepareDataInput('CreateSubname')

  const [sortType, setSortType] = useQueryParameterState<SubnameSortType>('sort', 'creationDate')
  const [sortDirection, setSortDirection] = useQueryParameterState<SortDirection>(
    'direction',
    'desc',
  )
  const [searchQuery, setSearchQuery] = useQueryParameterState<string>('search', '')
  const debouncedSetSearch = useDebouncedCallback(setSearchQuery, 500)
  const [searchInput, setSearchInput] = useState(searchQuery)

  const { subnames, isLoading, isFetching, fetchNextPage, hasNextPage } = useSubnameInfiniteQuery(
    name,
    sortType,
    sortDirection,
    searchQuery,
  )

  const [isIntersecting, setIsIntersecting] = useState(false)
  useEffect(() => {
    if (isIntersecting && hasNextPage && !isFetching) {
      fetchNextPage()
    }
  }, [isIntersecting, fetchNextPage, hasNextPage, isFetching])

  const createSubname = () =>
    showCreateSubnameInput(`make-subname-${name}`, {
      parent: name,
      isWrapped,
    })

  let InnerContent: ReactNode
  if (isLoading) {
    InnerContent = (
      <SpinnerContainer>
        <Spinner size="small" color="accent" />
      </SpinnerContainer>
    )
  } else if (subnames.length === 0 && searchQuery === '') {
    InnerContent = (
      <NoMoreResultsContainer>{t('details.tabs.subnames.empty')}</NoMoreResultsContainer>
    )
  } else if (subnames.length === 0) {
    InnerContent = (
      <NoMoreResultsContainer>{t('details.tabs.subnames.noResults')}</NoMoreResultsContainer>
    )
  } else if (subnames.length > 0) {
    InnerContent = (
      <InfiniteScrollContainer onIntersectingChange={setIsIntersecting}>
        <div>
          {subnames.map((subname) => (
            <TaggedNameItem
              key={subname.name}
              name={subname.name}
              truncatedName={subname.truncatedName}
              network={network}
              mode="view"
              isController={
                subname.type === 'domain' && subname.owner
                  ? subname.owner === address?.toLowerCase()
                  : undefined
              }
              isWrappedOwner={
                subname.type === 'wrappedDomain' && subname.owner
                  ? subname.owner === address?.toLowerCase()
                  : undefined
              }
              notOwned={!subname.owner || subname.owner === emptyAddress}
              fuses={subname.fuses}
              pccExpired={subname.pccExpired}
              expiryDate={subname.expiryDate}
            />
          ))}
        </div>
        {isFetching && (
          <SpinnerContainer $showBorder>
            <Spinner size="small" color="accent" />
          </SpinnerContainer>
        )}
      </InfiniteScrollContainer>
    )
  } else {
    InnerContent = `${subnames.length}`
  }

  return (
    <TabWrapperWithButtons>
      {canEdit && (
        <AddSubnamesCard>
          <Typography>
            {t('details.tabs.subnames.addSubname.title')}{' '}
            <Outlink href="https://support.ens.domains/docs/faq/manager/managing-names#what-is-the-difference-between-a-name-and-a-subname">
              {t('details.tabs.subnames.addSubname.learn')}
            </Outlink>
          </Typography>
          {canCreateSubdomains ? (
            <Button
              data-testid="add-subname-action"
              onClick={createSubname}
              prefix={<PlusPrefix as={PlusSVG} />}
            >
              {t('details.tabs.subnames.addSubname.action')}
            </Button>
          ) : (
            <DisabledButtonWithTooltip
              {...{
                size: 'medium',
                buttonId: 'add-subname-disabled-button',
                content: t('errors.permissionRevoked'),
                buttonText: t('details.tabs.subnames.addSubname.action'),
                mobileWidth: 200,
                mobilePlacement: 'top',
                prefix: <PlusPrefix as={PlusSVG} />,
              }}
            />
          )}
        </AddSubnamesCard>
      )}
      <StyledTabWrapper>
        <NameTableHeader
          selectable={false}
          sortType={sortType}
          sortTypeOptionValues={['creationDate', 'labelName']}
          sortDirection={sortDirection}
          searchQuery={searchInput}
          mode="view"
          onSortTypeChange={(value: SortType) => {
            if (['creationDate', 'labelName'].includes(value)) setSortType(value as SubnameSortType)
          }}
          onSortDirectionChange={setSortDirection}
          onSearchChange={(s) => {
            setSearchInput(s)
            debouncedSetSearch(s)
          }}
        />
        <div>{InnerContent}</div>
        <Footer />
      </StyledTabWrapper>
    </TabWrapperWithButtons>
  )
}
