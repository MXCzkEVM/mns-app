import styled, { css } from 'styled-components'

import { CacheableComponent } from '@app/components/@atoms/CacheableComponent'
import { useNameDetails } from '@app/hooks/useNameDetails'
import useOwners from '@app/hooks/useOwners'
import { useSelfAbilities } from '@app/hooks/useSelfAbilities'
import { checkETH2LDFromName, validateExpiry } from '@app/utils/utils'

import Miscellaneous from './Miscellaneous'
import Ownership from './Ownership'
import Resolver from './Resolver'
import Token from './Token'

const MoreContainer = styled(CacheableComponent)(
  ({ theme }) => css`
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: center;
    width: 100%;

    gap: ${theme.space['4']};
  `,
)

type Props = {
  name: string
  nameDetails: ReturnType<typeof useNameDetails>
  selfAbilities: ReturnType<typeof useSelfAbilities>
}

const MoreTab = ({ name, nameDetails, selfAbilities }: Props) => {
  const {
    ownerData,
    wrapperData,
    dnsOwner,
    isWrapped,
    basicIsCachedData,
    profileIsCachedData,
    profile,
    expiryDate,
    pccExpired,
  } = nameDetails
  const owners = useOwners({
    ownerData: ownerData!,
    wrapperData: wrapperData!,
    dnsOwner,
    selfAbilities,
  })

  return (
    <MoreContainer>
      <Miscellaneous
        expiryDate={validateExpiry(
          name,
          wrapperData,
          expiryDate || wrapperData?.expiryDate,
          pccExpired,
        )}
        name={name}
        isCachedData={basicIsCachedData}
      />
      {owners && owners.length > 0 && (
        <Ownership
          name={name}
          owners={owners}
          canSend={selfAbilities.canSend}
          canSendError={selfAbilities.canSendError}
          isCachedData={basicIsCachedData}
          isWrapped={isWrapped}
        />
      )}
      {(checkETH2LDFromName(name) || isWrapped) && <Token isWrapped={isWrapped} name={name} />}
      <Resolver
        name={name}
        canEdit={selfAbilities.canEdit}
        canEditResolver={selfAbilities.canEditResolver}
        isCachedData={profileIsCachedData}
        resolverAddress={profile?.resolverAddress}
      />
    </MoreContainer>
  )
}

export default MoreTab
