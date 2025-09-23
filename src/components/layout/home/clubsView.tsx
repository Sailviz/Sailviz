import prisma from '@/lib/prisma'
import ClubCard from './clubCard'

export default async function ClubsView() {
    //TODO: remove demo club from results
    const clubs: ClubDataType[] = (await prisma.club.findMany({
        orderBy: {
            displayName: 'asc'
        }
    })) as unknown as ClubDataType[]

    console.log('Clubs:', clubs)

    return (
        <div className='flex flex-row flex-wrap px-6'>
            {clubs.map(club => (
                <div key={club.id} className='p-3'>
                    <ClubCard name={club.displayName} link={'/club/' + club.name}></ClubCard>
                </div>
            ))}
        </div>
    )
}
