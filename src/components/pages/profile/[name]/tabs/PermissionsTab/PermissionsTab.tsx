import { Trans, useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

import { Banner } from '@ensdomains/thorin'

import BaseLink from '@app/components/@atoms/BaseLink'
import { CacheableComponent } from '@app/components/@atoms/CacheableComponent'
import { useFusesStates } from '@app/hooks/fuses/useFusesStates'
import { useGetFusesSetDates } from '@app/hooks/fuses/useGetFusesSetDates'
import { useBasicName } from '@app/hooks/useBasicName'
import { useEns } from '@app/utils/EnsProvider'

import { ExpiryPermissions } from './ExpiryPermissions'
import { NameChangePermissions } from './NameChangePermissions'
import { OwnershipPermissions } from './OwnershipPermissions'

type GetWrapperDataFunc = ReturnType<typeof useEns>['getWrapperData']
type WrapperData = Awaited<ReturnType<GetWrapperDataFunc>>

type Props = {
  name: string
  wrapperData: WrapperData
  isCached: boolean
}

const Container = styled(CacheableComponent)(
  ({ theme }) => css`
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: center;
    width: 100%;
    gap: ${theme.space['4']};
  `,
)

export const PermissionsTab = ({ name, wrapperData, isCached: isBasicCached }: Props) => {
  const { t } = useTranslation('profile')

  const nameParts = name.split('.')
  const parentName = nameParts.slice(1).join('.')

  const is2LDEth = nameParts.length === 2 && nameParts[1] === 'mxc'
  const isValidParent = parentName.split('.').length > 1
  const isSubname = nameParts.length > 2

  const validParentName = isValidParent ? parentName : ''
  const { wrapperData: parentWrapperData, isCachedData: _isParentBasicCachedData } = useBasicName(
    validParentName,
    false,
  )
  const isParentBasicCachedData = isValidParent && _isParentBasicCachedData

  const { fusesSetDates } = useGetFusesSetDates(name)
  const fusesStatus = useFusesStates({
    wrapperData,
    parentWrapperData,
  })

  const showUnwrapWarning =
    isSubname && fusesStatus.isUserParentOwner && fusesStatus.parentState !== 'locked'

  const isCached = isBasicCached || isParentBasicCachedData
  return (
    <Container $isCached={isCached}>
      {showUnwrapWarning && (
        <BaseLink href={`/${parentName}?tab=permissions`} passHref>
          <Banner alert="warning" as="a" data-testid="banner-parent-not-locked">
            <Trans
              t={t}
              i18nKey="tabs.permissions.parentUnlockedWarning"
              values={{ parent: parentName }}
            />
          </Banner>
        </BaseLink>
      )}
      <OwnershipPermissions
        name={name}
        wrapperData={wrapperData}
        parentWrapperData={parentWrapperData}
        fusesSetDates={fusesSetDates}
        {...fusesStatus}
      />
      {!is2LDEth && (
        <ExpiryPermissions
          name={name}
          wrapperData={wrapperData}
          fusesSetDates={fusesSetDates}
          {...fusesStatus}
        />
      )}
      <NameChangePermissions
        name={name}
        wrapperData={wrapperData}
        fusesSetDates={fusesSetDates}
        {...fusesStatus}
      />
    </Container>
  )
}
