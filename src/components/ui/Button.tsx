import Link from 'next/link'

export default function Button({ children, href, className }: { children: React.ReactNode; href: string; className?: string }) {
    return (
        <Link href={href} className={className}>
            <button className='w-full cursor-pointer text-white bg-blue-600 hover:bg-pink-500 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center'>
                {children}
            </button>
        </Link>
    )
}
