import { isAddress } from '@ethersproject/address'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

import { RecordItem, Typography } from '@ensdomains/thorin'

import { DynamicAddressIcon } from '@app/assets/address/DynamicAddressIcon'
import { dynamicAddressIcons } from '@app/assets/address/dynamicAddressIcons'
import { DynamicSocialIcon, socialIconTypes } from '@app/assets/social/DynamicSocialIcon'
import { usePrimary } from '@app/hooks/usePrimary'
import { getDestination } from '@app/routes'
import { useBreakpoint } from '@app/utils/BreakpointProvider'
import { getSocialData } from '@app/utils/getSocialData'
import { shortenAddress } from '@app/utils/utils'

const StyledAddressIcon = styled(DynamicAddressIcon)(
  ({ theme }) => css`
    width: ${theme.space['5']};
    height: ${theme.space['5']};
  `,
)

export const SocialProfileButton = ({ iconKey, value }: { iconKey: string; value: string }) => {
  const breakpoints = useBreakpoint()
  const socialData = getSocialData(iconKey, value)

  return socialData ? (
    <RecordItem
      as="a"
      icon={
        <DynamicSocialIcon
          fill={socialData.color}
          name={socialData.icon as keyof typeof socialIconTypes}
        />
      }
      size={breakpoints.sm ? 'large' : 'small'}
      inline
      data-testid={`social-profile-button-${iconKey}`}
      value={socialData.value}
      link={socialData.type === 'link' ? socialData.urlFormatter : undefined}
    >
      {socialData.value}
    </RecordItem>
  ) : null
}

export const AddressProfileButton = ({
  iconKey: _iconKey,
  value,
}: {
  iconKey: string
  value: string
}) => {
  const breakpoints = useBreakpoint()
  const iconKey = _iconKey.toLowerCase()

  return iconKey in dynamicAddressIcons ? (
    <RecordItem
      data-testid={`address-profile-button-${iconKey}`}
      icon={<StyledAddressIcon name={iconKey} />}
      value={value}
      size={breakpoints.sm ? 'large' : 'small'}
      inline
    >
      {shortenAddress(
        value,
        undefined,
        breakpoints.sm ? undefined : 4,
        breakpoints.sm ? undefined : 3,
      )}
    </RecordItem>
  ) : null
}

const OtherContainer = styled.div(
  ({ theme }) => css`
    background-color: ${theme.colors.greyPrimary};
    padding: 0 ${theme.space['1.25']};
    border-radius: ${theme.radii.checkbox};
    height: ${theme.space['5']};
    display: flex;
    align-items: center;
  `,
)

const OtherContainerAddressPrefix = styled(Typography)(
  ({ theme }) => css`
    color: ${theme.colors.backgroundPrimary};
    font-size: ${theme.fontSizes.extraSmall};
  `,
)

const OtherContainerTextPrefix = styled(Typography)(
  ({ theme }) => css`
    padding-left: ${theme.space['0.5']};
  `,
)

export const OtherProfileButton = ({
  iconKey,
  value,
  type = 'text',
}: {
  iconKey: string
  value: string
  type?: 'text' | 'address'
}) => {
  const breakpoints = useBreakpoint()
  const isLink = value?.startsWith('http://') || value?.startsWith('https://')

  const formattedValue = useMemo(() => {
    if (breakpoints.sm) {
      if (type === 'address') {
        return shortenAddress(value)
      }
      return value?.length > 15 ? `${value.slice(0, 15)}...` : value
    }
    return value?.length > 5 ? `${value.slice(0, 5)}...` : value
  }, [type, value, breakpoints])

  const linkProps = useMemo(() => {
    if (!isLink) return {}
    return {
      as: 'a',
      link: value,
    } as const
  }, [value, isLink])

  return (
    <RecordItem
      {...linkProps}
      value={value}
      inline
      size={breakpoints.sm ? 'large' : 'small'}
      keyLabel={
        type === 'address' ? (
          <OtherContainer>
            <OtherContainerAddressPrefix fontVariant="extraSmall">
              {iconKey}
            </OtherContainerAddressPrefix>
          </OtherContainer>
        ) : (
          <OtherContainerTextPrefix color="grey">{iconKey}</OtherContainerTextPrefix>
        )
      }
      data-testid={`other-profile-button-${iconKey}`}
    >
      {formattedValue}
    </RecordItem>
  )
}

export const OwnerProfileButton = ({
  iconKey: label,
  value: addressOrNameOrDate,
  timestamp,
}: {
  iconKey: string
  value: string
  timestamp?: number
}) => {
  const { t } = useTranslation('common')
  const breakpoints = useBreakpoint()

  const dataType = useMemo(() => {
    if (!addressOrNameOrDate)
      // eslint-disable-next-line no-nested-ternary
      return label === 'name.expiry'
        ? 'noExpiry'
        : label === 'name.parent'
        ? 'noParent'
        : 'notOwned'
    if (label === 'name.expiry') return 'expiry'
    if (isAddress(addressOrNameOrDate)) return 'address'
    const isTLD = addressOrNameOrDate.split('.').length === 1
    return isTLD ? 'tld' : 'name'
  }, [addressOrNameOrDate, label])

  const { name: primary, beautifiedName } = usePrimary(addressOrNameOrDate, dataType !== 'address')

  const recordItemPartialProps = useMemo(() => {
    const base = {
      keyLabel: t(label).toLocaleLowerCase(),
      value: addressOrNameOrDate,
      target: undefined,
      as: 'button',
    } as const
    if (dataType === 'expiry')
      return {
        ...base,
        link: undefined,
        children: addressOrNameOrDate,
      } as const
    if (dataType === 'noExpiry')
      return {
        ...base,
        link: undefined,
        children: t('name.noExpiry').toLocaleLowerCase(),
      } as const
    if (dataType === 'notOwned')
      return {
        ...base,
        link: undefined,
        children: t('name.notOwned').toLocaleLowerCase(),
      } as const
    if (dataType === 'noParent')
      return { ...base, link: undefined, children: t('name.noParent').toLocaleLowerCase() }
    if (dataType === 'address')
      return {
        ...base,
        as: 'a',
        link: primary
          ? (getDestination(`/profile/${primary}`) as string)
          : (getDestination(`/address/${addressOrNameOrDate}`) as string),
        children:
          beautifiedName ||
          (breakpoints.sm ? shortenAddress(addressOrNameOrDate) : addressOrNameOrDate.slice(0, 5)),
      } as const
    return {
      ...base,
      as: 'a',
      link: getDestination(`/profile/${addressOrNameOrDate}`) as string,
      children: addressOrNameOrDate,
    } as const
  }, [dataType, addressOrNameOrDate, label, breakpoints, primary, beautifiedName, t])

  return (
    <RecordItem
      {...recordItemPartialProps}
      data-testid={`owner-profile-button-${label}`}
      data-timestamp={timestamp}
      inline
      size={breakpoints.sm ? 'large' : 'small'}
    />
  )
}
