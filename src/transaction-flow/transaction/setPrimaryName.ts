import type { JsonRpcSigner } from '@ethersproject/providers'
import type { TFunction } from 'react-i18next'

import { PublicENS, Transaction, TransactionDisplayItem } from '@app/types'

type Data = {
  name: string
  address: string
}

const displayItems = (
  { address, name }: Data,
  t: TFunction<'translation', undefined>,
): TransactionDisplayItem[] => [
  {
    label: 'action',
    value: t(`transaction.description.setPrimaryName`),
  },
  {
    label: 'info',
    value: t(`transaction.info.setPrimaryName`),
  },
  {
    label: 'name',
    value: name,
    type: 'name',
  },
  {
    label: 'address',
    value: address,
    type: 'address',
  },
]

const transaction = async (signer: JsonRpcSigner, ens: PublicENS, data: Data) =>
  ens.setName.populateTransaction(data.name, { signer })

export default { displayItems, transaction } as Transaction<Data>
