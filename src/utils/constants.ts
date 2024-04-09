import { EthAddress } from '@app/types'

export const emptyAddress = '0x0000000000000000000000000000000000000000'

export const networkName = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  '1': 'mainnet',
  // eslint-disable-next-line @typescript-eslint/naming-convention
  '5': 'goerli',
  // eslint-disable-next-line @typescript-eslint/naming-convention
  '4': 'rinkeby',
  // eslint-disable-next-line @typescript-eslint/naming-convention
  '3': 'ropsten',
  // eslint-disable-next-line @typescript-eslint/naming-convention
  '1337': 'local',
  '18686': 'moonchain',
  '516004': 'geneva'
}

interface ResolverAddresses {
  [key: string]: EthAddress[]
}

// Ordered by recency
export const RESOLVER_ADDRESSES: ResolverAddresses = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  '1': [
    '0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63',
    '0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41',
    '0xdaaf96c344f63131acadd0ea35170e7892d3dfba',
    '0x226159d592e2b063810a10ebf6dcbada94ed68b8',
    '0x1da022710df5002339274aadee8d58218e9d6ab5',
  ],
  // eslint-disable-next-line @typescript-eslint/naming-convention
  '5': [
    '0xd7a4F6473f32aC2Af804B3686AE8F1932bC35750',
    '0x342cf18D3e41DE491aa1a3067574C849AdA6a2Ad',
    '0x19c2d5D0f035563344dBB7bE5fD09c8dad62b001',
    '0x2800Ec5BAB9CE9226d19E0ad5BC607e3cfC4347E',
    '0x121304143ea8101e69335f309e2062d299a234b5',
    '0xff77b96d6bafcec0d684bb528b22e0ab09c70663',
    '0x6e1b40ed2d626b97a43d2c12e48a6de49a03c7a4',
    '0xc1ea41786094d1fbe5aded033b5370d51f7a3f96',
    '0xbbe3fd189d18c8b73ba54e9dd01f89e6b3ee71f0',
    '0x4B1488B7a6B320d2D721406204aBc3eeAa9AD329',
  ],
  // eslint-disable-next-line @typescript-eslint/naming-convention
  '1337': [
    '0x0E801D84Fa97b50751Dbf25036d067dCf18858bF',
    '0x84eA74d481Ee0A5332c457a4d796187F6Ba67fEB',
  ],
  // eslint-disable-next-line @typescript-eslint/naming-convention
  '5167004': ['0xd241E9681B22Ae47e94c523d25CDdC1a4960cDC3'],
  // eslint-disable-next-line @typescript-eslint/naming-convention
  '18686': ['0x5325640Cc17A06a409d4f4b6af02A0120528c67E'],
}

export const NAMEWRAPPER_AWARE_RESOLVERS: ResolverAddresses = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  '1': ['0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63'],
  // eslint-disable-next-line @typescript-eslint/naming-convention
  '5': [
    '0xd7a4F6473f32aC2Af804B3686AE8F1932bC35750',
    '0x342cf18D3e41DE491aa1a3067574C849AdA6a2Ad',
    '0x19c2d5D0f035563344dBB7bE5fD09c8dad62b001',
  ],
  // eslint-disable-next-line @typescript-eslint/naming-convention
  '1337': ['0x0E801D84Fa97b50751Dbf25036d067dCf18858bF'],
  // eslint-disable-next-line @typescript-eslint/naming-convention
  '5167004': ['0xCE5e3c318BFC7c2dee486cF7c62Ba95feFd6d2bD'],
  // eslint-disable-next-line @typescript-eslint/naming-convention
  '18686': ['0xD1B70f92b310c3Fa95b83dB436E00a53e1f1f5d5'],
}

export const RESOLVER_INTERFACE_IDS = {
  addrInterfaceId: '0x3b3b57de',
  txtInterfaceId: '0x59d1d43c',
  contentHashInterfaceId: '0xbc1c58d1',
}

export const GRACE_PERIOD = 90 * 24 * 60 * 60 * 1000

export const MOONPAY_WORKER_URL: { [key: number]: string } = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  1: 'https://moonpay-worker.ens-cf.workers.dev',
  // eslint-disable-next-line @typescript-eslint/naming-convention
  5: 'https://moonpay-worker-goerli.ens-cf.workers.dev',
  // eslint-disable-next-line @typescript-eslint/naming-convention
  1337: 'https://moonpay-goerli.ens-cf.workers.dev',
  // eslint-disable-next-line @typescript-eslint/naming-convention
  5167003: 'https://moonpay-worker.mxczkevm.workers.dev',
}
