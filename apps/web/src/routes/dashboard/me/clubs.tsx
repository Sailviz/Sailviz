import { orpcClient } from '@lib/orpc'
import { type Session } from '@lib/session'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link, useLoaderData } from '@tanstack/react-router'
import * as Types from '@sailviz/types'
import { Button } from '@components/ui/button'
import { StarIcon } from 'lucide-react'
export const Route = createFileRoute('/Dashboard/me/clubs')({
    component: RouteComponent
})

function RouteComponent() {
    const queryClient = useQueryClient()
    const session: Session = useLoaderData({ from: `__root__` })
    console.log('Session in clubs route:', session)
    const orgs = useQuery(orpcClient.organization.all.queryOptions()).data as Types.Org[]

    const favouriteOrgs = useQuery(orpcClient.user.favouriteOrgs.queryOptions()).data as Types.userFavouriteOrgsType[]

    const addFavouriteMutation = useMutation(orpcClient.user.addFavourite.mutationOptions())

    const addFavourite = async (orgId: string) => {
        console.log('Adding favourite organization:', orgId)
        try {
            await addFavouriteMutation.mutateAsync({ orgId })
            await queryClient.invalidateQueries({
                queryKey: orpcClient.user.favouriteOrgs.key({ type: 'query' })
            })
        } catch (error) {
            console.error('Error adding favourite organization:', error)
        }
    }

    const removeFavouriteMutation = useMutation(orpcClient.user.removeFavourite.mutationOptions())
    const removeFavourite = async (orgId: string) => {
        console.log('Removing favourite organization:', orgId)
        try {
            await removeFavouriteMutation.mutateAsync({ orgId })
            await queryClient.invalidateQueries({
                queryKey: orpcClient.user.favouriteOrgs.key({ type: 'query' })
            })
        } catch (error) {
            console.error('Error removing favourite organization:', error)
        }
    }

    console.log('Favourite organizations:', session.user)
    if (!session.user || !orgs) {
        return <div>Loading...</div>
    }
    return (
        <div>
            <h1 className='text-2xl font-bold mb-4 px-6'>My Clubs</h1>
            <div className='flex flex-row flex-wrap px-6'>
                {orgs
                    ?.filter(org => favouriteOrgs?.flatMap((org: any) => org.orgId).includes(org.id))
                    .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
                    .map((club: Types.Org) => (
                        <div key={club.id} className='p-4 w-96 '>
                            <Link to={'/club/' + club.name}>
                                <div className='flex flex-col justify-center p-6 border-2  rounded shadow-xl cursor-pointer h-64 w-96 m-4'>
                                    <div className='inline-block relative'>
                                        <Button
                                            variant='outline'
                                            size='icon'
                                            className='rounded-full absolute -top-4 -right-4'
                                            onClick={e => {
                                                e.preventDefault()
                                                removeFavourite(club.id)
                                            }}
                                        >
                                            <StarIcon color='gold' fill='gold' />
                                        </Button>
                                        <img src='https://placehold.co/600x300' alt='' width={600} height={300}></img>
                                    </div>
                                    <h2 className='text-2xl text-gray-700'>{club.name}</h2>
                                </div>
                            </Link>
                        </div>
                    ))}
            </div>
            <h1 className='text-2xl font-bold my-4 px-6'>All Clubs</h1>
            <div className='flex flex-row flex-wrap px-6'>
                {orgs
                    ?.filter(org => !favouriteOrgs?.flatMap((org: any) => org.orgId).includes(org.id))
                    .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
                    .map((club: Types.Org) => (
                        <div key={club.id} className='p-3 w-96 '>
                            <Link to={'/club/' + club.name}>
                                <div className='flex flex-col justify-center p-6 border-2  rounded shadow-xl cursor-pointer h-64 w-96 m-4'>
                                    <div className='inline-block relative'>
                                        <Button
                                            variant='outline'
                                            size='icon'
                                            className='rounded-full absolute -top-4 -right-4'
                                            onClick={e => {
                                                e.preventDefault()
                                                addFavourite(club.id)
                                            }}
                                        >
                                            <StarIcon />
                                        </Button>
                                        <img src='https://placehold.co/600x300' alt='' width={600} height={300}></img>
                                    </div>
                                    <h2 className='text-2xl text-gray-700'>{club.name}</h2>
                                </div>
                            </Link>
                        </div>
                    ))}
            </div>
        </div>
    )
}
