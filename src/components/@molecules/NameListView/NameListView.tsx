import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

import { Heading } from '@ensdomains/thorin'

import { TaggedNameItem } from '@app/components/@atoms/NameDetailItem/TaggedNameItem'
import { TabWrapper } from '@app/components/pages/profile/TabWrapper'
import type { ReturnedName } from '@app/hooks/useNamesFromAddress'

const NoResultsContianer = styled.div(
  ({ theme }) => css`
    display: flex;
    justify-content: center;
    padding: ${theme.space['4']};
  `,
)

export const NameListView = ({
  currentPage,
  network,
  mode,
  rowsOnly = false,
  selectedNames = [],
  onSelectedNamesChange,
}: {
  currentPage: ReturnedName[]
  network: number
  mode?: 'select' | 'view'
  rowsOnly?: boolean
  selectedNames?: string[]
  onSelectedNamesChange?: (data: string[]) => void
}) => {
  const { t } = useTranslation('common')

  const handleClickForName = (name: string) => () => {
    if (selectedNames?.includes(name)) {
      onSelectedNamesChange?.(selectedNames.filter((n) => n !== name))
    } else {
      onSelectedNamesChange?.([...selectedNames, name])
    }
  }

  const InnerContent =
    !currentPage || currentPage.length === 0 ? (
      <NoResultsContianer>
        <Heading as="h3">{t('errors.noResults')}</Heading>
      </NoResultsContianer>
    ) : (
      currentPage.map((name) => (
        <TaggedNameItem
          key={name.id}
          {...{ ...name, network }}
          mode={mode}
          selected={selectedNames?.includes(name.name)}
          onClick={handleClickForName(name.name)}
        />
      ))
    )

  if (rowsOnly) return <>{InnerContent}</>
  return <TabWrapper>{InnerContent}</TabWrapper>
}
