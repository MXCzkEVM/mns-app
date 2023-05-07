import ISO6391 from 'iso-639-1'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'
import { useFeeData } from 'wagmi'

import {
  // CurrencyToggle,
  LanguageSVG,
  RightChevronSVG,
  Spinner,
  Typography, // WalletSVG,
  mq,
} from '@ensdomains/thorin'

import { useChainName } from '@app/hooks/useChainName'
import { useGraphOutOfSync } from '@app/utils/SyncProvider'
import { makeDisplay } from '@app/utils/currency'

const Container = styled.div(
  ({ theme }) => css`
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: flex-start;
    background-color: ${theme.colors.background};

    padding: ${theme.space['4']};
    gap: ${theme.space['2']};

    ${mq.sm.min(css`
      padding: 0;
      gap: 0;
      & > div {
        border-bottom: 1px solid ${theme.colors.border};
      }

      & > div:last-child {
        border-bottom: none;
      }
    `)}
  `,
)

const SettingsSection = styled.div(
  ({ theme }) => css`
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: flex-start;
    padding: 0;
    margin-bottom: ${theme.space['2']};
    gap: ${theme.space['2']};

    ${mq.sm.min(css`
      padding: ${theme.space['2']};
      margin: 0;
      gap: 0;
    `)}
  `,
)

const SettingsItem = styled.div(
  ({ theme }) => css`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;

    padding: ${theme.space['4']};
    height: ${theme.space['13']};

    border-radius: ${theme.radii.large};
    border: 1px solid ${theme.colors.border};

    & > div:first-child {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: flex-start;
      gap: ${theme.space['2']};

      svg {
        display: block;
      }
    }

    ${mq.sm.min(css`
      border: none;
    `)}
  `,
)

const HoverableSettingsItem = styled(SettingsItem)(
  ({ theme }) => css`
    transition: all 0.1s ease-in-out;
    cursor: pointer;

    & > div:last-child {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: flex-end;
      gap: ${theme.space['1']};

      svg {
        width: ${theme.space['3']};
        height: ${theme.space['3']};
        display: block;
      }
    }

    &:hover {
      background-color: ${theme.colors.greySurface};
    }
  `,
)

const miscSectionStyle = css(
  ({ theme }) => css`
    background-color: ${theme.colors.greySurface};
    border-radius: ${theme.radii.large};

    ${mq.sm.min(css`
      background-color: transparent;
      border-radius: none;
    `)}
  `,
)

const NetworkSectionContainer = styled.div(
  ({ theme }) => css`
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: ${theme.space['2']};
    padding: ${theme.space['2']};

    #chain-name {
      text-transform: capitalize;
    }

    ${mq.sm.min(css`
      padding: ${theme.space['4']} ${theme.space['6']};
    `)}
  `,
  miscSectionStyle,
)

const NetworkSectionRow = styled.div(
  ({ theme }) => css`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: ${theme.space['2']};
    text-align: center;
  `,
)

const NetworkSection = () => {
  const { t } = useTranslation('common')
  const graphOutOfSync = useGraphOutOfSync()
  const chainName = useChainName()
  const feeData = useFeeData()

  return (
    <NetworkSectionContainer>
      <NetworkSectionRow>
        {graphOutOfSync && <Spinner color="accent" />}
        <Typography id="chain-name" weight="bold" color="text">
          {chainName}
        </Typography>
        {feeData?.data?.maxFeePerGas && (
          <Typography color="grey">
            {makeDisplay(feeData?.data?.maxFeePerGas, undefined, 'Gwei', 9)}
          </Typography>
        )}
      </NetworkSectionRow>
      {graphOutOfSync && (
        <NetworkSectionRow>
          <Typography fontVariant="small">{t('navigation.syncMessage')}</Typography>
        </NetworkSectionRow>
      )}
    </NetworkSectionContainer>
  )
}

const MainMenu = ({ setCurrentView }: { setCurrentView: (view: 'main' | 'language') => void }) => {
  const { t, i18n } = useTranslation('common')
  const language = i18n.resolvedLanguage || 'en'
  // const { userConfig, setCurrency } = useUserConfig()

  return (
    <Container>
      <SettingsSection>
        <HoverableSettingsItem onClick={() => setCurrentView('language')}>
          <div>
            <LanguageSVG />
            <Typography weight="bold">{t('navigation.language')}</Typography>
          </div>
          <div>
            <Typography>
              {ISO6391.getNativeName(language)} ({language.toLocaleUpperCase()})
            </Typography>
            <RightChevronSVG />
          </div>
        </HoverableSettingsItem>
      </SettingsSection>
      <NetworkSection />
    </Container>
  )
}

export default MainMenu
