import { mockFunction, renderHook } from '@app/test-utils'

import { useAccount } from 'wagmi'

import { useResetSelectedKey } from './TransactionDialogManager'

jest.mock('wagmi')

const mockUseAccount = mockFunction(useAccount)

describe('useResetSelectedKey', () => {
  it('should stopFlow if account changes', async () => {
    const dispatch = jest.fn()
    mockUseAccount.mockReturnValue({ address: '0xAddress' })
    const { rerender } = renderHook(() => useResetSelectedKey(dispatch))
    mockUseAccount.mockReturnValue({ address: '0xOtherAddress' })
    rerender()
    expect(dispatch).toHaveBeenCalledWith({
      name: 'stopFlow',
    })
  })

  it('should not call stopFlow if account stays the same', () => {
    const dispatch = jest.fn()
    mockUseAccount.mockReturnValue({ address: '0xAddress' })
    const { rerender } = renderHook(() => useResetSelectedKey(dispatch))
    mockUseAccount.mockReturnValue({ address: '0xAddress' })
    rerender()
    expect(dispatch).not.toHaveBeenCalled()
  })
})
