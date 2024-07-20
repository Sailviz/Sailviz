import Link from 'next/link'

type CardProps = {
    name: string;
    description: string;
    link: string;
};

export default function Card ({
    name,
    description,
    link,
}: CardProps) {
    return (
        <Link href={link}>
            <section className="flex flex-col justify-center p-6 duration-500 border-2 border-pink-500 rounded shadow-xl motion-safe:hover:scale-105 cursor-pointer">
                <h2 className="text-2xl text-gray-700">{name}</h2>
                <p className="text-base text-gray-600">{description}</p>
            </section>
        </Link>
        
    );
};