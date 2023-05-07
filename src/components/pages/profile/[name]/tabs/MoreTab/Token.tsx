import { BigNumber } from '@ethersproject/bignumber/lib/bignumber'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

import { labelhash } from '@ensdomains/ensjs/utils/labels'
import { namehash } from '@ensdomains/ensjs/utils/normalise'
import { Typography, mq } from '@ensdomains/thorin'

import { NFTWithPlaceholder } from '@app/components/NFTWithPlaceholder'
import { Outlink } from '@app/components/Outlink'
import RecordItem from '@app/components/RecordItem'
import { useChainId } from '@app/hooks/useChainId'
import { useChainName } from '@app/hooks/useChainName'
import { useContractAddress } from '@app/hooks/useContractAddress'
import { makeEtherscanLink } from '@app/utils/utils'

import { TabWrapper } from '../../../TabWrapper'

const Container = styled(TabWrapper)(
  ({ theme }) => css`
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: center;
    gap: ${theme.space['4']};
    padding: ${theme.space['4']};

    ${mq.sm.min(css`
      padding: ${theme.space['6']};
    `)}
  `,
)

const HeaderContainer = styled.div(
  ({ theme }) => css`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;

    & > div:first-of-type {
      font-size: ${theme.fontSizes.headingThree};
      font-weight: ${theme.fontWeights.bold};
    }
  `,
)

const IdsContainer = styled.div(
  ({ theme }) => css`
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: center;
    gap: ${theme.space['4']};

    ${mq.sm.min(css`
      gap: ${theme.space['2']};
    `)}
  `,
)

const ItemsContainer = styled.div(
  ({ theme }) => css`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: ${theme.space['4']};

    overflow: hidden;

    ${mq.sm.min(css`
      flex-direction: row;
    `)}
  `,
)

const NftBox = styled(NFTWithPlaceholder)(
  ({ theme }) => css`
    max-width: 100%;
    aspect-ratio: 1;

    ${mq.sm.min(css`
      max-width: ${theme.space['36']};
      max-height: ${theme.space['36']};
    `)}
  `,
)

const Token = ({ name, isWrapped }: { name: string; isWrapped: boolean }) => {
  const { t } = useTranslation('profile')

  const network = useChainId()
  const networkName = useChainName()

  const hex = isWrapped ? namehash(name) : labelhash(name.split('.')[0])
  const tokenId = BigNumber.from(hex).toString()

  const wrapperAddress = useContractAddress('NameWrapper')
  const registrarAddress = useContractAddress('BaseRegistrarImplementation')

  const contractAddress = isWrapped ? wrapperAddress : registrarAddress

  return (
    <Container>
      <HeaderContainer>
        <Typography>{t('tabs.more.token.label')}</Typography>
        <Outlink
          data-testid="etherscan-nft-link"
          href={makeEtherscanLink(`${contractAddress}/${tokenId}`, networkName, 'token')}
        >
          {t('Block Explorer', { ns: 'common' })}
        </Outlink>
      </HeaderContainer>
      <ItemsContainer>
        <IdsContainer>
          <RecordItem itemKey={t('tabs.more.token.hex')} value={hex} type="text" />
          <RecordItem itemKey={t('tabs.more.token.decimal')} value={tokenId} type="text" />
        </IdsContainer>
        <NftBox id="nft" name={name} network={network} />
      </ItemsContainer>
    </Container>
  )
}

export default Token
