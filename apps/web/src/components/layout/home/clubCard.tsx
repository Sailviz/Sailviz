import { Link } from '@tanstack/react-router'

type CardProps = {
    name?: string
    link: string
}

export default function ClubCard({ name, link }: CardProps) {
    return (
        <Link to={link}>
            <div className='flex flex-col justify-center p-6 border-2  rounded shadow-xl cursor-pointer h-56 w-96'>
                <img src='https://placehold.co/600x300' alt='' width={600} height={300}></img>
                <h2 className='text-2xl text-gray-700'>{name}</h2>
            </div>
        </Link>
    )
}
