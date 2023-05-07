import { useMemo } from 'react'
import { useInfiniteQuery } from 'wagmi'

import { SortDirection, SortType } from '@app/components/@molecules/NameTableHeader/NameTableHeader'
import { ReturnedENS } from '@app/types'
import { useEns } from '@app/utils/EnsProvider'
import { emptyAddress } from '@app/utils/constants'

const PAGE_SIZE = 25

export type Subname = ReturnedENS['getSubnames']['subnames'][number]

export type SubnameSortType = Exclude<SortType, 'expiryDate'>

export const useSubnameInfiniteQuery = (
  name: string,
  orderBy?: SubnameSortType,
  orderDirection?: SortDirection,
  search?: string,
) => {
  const { getSubnames } = useEns()

  const queryKey = ['graph', 'getSubnames', 'infinite', name, orderBy, orderDirection, search]
  const { data, isLoading, isFetching, fetchNextPage, hasNextPage, refetch } = useInfiniteQuery(
    queryKey,
    async ({ pageParam }) => {
      const result = await getSubnames({
        name: name === '[root]' ? '' : name,
        lastSubnames: pageParam,
        orderBy: orderBy === 'creationDate' ? 'createdAt' : 'labelName',
        orderDirection: orderDirection === 'asc' ? 'asc' : 'desc',
        pageSize: PAGE_SIZE,
        search,
      })

      const ownedSubnames = result.subnames.filter((subname) => subname.owner !== emptyAddress)
      const isPageSize = result.subnames.length >= PAGE_SIZE
      const lastSubname = isPageSize ? result.subnames[result.subnames.length - 1] : undefined
      return {
        subnames: ownedSubnames,
        lastSubname,
        subnameCount: result.subnameCount,
      }
    },
    {
      getNextPageParam: (last) => (last.lastSubname ? [last.lastSubname] : undefined),
      refetchOnMount: 'always',
      enabled: !!name,
    },
  )

  const subnames: Subname[] = useMemo(() => {
    return (
      data?.pages.reduce<Subname[]>((acc, curr) => {
        return [
          ...acc,
          ...curr.subnames.map(
            (s) =>
              ({
                ...s,
                expiryDate: s.expiryDate ? new Date(s.expiryDate) : undefined,
              } as Subname),
          ),
        ]
      }, []) || ([] as Subname[])
    )
  }, [data])

  return {
    subnames,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetching,
    hasResults: !!data?.pages[0].subnameCount,
    refetch,
  }
}
