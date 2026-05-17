import { parseNumberSearchParam, parseStringSearchParam, useSearchParam } from '@hooks/use-search-param'
import { useCallback, useMemo } from 'react'

export const CATEGORY_OPTIONS = [
    { value: '2025', label: '2025' },
    { value: '2026', label: '2026' }
]
export function useRaceTableFilters() {
    const [searchQuery, setSearchQuery] = useSearchParam('raceq', '', { parse: parseStringSearchParam })

    const [page, setPage] = useSearchParam('racePage', 1, { parse: parseNumberSearchParam })

    const resetFilters = useCallback(() => {
        void setSearchQuery(null)

        void setPage(1)
    }, [setSearchQuery, setPage])

    const isAnyFilterActive = useMemo(() => {
        return !!searchQuery
    }, [searchQuery])

    return {
        searchQuery,
        setSearchQuery,
        page,
        setPage,
        resetFilters,
        isAnyFilterActive
    }
}
