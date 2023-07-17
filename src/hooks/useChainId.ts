import { useNetwork } from 'wagmi'

const chain_id: string = process.env.NEXT_PUBLIC_NETWORK_CHAINID || "1"

export const useChainId = (): number => {
  const { chain } = useNetwork()
  if (chain) {
    return chain.id ?? null
  }
  return parseInt(chain_id)
}
