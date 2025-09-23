import ClubCard from '@/components/layout/home/clubCard'

export const revalidate = 3600 // Revalidate the page every hour

interface ClubDataType {
    id: string
    displayName: string
    name: string
}

const Page = async () => {
    const clubs = await fetch('https://localhost:3000/api/GetClubs', {
        next: { revalidate }
    }).then(res => {
        return res.json()
    })

    return (
        <div className='flex flex-row flex-wrap px-6'>
            {clubs.map((club: ClubDataType) => (
                <div key={club.id} className='p-3'>
                    <ClubCard name={club.displayName} link={'/club/' + club.name}></ClubCard>
                </div>
            ))}
        </div>
    )
}

export default Page
