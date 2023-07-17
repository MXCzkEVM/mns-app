import { BigNumber } from '@ethersproject/bignumber/lib/bignumber'
// @ts-ignore
import { namehash } from '@ethersproject/hash'
import type { JsonRpcSigner } from '@ethersproject/providers'
import { keccak256 as solidityKeccak256 } from '@ethersproject/solidity'
// eslint-disable-next-line import/no-extraneous-dependencies
import { ethers } from 'ethers'
import contracts from '../../constants/addressConfig'
import type { TFunction } from 'react-i18next'

import { PublicENS, Transaction, TransactionDisplayItem } from '@app/types'

import MEP1002Token from '../../constants/MEP1002Token.json'

type Data = {
	h3index: string
}

const displayItems = (
	{ h3index }: Data,
	t: TFunction<'translation', undefined>,
): TransactionDisplayItem[] => [
		{
			label: 'h3Index',
			value: h3index,
			type: 'name',
		},
		{
			label: 'action',
			value: t(`transaction.description.mintHexagon`),
		},
	]

export const labelhash = (input: string) => solidityKeccak256(['string'], [input])
const transaction = async (signer: JsonRpcSigner, ens: PublicENS, data: Data) => {
	const contract = new ethers.Contract(contracts.MEP1002, MEP1002Token.abi, signer)
	return contract.populateTransaction.mint(
		BigNumber.from(`0x${data.h3index}`),
	)
}

export default {
	displayItems,
	transaction,
} as Transaction<Data>
