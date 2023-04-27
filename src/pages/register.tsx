import { ReactElement } from 'react'
import { useAccount } from 'wagmi'

import Registration from '@app/components/pages/profile/[name]/registration/Registration'
import { useInitial } from '@app/hooks/useInitial'
import { useNameDetails } from '@app/hooks/useNameDetails'
import { getSelectedIndex } from '@app/hooks/useRegistrationReducer'
import { useRouterWithHistory } from '@app/hooks/useRouterWithHistory'
import { ContentGrid } from '@app/layouts/ContentGrid'

export default function Page() {
  const router = useRouterWithHistory()
  const name = router.query.name as string

  const initial = useInitial()

  const { address } = useAccount()

  const nameDetails = useNameDetails(name)
  const { isLoading: detailsLoading, registrationStatus } = nameDetails

  const isLoading = detailsLoading || initial

  if (!isLoading && registrationStatus !== 'available' && registrationStatus !== 'premium') {
    let redirect = true

    if (nameDetails.ownerData?.owner === address && !!address) {
      const registrationData = JSON.parse(
        localStorage.getItem('registration-status') || '{"items":[]}',
      )
      const index = getSelectedIndex(registrationData, {
        address: address!,
        name: nameDetails.normalisedName,
      })
      if (index !== -1) {
        const { stepIndex, queue } = registrationData.items[index]
        const step = queue[stepIndex]
        if (step === 'transactions' || step === 'complete') {
          redirect = false
        }
      }
    }

    if (redirect) {
      router.push(`/profile/${name}`)
    }
  }

  return <Registration {...{ nameDetails, isLoading }} />
}

Page.getLayout = function getLayout(page: ReactElement) {
  return <ContentGrid>{page}</ContentGrid>
}
