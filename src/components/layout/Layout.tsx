import Link from 'next/link'
import Image from 'next/image'
import { ThemeSwitcher } from '../ui/ThemeSwitcher'
export const siteTitle = 'SailViz'

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className='h-screen font-baylon'>
            <div className='flex flex-col h-full'>
                <nav className='border-pink-500 px-4 sm:px-4 py-2.5 border-b-2 flex'>
                    <div className='container flex flex-wrap justify-between items-center mx-auto'>
                        <Link href={'/'}>
                            <div className=' text-xl font-bold text-blue-600 p-1 cursor-pointer'>SailViz</div>
                        </Link>
                        <div className='hidden w-full md:block md:w-auto' id='navbar-default'>
                            <ul className='flex flex-col mt-4 md:flex-row md:space-x-8 md:mt-0 md:text-sm md:font-medium'>
                                <li>
                                    <ThemeSwitcher />
                                </li>
                                <li>
                                    <Link
                                        href='/About'
                                        className='block py-2 pr-4 pl-3 text-gray-700 border-b border-gray-100 hover:bg-gray-50 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0'
                                    >
                                        About
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href='/Contact'
                                        className='block py-2 pr-4 pl-3 text-gray-700 hover:bg-gray-50 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 '
                                    >
                                        Contact
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href='/Login'
                                        className='text-white bg-blue-700 hover:bg-pink-500 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-3 md:mr-0'
                                    >
                                        Login
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                </nav>
                <main className='flex items-stretch h-full'>{children}</main>
            </div>
        </div>
    )
}
