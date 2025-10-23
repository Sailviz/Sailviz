import ClubCard from '@components/layout/home/clubCard'
import HomeNav from '@components/layout/home/navbar'
import { orpcClient } from '@lib/orpc'
import type { ClubType } from '@sailviz/types'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

const Page = async () => {
    const clubs = useQuery(orpcClient.club.all.queryOptions()).data as ClubType[]

    return (
        <>
            <HomeNav />
            <div className='flex flex-row flex-wrap px-6'>
                {clubs
                    ?.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
                    .map((club: ClubType) => (
                        <div key={club.id} className='p-3 w-96 '>
                            <ClubCard name={club.displayName} link={'/club/' + club.name}></ClubCard>
                        </div>
                    ))}
            </div>
        </>
    )
}

export const Route = createFileRoute('/club/')({
    component: Page
})
