



const chain_id: string = process.env.NEXT_PUBLIC_NETWORK_CHAINID || "18686"

const networks: any = {
    5167004: {
        id: 5167004,
        name: 'Moonchain Geneva Testnet',
        nativeCurrency: { decimals: 18, name: 'MXC', symbol: 'MXC' },
        network: 'Moonchain Geneva Testnet',
        rpcUrls: {
            default: {
                http: ['https://geneva-rpc.moonchain.com'],
                webSocket: ['wss://geneva-rpc.moonchain.com/ws'],
            },
            public: { http: ['https://geneva-rpc.moonchain.com'] },
        },
        blockExplorers: {
            default: {
                name: 'MoonChain Geneva Block Explorer',
                url: 'https://geneva-explorer.moonchain.com/',
            },
        },
        contracts: {
            multicall3: {
                address: '0x3f2AB51385EF323cb1B411579D7DDf221fFe9EaA',
                blockCreated: 5860,
            },
        },
    },
    18686: {
        id: 18686,
        name: 'Moonchain Mainnet',
        nativeCurrency: { decimals: 18, name: 'MXC', symbol: 'MXC' },
        network: 'Moonchain Mainnet',
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
                url: 'https://explorer.moonchain.com/',
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