import approveNameWrapper from './approveNameWrapper'
import burnFuses from './burnFuses'
import changePermissions from './changePermissions'
import commitName from './commitName'
import createSubname from './createSubname'
import deleteSubname from './deleteSubname'
import extendNames from './extendNames'
import importDNSSECName from './importDNSSECName'
import migrateProfile from './migrateProfile'
import migrateProfileWithReset from './migrateProfileWithReset'
import registerName from './registerName'
import resetProfile from './resetProfile'
import setPrimaryName from './setPrimaryName'
import syncManager from './syncManager'
import testSendName from './testSendName'
import transferController from './transferController'
import transferName from './transferName'
import transferSubname from './transferSubname'
import updateEthAddress from './updateEthAddress'
import updateProfile from './updateProfile'
import updateProfileRecords from './updateProfileRecords'
import updateResolver from './updateResolver'
import wrapName from './wrapName'

export const transactions = {
  updateResolver,
  migrateProfile,
  wrapName,
  testSendName,
  updateProfile,
  setPrimaryName,
  updateEthAddress,
  migrateProfileWithReset,
  burnFuses,
  createSubname,
  extendNames,
  deleteSubname,
  commitName,
  registerName,
  resetProfile,
  transferName,
  transferSubname,
  transferController,
  importDNSSECName,
  approveNameWrapper,
  changePermissions,
  syncManager,
  updateProfileRecords,
}

export type Transaction = typeof transactions
export type TransactionName = keyof Transaction

export type TransactionData<T extends TransactionName> = Parameters<
  Transaction[T]['transaction']
>[2]

export const makeTransactionItem = <T extends TransactionName>(
  name: T,
  data: TransactionData<T>,
) => ({
  name,
  data,
})

export type TransactionItem = ReturnType<typeof makeTransactionItem>
