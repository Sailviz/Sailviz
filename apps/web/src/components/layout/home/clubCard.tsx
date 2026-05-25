import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { orpcClient } from '@lib/orpc'

type CardProps = {
    name?: string
    link: string
    clubId: string
}

export default function ClubCard({ name, link, clubId }: CardProps) {
    const imageURL = useQuery(orpcClient.image.orgBanner.queryOptions({ input: { orgId: clubId } })).data as string | null
    console.log('Image URL for club', clubId, ':', imageURL)
    return (
        <Link to={link}>
            <div className='flex flex-col justify-center p-6 border-2  rounded shadow-xl cursor-pointer h-56 w-96'>
                <img src={imageURL || 'https://placehold.co/600x300'} alt='' width={600} height={300}></img>
                <h2 className='text-2xl text-gray-700'>{name}</h2>
            </div>
        </Link>
    )
}
