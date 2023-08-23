



const chain_id: string = process.env.NEXT_PUBLIC_NETWORK_CHAINID || "18686"

const networks: any = {
    5167003: {
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
    18686: {
        id: 18686,
        name: 'MXC Mainnet',
        nativeCurrency: { decimals: 18, name: 'MXC', symbol: 'MXC' },
        network: 'MXC Mainnet',
        rpcUrls: {
            default: {
                http: ['https://rpc.mxc.com'],
                webSocket: ['wss://rpc.mxc.com'],
            },
            public: { http: ['https://rpc.mxc.com'] },
        },
        blockExplorers: {
            default: {
                name: 'Mxc Block Explorer',
                url: 'https://explorer.mxc.com/',
            },
        },
        contracts: {
            multicall3: {
                address: '0xfA9eBcEd32BaB3EA062f9853ACA66cC9B666fBB9',
                blockCreated: 185,
            },
        },
    },
}

export default networks[parseInt(chain_id)]