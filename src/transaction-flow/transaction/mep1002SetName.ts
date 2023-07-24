import { BigNumber } from '@ethersproject/bignumber/lib/bignumber'
// @ts-ignore
import { namehash } from '@ethersproject/hash'
import type { JsonRpcSigner } from '@ethersproject/providers'
import { keccak256 as solidityKeccak256 } from '@ethersproject/solidity'
// eslint-disable-next-line import/no-extraneous-dependencies
import { ethers } from 'ethers'
import type { TFunction } from 'react-i18next'

import { PublicENS, Transaction, TransactionDisplayItem } from '@app/types'
import contracts from '../../constants/addressConfig'
import MEP1002Token from '../../constants/MEP1002Token.json'

type Data = {
  labels: string[]
  h3index: string
}

const displayItems = (
  { labels, h3index }: Data,
  t: TFunction<'translation', undefined>,
): TransactionDisplayItem[] => [
  {
    label: 'name',
    value: labels.join('.'),
    type: 'name',
  },
  {
    label: 'h3Index',
    value: h3index,
    type: 'name',
  },
  {
    label: 'action',
    value: t(`transaction.description.setHexagonName`),
  },
]

export const labelhash = (input: string) => solidityKeccak256(['string'], [input])
const transaction = async (signer: JsonRpcSigner, ens: PublicENS, data: Data) => {
  const contract = new ethers.Contract(contracts.MEP1002, MEP1002Token.abi, signer)
  const { labels } = data
  const wrappedTokenId = namehash(`${labels.join('.')}`)
  return contract.populateTransaction.setName(
    BigNumber.from(`0x${data.h3index}`),
    BigNumber.from(wrappedTokenId),
  )
}

export default {
  displayItems,
  transaction,
} as Transaction<Data>
