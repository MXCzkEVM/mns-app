/* eslint-disable no-promise-executor-return */
import { act, fireEvent, mockFunction, render, screen, waitFor } from '@app/test-utils'

import { ComponentProps } from 'react'
import { useSendTransaction, useSigner } from 'wagmi'

import { useAddRecentTransaction } from '@app/hooks/transactions/useAddRecentTransaction'
import { useRecentTransactions } from '@app/hooks/transactions/useRecentTransactions'
import { useAccountSafely } from '@app/hooks/useAccountSafely'
import { useChainName } from '@app/hooks/useChainName'
import { GenericTransaction } from '@app/transaction-flow/types'
import { useEns } from '@app/utils/EnsProvider'

import { TransactionStageModal, handleBackToInput } from './TransactionStageModal'

jest.mock('@app/hooks/useAccountSafely')
jest.mock('@app/hooks/useChainName')
jest.mock('@app/hooks/transactions/useAddRecentTransaction')
jest.mock('@app/hooks/transactions/useRecentTransactions')
jest.mock('@app/utils/EnsProvider')

const mockPopulatedTransaction = {
  data: '0x1896f70a516f53deb2dac3f055f1db1fbd64c12640aa29059477103c3ef28806f15929250000000000000000000000004976fb03c32e5b8cfe2b6ccb31c09ba78ebaba41',
  to: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
  from: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
  gasLimit: {
    type: 'BigNumber',
    hex: '0x798a',
  },
}
const mockTransaction: GenericTransaction = {
  name: 'updateResolver',
  data: {
    name: 'other-registrant.eth',
    contract: 'registry',
    resolver: '0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41',
    oldResolver: '0x1613beB3B2C4f22Ee086B2b38C1476A3cE7f78E8',
  },
}

jest.mock('@app/transaction-flow/transaction', () => {
  const originalModule = jest.requireActual('@app/transaction-flow/transaction')
  return {
    __esModule: true,
    ...originalModule,
    transactions: {
      updateResolver: {
        transaction: () => mockPopulatedTransaction,
      },
    },
  }
})

const mockUseEns = mockFunction(useEns)
const mockUseAddRecentTransaction = mockFunction(useAddRecentTransaction)
const mockUseRecentTransactions = mockFunction(useRecentTransactions)
const mockUseAccountSafely = mockFunction(useAccountSafely)
const mockUseChainName = mockFunction(useChainName)
const mockUseSigner = mockFunction(useSigner)
const mockUseSendTransaction = mockFunction(useSendTransaction)

const mockEstimateGas = jest.fn()
const mockOnDismiss = jest.fn()
const mockDispatch = jest.fn()

const ComponentWithDefaultProps = ({
  currentStep = 0,
  stepCount = 1,
  actionName = 'test',
  displayItems = [],
  transaction = {} as any,
}: Partial<ComponentProps<typeof TransactionStageModal>>) => (
  <TransactionStageModal
    currentStep={currentStep}
    stepCount={stepCount}
    actionName={actionName}
    displayItems={displayItems}
    transaction={transaction}
    onDismiss={mockOnDismiss}
    dispatch={mockDispatch}
    backToInput={false}
    txKey="test"
  />
)

const renderHelper = async (props: Partial<ComponentProps<typeof TransactionStageModal>> = {}) => {
  const renderValue = render(<ComponentWithDefaultProps key="component-default" {...props} />)
  await waitFor(() => expect(screen.getByTestId('transaction-modal-inner')).toBeVisible(), {
    timeout: 350,
  })
  return renderValue
}

const clickRequest = async () => {
  await act(async () => {
    await waitFor(() =>
      expect(screen.getByTestId('transaction-modal-confirm-button')).toBeEnabled(),
    )
    fireEvent.click(screen.getByTestId('transaction-modal-confirm-button'))
  })
}

describe('TransactionStageModal', () => {
  mockUseSigner.mockReturnValue({
    data: {
      estimateGas: mockEstimateGas,
    } as any,
  })
  mockUseRecentTransactions.mockReturnValue([])
  mockUseSendTransaction.mockReturnValue({})
  mockUseEns.mockReturnValue({})

  beforeEach(() => {
    mockEstimateGas.mockReset()
    mockUseAccountSafely.mockReturnValue({ address: '0x1234' })
    mockUseChainName.mockReturnValue('ethereum')
    mockUseRecentTransactions.mockReturnValue([
      {
        status: 'pending',
        hash: '0x123',
        action: 'test',
        key: 'test',
      },
    ])
  })

  it('should render on open', async () => {
    await renderHelper()
    expect(screen.getByText('transaction.dialog.confirm.title')).toBeVisible()
  })
  it('should render display items', async () => {
    await renderHelper({
      displayItems: [
        {
          label: 'GenericItem',
          value: 'GenericValue',
        },
      ],
    })
    expect(screen.getByText('transaction.itemLabel.GenericItem')).toBeVisible()
    expect(screen.getByText('GenericValue')).toBeVisible()
  })

  it('should not render steps if there is only 1 step', async () => {
    await renderHelper()
    expect(screen.queryByTestId('step-container')).not.toBeInTheDocument()
  })
  it('should render steps if there are multiple steps', async () => {
    await renderHelper({ stepCount: 2 })
    expect(screen.getByTestId('step-container')).toBeVisible()
  })
  describe('stage', () => {
    describe('confirm', () => {
      it('should show confirm button as disabled if gas is not estimated', async () => {
        await renderHelper()
        await waitFor(() =>
          expect(screen.getByTestId('transaction-modal-confirm-button')).toBeDisabled(),
        )
      })
      it('should show confirm button as disabled if a unique identifier is undefined', async () => {
        mockEstimateGas.mockResolvedValue(1)
        mockUseSendTransaction.mockReturnValue({
          sendTransaction: () => Promise.resolve(),
        })
        mockUseAccountSafely.mockReturnValue({ address: undefined })
        await renderHelper({ transaction: mockTransaction })
        await waitFor(() =>
          expect(screen.getByTestId('transaction-modal-confirm-button')).toBeDisabled(),
        )
      })
      it('should disable confirm button and re-estimate gas if a unique identifier is changed', async () => {
        mockEstimateGas.mockResolvedValue(1)
        mockUseSendTransaction.mockReturnValue({
          sendTransaction: () => Promise.resolve(),
        })
        const { rerender } = await renderHelper({ transaction: mockTransaction })
        await waitFor(() =>
          expect(screen.getByTestId('transaction-modal-confirm-button')).toBeEnabled(),
        )
        expect(mockEstimateGas).toHaveBeenCalledTimes(1)
        mockEstimateGas.mockReset()
        rerender(
          <ComponentWithDefaultProps
            transaction={{
              ...mockTransaction,
              data: { ...mockTransaction.data, name: 'test.eth' },
            }}
            key="component-default"
          />,
        )
        expect(screen.getByTestId('transaction-modal-confirm-button')).toBeDisabled()
        await waitFor(() =>
          expect(screen.getByTestId('transaction-modal-confirm-button')).toBeEnabled(),
        )
        expect(mockEstimateGas).toHaveBeenCalledTimes(1)
      })
      it('should only show confirm button as enabled if gas is estimated and sendTransaction func is defined', async () => {
        mockEstimateGas.mockResolvedValue(1)
        mockUseSendTransaction.mockReturnValue({
          sendTransaction: () => Promise.resolve(),
        })
        await renderHelper({ transaction: mockTransaction })
        await waitFor(() =>
          expect(screen.getByTestId('transaction-modal-confirm-button')).toBeEnabled(),
        )
      })
      it('should run set sendTransaction on action click', async () => {
        mockEstimateGas.mockResolvedValue(1)
        const mockSendTransaction = jest.fn()
        mockUseSendTransaction.mockReturnValue({
          sendTransaction: mockSendTransaction,
        })
        mockSendTransaction.mockResolvedValue({
          hash: '0x0',
        })
        await renderHelper({ transaction: mockTransaction })
        await clickRequest()
        expect(mockSendTransaction).toHaveBeenCalled()
      })
      it('should show the waiting for wallet button if the transaction is loading', async () => {
        mockEstimateGas.mockResolvedValue(1)
        const mockSendTransaction = jest.fn()
        mockUseSendTransaction.mockReturnValue({
          sendTransaction: mockSendTransaction,
          isLoading: true,
        })
        mockSendTransaction.mockImplementation(async () => new Promise(() => {}))
        await renderHelper({ transaction: mockTransaction })
        await waitFor(() =>
          expect(screen.getByTestId('transaction-modal-confirm-button')).toBeDisabled(),
        )
      })
      it('should show the error message and reenable button if there is an error', async () => {
        const mockSendTransaction = jest.fn()
        mockUseSendTransaction.mockReturnValue({
          sendTransaction: mockSendTransaction,
          error: new Error('error123'),
        })
        await renderHelper({ transaction: mockTransaction })
        await clickRequest()
        await waitFor(() => expect(screen.getByText('error123')).toBeVisible())
        await waitFor(() =>
          expect(screen.getByTestId('transaction-modal-confirm-button')).toBeEnabled(),
        )
      })
      it('should pass the request to send transaction', async () => {
        mockEstimateGas.mockResolvedValue(1)
        const mockSendTransaction = jest.fn()
        mockUseSendTransaction.mockReturnValue({
          sendTransaction: mockSendTransaction,
        })
        await renderHelper({ transaction: mockTransaction })
        await clickRequest()
        await waitFor(() =>
          expect(mockUseSendTransaction.mock.lastCall[0].request).toStrictEqual({
            ...mockPopulatedTransaction,
            gasLimit: 1,
          }),
        )
      })
      it('should add to recent transactions and run dispatch from success callback', async () => {
        const mockAddTransaction = jest.fn()
        mockUseAddRecentTransaction.mockReturnValue(mockAddTransaction)
        await renderHelper({ transaction: mockTransaction })
        await waitFor(() => expect(mockUseSendTransaction.mock.lastCall[0].onSuccess).toBeDefined())
        ;(mockUseSendTransaction.mock.lastCall[0] as any).onSuccess({ hash: '0x123' })
        expect(mockAddTransaction).toBeCalledWith({
          hash: '0x123',
          action: 'test',
          key: 'test',
        })
        expect(mockDispatch).toBeCalledWith({
          name: 'setTransactionHash',
          payload: '0x123',
        })
      })
    })
    describe('sent', () => {
      it('should show load bar', async () => {
        await renderHelper({
          transaction: { ...mockTransaction, hash: '0x123', sendTime: Date.now(), stage: 'sent' },
        })
        await waitFor(() => expect(screen.getByTestId('load-bar-container')).toBeVisible())
      })
      it('should call onDismiss on close', async () => {
        await renderHelper({
          transaction: { ...mockTransaction, hash: '0x123', sendTime: Date.now(), stage: 'sent' },
        })
        fireEvent.click(screen.getByTestId('transaction-modal-sent-button'))
        expect(mockOnDismiss).toHaveBeenCalled()
      })
      it('should show message if transaction is taking a long time', async () => {
        await renderHelper({
          transaction: {
            ...mockTransaction,
            hash: '0x123',
            sendTime: Date.now() - 45000,
            stage: 'sent',
          },
        })
        expect(screen.getByText('transaction.dialog.sent.progress.message')).toBeVisible()
      })
    })
    describe('complete', () => {
      it('should call onDismiss on close', async () => {
        await renderHelper({
          transaction: {
            ...mockTransaction,
            hash: '0x123',
            sendTime: Date.now(),
            stage: 'complete',
          },
        })
        fireEvent.click(screen.getByTestId('transaction-modal-complete-button'))
        expect(mockOnDismiss).toHaveBeenCalled()
      })
    })
    describe('failed', () => {
      it('should show try again button', async () => {
        await renderHelper({ transaction: { ...mockTransaction, hash: '0x123', stage: 'failed' } })
        expect(screen.getByTestId('transaction-modal-failed-button')).toBeVisible()
      })
      it('should run sendTransaction on action click', async () => {
        mockEstimateGas.mockResolvedValue(1)
        const mockSendTransaction = jest.fn()
        mockUseSendTransaction.mockReturnValue({
          sendTransaction: mockSendTransaction,
        })
        mockSendTransaction.mockResolvedValue({
          hash: '0x0',
        })
        await renderHelper({ transaction: { ...mockTransaction, hash: '0x123', stage: 'failed' } })
        await act(async () => {
          await waitFor(() =>
            expect(screen.getByTestId('transaction-modal-failed-button')).toBeEnabled(),
          )
          fireEvent.click(screen.getByTestId('transaction-modal-failed-button'))
        })
        expect(mockSendTransaction).toHaveBeenCalled()
      })
    })
  })
})

describe('handleBackToInput', () => {
  it('should reset the transaction step', () => {
    handleBackToInput(mockDispatch)()
    expect(mockDispatch).toBeCalledWith({
      name: 'resetTransactionStep',
    })
  })
})
