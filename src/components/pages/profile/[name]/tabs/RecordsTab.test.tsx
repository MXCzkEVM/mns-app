import { mockFunction, render, screen } from '@app/test-utils'

import { useChainId } from '@app/hooks/useChainId'
import { useBreakpoint } from '@app/utils/BreakpointProvider'

import { RecordsTab } from './RecordsTab'

jest.mock('@app/utils/BreakpointProvider')
jest.mock('@app/hooks/useChainId')

const mockUseBreakpoint = mockFunction(useBreakpoint)
const mockUseChainId = mockFunction(useChainId)
mockUseBreakpoint.mockReturnValue({ sm: true, md: true, lg: true })

describe('RecordsTab', () => {
  const baseMockData = {
    name: 'nick.eth',
    network: 1,
    resolverAddress: '0x123',
    isWrapped: false,
  }
  mockUseChainId.mockReturnValue(1)

  it('should render if no records provided', () => {
    render(<RecordsTab {...baseMockData} />)
    expect(screen.getByTestId('records-tab')).toBeVisible()
    expect(screen.getByTestId('text-amount')).toHaveTextContent('0 records.label')
    expect(screen.getByTestId('address-amount')).toHaveTextContent('0 records.label')
    expect(screen.getByTestId('content-hash-heading')).toHaveTextContent(
      'details.tabs.records.noContentHash',
    )
  })
  it('should show the correct amount of records', () => {
    const mockData = {
      ...baseMockData,
      texts: [
        {
          key: 'text1',
          value: 'text1-value',
        },
        {
          key: 'text2',
          value: 'text2-value',
        },
        {
          key: 'text3',
          value: 'text3-value',
        },
      ],
      addresses: [
        {
          key: 'addr1',
          coin: 'ADR1',
          addr: 'addr1-value',
        },
        {
          key: 'addr2',
          coin: 'ADR2',
          addr: 'addr2-value',
        },
      ],
    }
    render(<RecordsTab {...mockData} />)
    expect(screen.getByTestId('text-amount')).toHaveTextContent('3 records.label')
    expect(screen.getByTestId('address-amount')).toHaveTextContent('2 records.label')
  })
  it('should show all text and address records', () => {
    const mockData = {
      ...baseMockData,
      texts: [
        {
          key: 'text1',
          value: 'text1-value',
        },
        {
          key: 'text2',
          value: 'text2-value',
        },
        {
          key: 'text3',
          value: 'text3-value',
        },
      ],
      addresses: [
        {
          key: 'addr1',
          coin: 'ADR1',
          addr: 'addr1-value',
        },
        {
          key: 'addr2',
          coin: 'ADR2',
          addr: 'addr2-value',
        },
      ],
    }
    render(<RecordsTab {...mockData} />)

    mockData.texts.forEach((text) => {
      expect(screen.getByTestId(`name-details-text-${text.key}`)).toHaveTextContent(
        `${text.key}${text.value}`,
      )
    })
    mockData.addresses.forEach((address) => {
      expect(
        screen.getByTestId(`name-details-address-${address.coin.toLowerCase()}`),
      ).toHaveTextContent(`${address.coin}${address.addr}`)
    })
  })
  it('should show the content hash', () => {
    const mockData = {
      ...baseMockData,
      contentHash: 'ipfs://1234',
    }

    render(<RecordsTab {...mockData} />)
    expect(screen.getByTestId('content-hash-heading')).toHaveTextContent(
      'details.tabs.records.contentHash',
    )
    expect(screen.getByTestId('name-details-contentHash')).toHaveTextContent('ipfs://1234')
  })
})
