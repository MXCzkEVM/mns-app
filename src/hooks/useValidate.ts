import { useQuery } from 'wagmi'

import { MINIMUM_DOT_ETH_CHARS } from '@ensdomains/ensjs/utils/consts'
import { split } from '@ensdomains/ensjs/utils/normalise'
import { ParsedInputResult, validateName } from '@ensdomains/ensjs/utils/validation'

import { Prettify } from '@app/types'
import { tryBeautify } from '@app/utils/beautify'
import { useQueryKeys } from '@app/utils/cacheKeyFactory'

export type ValidationResult = Prettify<
  Partial<Omit<ParsedInputResult, 'normalised' | 'labelDataArray'>> & {
    name: string
    beautifiedName: string
    isNonASCII: boolean | undefined
    labelCount: number
    labelDataArray: ParsedInputResult['labelDataArray']
  }
>

const tryDecodeURIComponent = (input: string) => {
  try {
    return decodeURIComponent(input)
  } catch {
    return input
  }
}

export const parseInput = (input: string): ParsedInputResult => {
  let nameReference = input
  let isValid = false

  try {
    nameReference = validateName(input)
    isValid = true
    // eslint-disable-next-line no-empty
  } catch {}

  const normalisedName = isValid ? nameReference : undefined

  const labels = nameReference.split('.')
  const tld = labels[labels.length - 1]
  const isETH = tld === 'mxc'
  const labelDataArray = split(nameReference)
  const isShort = (labelDataArray[0].output?.length || 0) < MINIMUM_DOT_ETH_CHARS

  if (labels.length === 1) {
    return {
      type: 'label',
      normalised: normalisedName,
      isShort,
      isValid,
      is2LD: false,
      isETH,
      labelDataArray,
    }
  }

  const is2LD = labels.length === 2
  return {
    type: 'name',
    normalised: normalisedName,
    isShort: isETH && is2LD ? isShort : false,
    isValid,
    is2LD,
    isETH,
    labelDataArray,
  }
}
export const validate = (input: string) => {
  const decodedInput = tryDecodeURIComponent(input)
  const { normalised: name, ...parsedInput } = parseInput(decodedInput)
  const isNonASCII = parsedInput.labelDataArray.some((dataItem) => dataItem.type !== 'ASCII')
  const outputName = name || input

  return {
    ...parsedInput,
    name: outputName,
    beautifiedName: tryBeautify(outputName),
    isNonASCII,
    labelCount: parsedInput.labelDataArray.length,
  }
}

const defaultData = Object.freeze({
  name: '',
  beautifiedName: '',
  isNonASCII: undefined,
  labelCount: 0,
  type: undefined,
  isValid: undefined,
  isShort: undefined,
  is2LD: undefined,
  isETH: undefined,
  labelDataArray: [],
})

export const useValidate = (input: string, skip?: any): ValidationResult => {
  const { data } = useQuery(useQueryKeys().validate(input), () => validate(input), {
    enabled: !skip,
    initialData: () => (skip ? defaultData : validate(input)),
  })

  return data
}
