import type { BigNumber } from '@ethersproject/bignumber'
// eslint-disable-next-line import/no-extraneous-dependencies
import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import { useFeeData } from 'wagmi'

const useGasPrice = () => {
  const { data, isLoading, isFetching } = useFeeData({ watch: true })
  const [gasPrice, setGasPrice] = useState<BigNumber | undefined>(undefined)

  useEffect(() => {
    if (data) {
      // setGasPrice(data.lastBaseFeePerGas?.add(data.maxPriorityFeePerGas!))
      setGasPrice(ethers.utils.parseUnits('3000', 'gwei'))
    }
  }, [data])

  return { gasPrice, isLoading, isFetching }
}

export default useGasPrice
