import { connectorsForWallets, } from '@rainbow-me/rainbowkit'
import { rainbowWallet, metaMaskWallet, walletConnectWallet, coinbaseWallet, injectedWallet } from '@rainbow-me/rainbowkit/wallets'
import '@rainbow-me/rainbowkit/styles.css'
import { DefaultOptions, QueryClient } from '@tanstack/react-query'
import { ChainProviderFn, InjectedConnector } from '@wagmi/core'
import { configureChains, createClient } from 'wagmi'
import { infuraProvider } from 'wagmi/providers/infura'
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc'
import { makePersistent } from '@app/utils/persist'

import network from '../constants/Network'


const providerArray: ChainProviderFn[] = []
if (process.env.NEXT_PUBLIC_PROVIDER) {
  // for local testing
  providerArray.push(
    jsonRpcProvider({
      rpc: () => ({ http: process.env.NEXT_PUBLIC_PROVIDER! }),
    }),
  )
} else {
  if (!process.env.NEXT_PUBLIC_IPFS) {
    // only use infura if we are not using IPFS
    // since we don't want to allow all domains to access infura
    providerArray.push(
      infuraProvider({
        apiKey: process.env.NEXT_PUBLIC_INFURA_KEY || 'cfa6ae2501cc4354a74e20432507317c',
      }),
    )
  }
  // fallback cloudflare gateway if infura is down or for IPFS
  providerArray.push(
    jsonRpcProvider({
      rpc: (c) => ({
        http: `https://web3.ens.domains/v1/${c.network === 'homestead' ? 'mainnet' : c.network}`,
      }),
    }),
  )
}


const axsWallet = ({ chains }: any) => ({
  id: 'moon_base',
  name: 'MoonBase',
  iconUrl: '/MoonBase.svg',
  iconBackground: '#FFFFFF',
  description: 'MoonBase wallet web3 provider.',
  createConnector: () => {
    const connector = new InjectedConnector({ chains })
    return { connector }
  },
})
const okxWallet = ({ chains }: any) => ({
  id: 'okx',
  name: 'OKX Wallet',
  iconUrl: '/okx.webp',
  iconBackground: '#FFFFFF',
  description: 'AXS wallet web3 provider.',
  createConnector: () => {
    const connector = new InjectedConnector({
      chains
    })
    return {
      connector,
    }
  },
})

const { provider, chains } = configureChains(
  [
    network
  ],
  providerArray,
)


const connectors = connectorsForWallets([
  {
    groupName: 'Popular',
    wallets: [
      axsWallet({ chains }),
      metaMaskWallet({ chains }),
      okxWallet({ chains }),
      walletConnectWallet({ chains }),
      coinbaseWallet({ appName: 'MNS', chains }),
    ],
  },
])


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 0,
    },
  },
})

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
  queryClient,
  persister: null,
})

makePersistent(queryClient)

export const refetchOptions: DefaultOptions<unknown> = {
  queries: {
    refetchOnWindowFocus: true,
    refetchInterval: 1000 * 60,
    staleTime: 1000 * 120,
    meta: {
      isRefetchQuery: true,
    },
    refetchOnMount: 'always',
  },
}

const queryClientWithRefetch = new QueryClient({
  queryCache: queryClient.getQueryCache(),
  defaultOptions: refetchOptions,
  mutationCache: queryClient.getMutationCache(),
})

const wagmiClientWithRefetch = createClient({
  autoConnect: true,
  connectors,
  provider,
  queryClient: queryClientWithRefetch,
  persister: null,
})

export { queryClient, wagmiClient, chains, wagmiClientWithRefetch }
