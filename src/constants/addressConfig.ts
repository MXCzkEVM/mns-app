

const chain_id: string = process.env.NEXT_PUBLIC_NETWORK_CHAINID || "18686"

const contracts: any = {
    5167003: {
        MEP1002: "0xFf3159E5779C61f5d2965305DC1b9E8a1E16a39c",
    },
    18686: {
        MEP1002: "0x068234de9429FaeF2585A6eD9A52695cDa78aFE1",
    },
}

export default contracts[parseInt(chain_id)]
