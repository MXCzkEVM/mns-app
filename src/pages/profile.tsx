import { useAccount } from 'wagmi'

import ProfileContent from '@app/components/pages/profile/[name]/Profile'
import { useInitial } from '@app/hooks/useInitial'
import { useNameDetails } from '@app/hooks/useNameDetails'
import { usePrimary } from '@app/hooks/usePrimary'
import { useRouterWithHistory } from '@app/hooks/useRouterWithHistory'
import { checkDNSName } from '@app/utils/utils'

export default function Page() {
  const router = useRouterWithHistory()
  const _name = router.query.name as string
  const isSelf = router.query.connected === 'true'
  const isViewingExpired = router.query.expired === 'true'

  const initial = useInitial()

  const { address } = useAccount()

  const primary = usePrimary(address as string, !address)
  const { name: ensName, loading: primaryLoading } = primary

  const name = isSelf && ensName ? ensName : _name

  const nameDetails = useNameDetails(name)
  const { isLoading: detailsLoading, registrationStatus, gracePeriodEndDate } = nameDetails

  const isLoading = detailsLoading || primaryLoading || initial

  if (isViewingExpired && gracePeriodEndDate && gracePeriodEndDate > new Date()) {
    router.push(`/profile/${name}`)
    return null
  }

  if (
    (registrationStatus === 'available' || registrationStatus === 'premium') &&
    !isViewingExpired &&
    !detailsLoading
  ) {
    router.push(`/register/${name}`)
    return null
  }

  const isDNS = checkDNSName(name)
  if (isDNS && registrationStatus === 'notImported') {
    router.push(`/import/${name}`)
    return null
  }

  return (
    <ProfileContent
      {...{
        nameDetails,
        isSelf,
        isLoading,
        name,
      }}
    />
  )
}
