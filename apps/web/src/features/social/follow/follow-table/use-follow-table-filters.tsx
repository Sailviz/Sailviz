import { parseNumberSearchParam, parseStringSearchParam, useSearchParam } from '@hooks/use-search-param'
import { useCallback, useMemo } from 'react'

export function useSeriesTableFilters() {
    const [searchQuery, setSearchQuery] = useSearchParam('seriesq', '', { parse: parseStringSearchParam })

    const [tagFilter, setTagFilter] = useSearchParam('tag', '', { parse: parseStringSearchParam })

    const [page, setPage] = useSearchParam('seriesPage', 1, { parse: parseNumberSearchParam })

    const resetFilters = useCallback(() => {
        void setSearchQuery(null)
        void setTagFilter(null)

        void setPage(1)
    }, [setSearchQuery, setTagFilter, setPage])

    const isAnyFilterActive = useMemo(() => {
        return !!searchQuery || !!tagFilter
    }, [searchQuery, tagFilter])

    return {
        searchQuery,
        setSearchQuery,
        page,
        setPage,
        resetFilters,
        isAnyFilterActive,
        tagFilter,
        setTagFilter
    }
}
