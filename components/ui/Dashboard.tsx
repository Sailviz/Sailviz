import { useRouter } from 'next/navigation';
import cookie from 'js-cookie'
import Link from 'next/link'
import Image from 'next/image'
import * as Fetcher from '../Fetchers';


export const siteTitle = 'SailViz'


export default function Dashboard({
    children,
}: {
    children: React.ReactNode
}) {
    const Router = useRouter()

    const { user, userIsValidating, userIsError } = Fetcher.UseUser()
    const { club, clubIsValidating, clubIsError } = Fetcher.UseClub()
    return (
        <div className="h-screen">
            <div className="flex flex-col h-full overflow-hidden">
                <nav className="border-pink-500 px-4 sm:px-4 py-2.5 border-b-2 flex h-20">
                    <div className="container flex flex-wrap justify-between items-center mx-auto">
                        <div className="flex items-center">
                            <div className='flex flex-row'>
                                <div id="Back" onClick={() => Router.back()} className="flex cursor-pointer text-white bg-blue-600 hover:bg-pink-500 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-lg px-5 py-2.5 text-center mr-6">
                                    Back
                                </div>
                                <div className=' text-4xl font-bold text-blue-600 p-1 cursor-pointer' onClick={() => Router.push("/Dashboard")}>SailViz - </div>
                                <p className="text-4xl font-bold text-blue-600 p-1 cursor-pointer">
                                    {club?.name}
                                </p>
                                <p className=" text-xl font-semibold whitespace-nowrap text-gray-700 p-3">
                                    logged in as {user?.displayName}
                                </p>
                            </div>
                        </div>
                        <div className="hidden w-full md:block md:w-auto" id="navbar-default">
                            <ul className="flex flex-col mt-4 md:flex-row md:space-x-8 md:mt-0 md:text-sm md:font-medium">
                                <li>
                                    <a onClick={(e) => { cookie.remove('token'); cookie.remove('clubId'); Router.push('/') }} className="text-white bg-pink-500 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-3 md:mr-0">Log Out</a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </nav>
                <main className="flex items-stretch w-full h-full">{children}</main>
            </div>
        </div>
    )
}