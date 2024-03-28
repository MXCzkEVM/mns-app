

const chain_id: string = process.env.NEXT_PUBLIC_NETWORK_CHAINID || "18686"

const contracts: any = {
    5167004: {
        MEP1002: "0x181eC6Bc420FAEce0228c91936938F438F2a33df",
    },
    18686: {
        MEP1002: "0x068234de9429FaeF2585A6eD9A52695cDa78aFE1",
    },
}

export default contracts[parseInt(chain_id)]
