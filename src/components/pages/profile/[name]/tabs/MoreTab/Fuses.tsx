import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

import { ChildFuses, ParentFuses, userSettableFuseEnum } from '@ensdomains/ensjs/utils/fuses'
import { Helper, Typography, mq } from '@ensdomains/thorin'

import { cacheableComponentStyles } from '@app/components/@atoms/CacheableComponent'
import { Spacer } from '@app/components/@atoms/Spacer'
import { TrafficLight } from '@app/components/TrafficLight'
import { useTransactionFlow } from '@app/transaction-flow/TransactionFlowProvider'

import { TabWrapper } from '../../../TabWrapper'

const FusesContainer = styled(TabWrapper)(
  cacheableComponentStyles,
  () => css`
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: flex-start;
  `,
)

const HeadingContainer = styled.div(
  ({ theme }) => css`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;

    padding: ${theme.space['4']};

    border-bottom: ${theme.borderWidths.px} ${theme.borderStyles.solid} ${theme.colors.border};

    & > button {
      color: ${theme.colors.accent};
      font-weight: ${theme.fontWeights.bold};
      padding: 0 ${theme.space['2']};
    }

    ${mq.md.min(css`
      padding: ${theme.space['6']};
    `)}
  `,
)

const Heading = styled(Typography)(
  ({ theme }) => css`
    color: ${theme.colors.text};
    font-weight: ${theme.fontWeights.bold};
    font-size: ${theme.fontSizes.headingThree};
  `,
)

const FusesRow = styled.div(
  ({ theme }) => css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: ${theme.space['4']};

    &:not(:last-child) {
      border-bottom: ${theme.borderWidths.px} ${theme.borderStyles.solid} ${theme.colors.border};
    }

    ${mq.md.min(css`
      padding: ${theme.space['6']};
    `)}
  `,
)

const Fuses = ({
  name,
  fuseObj,
  canEdit,
  isCachedData,
}: {
  name: string
  fuseObj: ChildFuses['current'] & ParentFuses['current']
  canEdit: boolean
  isCachedData: boolean
}) => {
  const { t } = useTranslation('profile')

  const { prepareDataInput } = useTransactionFlow()
  const showBurnFusesInput = prepareDataInput('BurnFuses')
  const handleEditClick = () => {
    showBurnFusesInput(`burn-fuses-${name}`, {
      name,
    })
  }

  return (
    <FusesContainer $isCached={isCachedData}>
      {!fuseObj.PARENT_CANNOT_CONTROL && (
        <>
          <Helper type="warning">{t('tabs.more.fuses.permissions.warning')}</Helper>
          <Spacer $height="8" />
        </>
      )}
      <div>
        <HeadingContainer>
          <Heading>{t('tabs.more.fuses.permissions.label')}</Heading>
          {canEdit && (
            <button
              style={{ cursor: 'pointer' }}
              data-testid="edit-fuses-button"
              type="button"
              onClick={handleEditClick}
            >
              {t('action.edit', { ns: 'common' })}
            </button>
          )}
        </HeadingContainer>
        <div>
          {Object.entries(fuseObj)
            .filter(([key]) => key !== 'CAN_DO_EVERYTHING')
            .sort(
              (a, b) =>
                userSettableFuseEnum[a[0] as keyof typeof userSettableFuseEnum] -
                userSettableFuseEnum[b[0] as keyof typeof userSettableFuseEnum],
            )
            .map(([key, value], inx) => (
              <FusesRow key={key}>
                <Typography color="textSecondary" weight="bold">
                  {t(`tabs.more.fuses.permissions.${key}`)}
                </Typography>
                <TrafficLight
                  $go={!value}
                  data-testid={inx === 0 ? 'first-traffic-light' : undefined}
                />
              </FusesRow>
            ))}
        </div>
      </div>
    </FusesContainer>
  )
}

export default Fuses
