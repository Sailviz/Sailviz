import { parseNumberSearchParam, parseStringSearchParam, useSearchParam } from '@hooks/use-search-param'
import { useCallback, useMemo } from 'react'

export const CATEGORY_OPTIONS = [
    { value: 'open', label: 'Open' },
    { value: '2024', label: '2024' },
    { value: '2025', label: '2025' },
    { value: '2026', label: '2026' },
    { value: '2027', label: '2027' },
    { value: '2028', label: '2028' },
    { value: '2029', label: '2029' }
]
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
