import { mockFunction, render, screen } from '@app/test-utils'

import { BigNumber } from '@ethersproject/bignumber/lib/bignumber'

import { useEthPrice } from '@app/hooks/useEthPrice'

import { CurrencyText } from './CurrencyText'

jest.mock('@app/hooks/useEthPrice')

const mockUseEthPrice = mockFunction(useEthPrice)
mockUseEthPrice.mockReturnValue({ data: 1e8, loading: false })

describe('CurrencyText', () => {
  it('should render correctly', async () => {
    render(<CurrencyText eth={BigNumber.from('4000000000000000000')} currency="eth" />)
    expect(screen.getByText('4.0000 ETH')).toBeVisible()
  })

  it('should append extra decimal to usd if it does not exist', async () => {
    render(<CurrencyText eth={BigNumber.from('4000000000000000000')} currency="usd" />)
    expect(screen.getByText('$4.00')).toBeVisible()
  })

  it('should cut off at ETH at 4 decimals', async () => {
    render(<CurrencyText eth={BigNumber.from('4444444444444444444')} currency="eth" />)
    expect(screen.getByText('4.4444 ETH')).toBeVisible()
  })
})
