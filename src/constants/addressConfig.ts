

const chain_id: string = process.env.NEXT_PUBLIC_NETWORK_CHAINID || "1"

const contracts: any = {
    5167003: {
        MEP1002: "0xFf3159E5779C61f5d2965305DC1b9E8a1E16a39c",
    },
    16868: {
        MEP1002: "0x8DD0d6b0238c26C14946095181A6C9671970B7cA",
    },
}

export default contracts[parseInt(chain_id)]
