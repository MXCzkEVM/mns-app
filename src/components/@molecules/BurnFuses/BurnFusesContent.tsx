import isEqual from 'lodash/isEqual'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

import type { ChildFuses } from '@ensdomains/ensjs'
import { childFuseKeys } from '@ensdomains/ensjs/utils/fuses'
import { Button, FlameSVG, Helper, Typography, mq } from '@ensdomains/thorin'

import { Spacer } from '@app/components/@atoms/Spacer'
import { AllChildFuses } from '@app/types'

export const childFuseObj = Object.fromEntries(
  childFuseKeys.map((key) => [key, false]),
) as ChildFuses['current']

const FusesContainer = styled.div(({ theme }) => [
  css`
    width: 100%;
    padding: ${theme.space['1.25']} ${theme.space['4']};
  `,
  mq.sm.min(css`
    min-width: ${theme.space['112']};
  `),
])

const BurnButtonsContainer = styled.div(
  ({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.space['2.5']};
  `,
)

const ButtonInner = styled.div(
  () => css`
    display: flex;
    justify-content: space-between;
    width: 100%;
    align-items: center;
  `,
)

const StyledFlameSVG = styled(FlameSVG)(
  ({ theme }) => css`
    position: relative;
    bottom: -${theme.space.px};
    right: ${theme.space.px};
  `,
)

const BurnedFlameContainer = styled.div<{ $isBurned: boolean }>(
  ({ theme, $isBurned }) => css`
    background: ${theme.colors.greyPrimary};
    color: ${theme.colors.textSecondary};
    border-radius: ${theme.space['2.5']};
    display: flex;
    align-items: center;
    padding: ${theme.space.px} ${theme.space['2.5']};

    ${$isBurned &&
    `
      position: absolute;
      right: ${theme.space['1.5']};  
      z-index: 1;
    `}
  `,
)

const BurnedStyledFlameSVG = styled(FlameSVG)(
  ({ theme }) => css`
    position: relative;
    right: -${theme.space['2']};
    bottom: -${theme.space.px};
    color: black;
  `,
)

const StyledButton = styled(Button)(
  ({ theme }) => css`
    padding: ${theme.space['0']} -${theme.space['1.5']};
  `,
)

const BurnButton = ({
  permission,
  isBurned,
  handleBurnClick,
  isSelected,
}: {
  permission: ChildFuses['fuse']
  isBurned: boolean
  handleBurnClick: (permission: ChildFuses['fuse']) => void
  isSelected: boolean
}) => {
  const { t } = useTranslation('profile', { keyPrefix: 'tabs.more.fuses' })

  return (
    <StyledButton
      onClick={() => handleBurnClick(permission)}
      disabled={isBurned}
      colorStyle={isSelected ? 'redSecondary' : 'greySecondary'}
      size="small"
      suffix={
        isSelected ? (
          <FlameSVG width="24" height="24" data-testid={`flame-selected-${permission}`} />
        ) : (
          <StyledFlameSVG width="24" height="24" />
        )
      }
    >
      <ButtonInner data-testid={`burn-button-${permission}`}>
        <Typography>{t(`permissions.${permission}`)}</Typography>
        {isBurned && (
          <BurnedFlameContainer $isBurned={isBurned}>
            <Typography>{t('burned')}</Typography>
            <BurnedStyledFlameSVG width="24" height="24" />
          </BurnedFlameContainer>
        )}
      </ButtonInner>
    </StyledButton>
  )
}

const ButtonsContainer = styled.div(
  ({ theme }) => css`
    display: flex;
    gap: ${theme.space['4']};
  `,
)

const canContinue = (
  fuseData: ChildFuses['options'],
  fuseSelected: ChildFuses['options'],
  canUnsetFuse: boolean,
) => {
  const filteredInitialFuseData: ChildFuses['options'] = { ...fuseData }
  Object.keys(filteredInitialFuseData).forEach((key: string) => {
    if (filteredInitialFuseData[key as ChildFuses['fuse']]) {
      delete filteredInitialFuseData[key as ChildFuses['fuse']]
    }
  })
  const cannotUnwrap = !fuseData.CANNOT_UNWRAP && !fuseSelected.CANNOT_UNWRAP
  if (canUnsetFuse) {
    if (Object.values(fuseSelected).some((val) => val) && !fuseSelected.CANNOT_UNWRAP) return true
    return false
  }
  return isEqual(filteredInitialFuseData, fuseSelected) || cannotUnwrap
}

type BaseProps = {
  fuseData: AllChildFuses | undefined
  onDismiss: () => void
  canUnsetFuse?: boolean
  returnObject?: boolean
}

type PropsWithReturnObject = BaseProps & {
  returnObject: true
  onSubmit: (fuses: ChildFuses['current']) => void
}

type PropsWithReturnArray = BaseProps & {
  returnObject?: never
  onSubmit: (fuses: ChildFuses['fuse'][], fuseNames: string[]) => void
}

const BurnFusesContent = ({
  fuseData,
  onDismiss,
  onSubmit,
  canUnsetFuse = false,
  returnObject,
}: PropsWithReturnArray | PropsWithReturnObject) => {
  const { t } = useTranslation('profile', { keyPrefix: 'tabs.more' })
  const { t: tc } = useTranslation()
  const [_fuseData, setFuseData] = useState<AllChildFuses>(childFuseObj)
  const [fuseSelected, setFuseSelected] = useState<ChildFuses['options']>(childFuseObj)

  const handleBurnClick = (permission: ChildFuses['fuse']) => {
    const nextFuseSelected = { ...fuseSelected } as ChildFuses['options']
    nextFuseSelected[permission] = !nextFuseSelected[permission]
    setFuseSelected(nextFuseSelected)
  }

  const _onSubmit = () => {
    if (returnObject) {
      return onSubmit({ ...fuseData, ...fuseSelected } as ChildFuses['current'])
    }

    const selectedFuses = Object.keys(fuseSelected).filter(
      (key) => fuseSelected[key as ChildFuses['fuse']],
    ) as ChildFuses['fuse'][]

    const permissions = selectedFuses.map((key) => t(`fuses.permissions.${key}`))

    onSubmit(selectedFuses, permissions)
  }

  useEffect(() => {
    if (fuseData) {
      setFuseData(fuseData)

      const initialFusesSelected = Object.fromEntries(
        Object.entries({
          ...fuseData,
        }).filter(([, val]) => !val),
      )
      if (!canUnsetFuse) setFuseSelected(initialFusesSelected)
      else setFuseSelected(fuseData)
    }
  }, [fuseData, canUnsetFuse])

  if (!_fuseData) return null

  return (
    <FusesContainer>
      <Typography fontVariant="headingFour">{t('fuses.burnFormTitle')}</Typography>
      {!_fuseData.CANNOT_UNWRAP && !fuseSelected.CANNOT_UNWRAP ? (
        <>
          <Spacer $height="1" />
          <Helper type="info" style={{ textAlign: 'center' }}>
            <Typography>{t('fuses.info')}</Typography>
          </Helper>
        </>
      ) : (
        ''
      )}
      <Spacer $height="4" />
      <BurnButtonsContainer>
        {Object.entries(_fuseData).map(([key, value]) => (
          <BurnButton
            {...{
              permission: key as ChildFuses['fuse'],
              isBurned: !!value && !canUnsetFuse,
              handleBurnClick,
              isSelected: !!fuseSelected[key as ChildFuses['fuse']],
            }}
          />
        ))}
      </BurnButtonsContainer>
      <Spacer $height="6" />
      <ButtonsContainer>
        <Button colorStyle="accentSecondary" onClick={onDismiss}>
          {tc('action.cancel')}
        </Button>
        <Button
          disabled={canContinue(_fuseData, fuseSelected, canUnsetFuse)}
          onClick={_onSubmit}
          color="red"
          data-testid="burn-form-continue"
        >
          {canUnsetFuse ? tc('action.confirm') : tc('action.burnSelected')}
        </Button>
      </ButtonsContainer>
    </FusesContainer>
  )
}

export default BurnFusesContent
