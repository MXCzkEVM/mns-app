import { BigNumber } from '@ethersproject/bignumber/lib/bignumber'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

import { Helper, mq } from '@ensdomains/thorin'

const InnerContainer = styled.div(
  ({ theme }) => css`
    position: relative;

    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: center;
    gap: ${theme.space['4']};
  `,
)

const calcPercent = (percent: number, order: number) => {
  const padding = 10
  const orderPercent = (1 / 3) * order
  const minimumBarrier = Math.max(100 * ((1 / 3) * (order - 1)) + padding, padding)
  const maximumBarrier = Math.min(100 * orderPercent - padding, 100 - padding)
  return Math.min(Math.max((100 - percent * 0.9) * orderPercent, minimumBarrier), maximumBarrier)
}

// background: linear-gradient(
//   90deg,
//   ${theme.colors.blue} var(--bar-width),
//   ${theme.colors.red} var(--bar-width)
// );
const Bar = styled.div<{ $highlightPercent: number }>(
  ({ theme, $highlightPercent }) => css`
    --bar-width: calc(${$highlightPercent}% - ${theme.space['1']});
    background: linear-gradient(90deg, #2196F3 var(--bar-width), #b63d29 var(--bar-width));
    width: 100%;
    height: ${theme.space['4']};
    border-radius: ${theme.radii.medium};
    margin-bottom: ${theme.space['11']};
  `,
)

// &:last-of-type background-color: ${theme.colors.blue};
const Marker = styled.div<{ $percent: number }>(
  ({ theme, $percent }) => css`
    position: absolute;
    transform-style: preserve-3d;
    bottom: 0;
    left: ${$percent}%;
    transform: translateX(-50%);

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: ${theme.space['1']};

    width: ${theme.space['16']};
    height: ${theme.space['10']};
    padding: 0 ${theme.space['2']};

    border-radius: ${theme.radii.medium};
    background-color: ${theme.colors.background};
    &:last-of-type {
      background-color: #2196F3;
      color: ${theme.colors.background};
    }

    font-size: ${theme.fontSizes.extraSmall};
    line-height: ${theme.lineHeights.extraSmall};

    b {
      display: block;
      white-space: nowrap;
    }

    :not(b) {
      white-space: nowrap;
    }

    ${mq.xs.min(css`
      width: ${theme.space['18']};
      font-size: ${theme.fontSizes.small};
    `)}

    &::before {
      content: '';

      position: absolute;
      transform: translateZ(-1px);
      bottom: ${theme.space['9']};

      height: ${theme.space['7']};
      width: ${theme.space['1']};

      outline: ${theme.space['0.5']} solid ${theme.colors.blueSurface};

      border-radius: ${theme.radii.medium};
      background-color: inherit;
    }
  `,
)

type Props = {
  rentFee: BigNumber
  transactionFee: BigNumber
  message?: string
}

const unit = 1e12

const yearsToGasPercent = (targetYears: number, f: BigNumber, y: BigNumber) => {
  const gasPercent = f.mul(unit).div(y.mul(targetYears).add(f))
  return Math.round((gasPercent.toNumber() / unit) * 100)
}

const gasPercentToYears = (targetPercent: number, f: BigNumber, y: BigNumber, min: number) => {
  const fp = f.div(100)
  const yp = y.div(100)
  const p = BigNumber.from(targetPercent)
  const top = f.sub(fp.mul(p)).mul(unit)
  const bottom = yp.mul(p)
  const years = top.div(bottom).div(unit).toNumber()
  const rounded = Math.max(Math.round(years), min)
  const gasPercent = yearsToGasPercent(rounded, f, y)
  return { gas: gasPercent, years: rounded }
}

export const RegistrationTimeComparisonBanner = ({ message, rentFee, transactionFee }: Props) => {
  const { t } = useTranslation('common')
  const oneYearGasPercent = yearsToGasPercent(1, transactionFee, rentFee)
  const forty = gasPercentToYears(40, transactionFee, rentFee, 2)
  const twenty = gasPercentToYears(20, transactionFee, rentFee, 5)

  const twentyRounded = calcPercent(twenty.gas, 3)

  return (
    <Helper className='helpbox' type="info">
      <InnerContainer>
        <div>{message}</div>
        <Bar $highlightPercent={twentyRounded} />
        <Marker data-testid="year-marker-0" $percent={calcPercent(oneYearGasPercent, 1)}>
          <b>{t('unit.years', { count: 1 })}</b>
          {t('unit.gas', { value: `${oneYearGasPercent}%` })}
        </Marker>
        <Marker data-testid="year-marker-1" $percent={calcPercent(forty.gas, 2)}>
          <b>{t('unit.years', { count: forty.years })}</b>
          {t('unit.gas', { value: `${forty.gas}%` })}
        </Marker>
        <Marker data-testid="year-marker-2" $percent={twentyRounded}>
          <b>{t('unit.years', { count: twenty.years })}</b>
          {t('unit.gas', { value: `${twenty.gas}%` })}
        </Marker>
      </InnerContainer>
    </Helper>
  )
}
