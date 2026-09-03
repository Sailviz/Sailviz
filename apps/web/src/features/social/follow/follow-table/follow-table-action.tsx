import { DataTableResetFilter } from '@components/ui/table/data-table-reset-filter'
import { DataTableSearch } from '@components/ui/table/data-table-search'
import { useSeriesTableFilters } from './use-follow-table-filters'
import { DataTableFilterBox } from '@components/ui/table/data-table-filter-box'

export default function SeriesTableAction() {
    const { tagFilter, setTagFilter, isAnyFilterActive, resetFilters, searchQuery, setPage, setSearchQuery } = useSeriesTableFilters()
    return (
        <div className='flex flex-wrap items-center gap-4'>
            <DataTableSearch searchKey='name' searchQuery={searchQuery} setSearchQuery={setSearchQuery} setPage={setPage} />
            <DataTableFilterBox filterKey='tag' title='Tag' options={[]} setFilterValue={setTagFilter} filterValue={tagFilter} />
            <DataTableResetFilter isFilterActive={isAnyFilterActive} onReset={resetFilters} />
        </div>
    )
}
