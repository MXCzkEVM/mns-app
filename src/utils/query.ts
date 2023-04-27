import { getDefaultWallets } from '@rainbow-me/rainbowkit'
import '@rainbow-me/rainbowkit/styles.css'
import { DefaultOptions, QueryClient } from '@tanstack/react-query'
import { ChainProviderFn } from '@wagmi/core'
import { localhost } from '@wagmi/core/chains'
import { configureChains, createClient } from 'wagmi'
import { infuraProvider } from 'wagmi/providers/infura'
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc'

import { makePersistent } from '@app/utils/persist'

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

const { provider, chains } = configureChains(
  [
    {
      id: 5167003,
      name: 'MXC Wannsee',
      nativeCurrency: { decimals: 18, name: 'MXC', symbol: 'MXC' },
      network: 'MXC Wannsee',
      rpcUrls: {
        default: {
          http: ['https://wannsee-rpc.mxc.com'],
          webSocket: ['wss://wannsee-rpc.mxc.com'],
        },
        public: { http: ['https://wannsee-rpc.mxc.com'] },
      },
      blockExplorers: {
        default: {
          name: 'Wannsee Block Explorer',
          url: 'https://wannsee-explorer.mxc.com/',
        },
      },
      contracts: {
        multicall3: {
          address: '0x87A3645647cabb016705eddfD0f7787fEe9324BF',
          blockCreated: 383161,
        },
      },
    },
  ],
  providerArray,
)
const { connectors } = getDefaultWallets({
  appName: 'MNS',
  chains,
})

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
