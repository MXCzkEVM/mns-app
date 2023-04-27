import { useCallback, useState } from 'react'

export const useTooltipSeenManager = (targetId: string) => {
  const [shouldShowTooltipIndicator, setShouldShowTooltipIndicator] = useState(
    !localStorage.getItem(`tooltipTarget-${targetId}`),
  )

  const onSeen = useCallback(() => {
    localStorage.setItem(`tooltipTarget-${targetId}`, 'true')
    setShouldShowTooltipIndicator(false)
  }, [targetId])

  return { shouldShowTooltipIndicator, onSeen }
}
