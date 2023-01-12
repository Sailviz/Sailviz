import Head from 'next/head'
import Router from 'next/router'
import cookie from 'js-cookie'
import Link from 'next/link'
import Image from 'next/image'

export const siteTitle = 'SRM'


export default function Dashboard({
    children,
    home
}: {
    children: React.ReactNode
    home?: boolean
}) {
    return (
        <div className="h-screen">
            <Head>
                <link rel="shortcut icon" href="/favicon.ico" />
                <title>{siteTitle}</title>
                <meta
                    name="description"
                    content="An online tool for managing sailing races."
                />
                {/* image for when link is shared on social media */}
                <meta
                    property="og:image"
                    content={`https://og-image.vercel.app/${encodeURI(
                        siteTitle
                    )}.png?theme=light&md=0&fontSize=75px&images=https%3A%2F%2Fassets.zeit.co%2Fimage%2Fupload%2Ffront%2Fassets%2Fdesign%2Fnextjs-black-logo.svg`}
                />
            </Head>
            <div className="flex flex-col h-full">
                <nav className="border-pink-500 px-4 sm:px-4 py-2.5 border-b-2 flex">
                    <div className="container flex flex-wrap justify-between items-center mx-auto">
                        <Link href="/" className="flex items-center">
                            <a className='flex flex-row'>
                                <Image src="/favicon.ico" className="mr-3 h-6 sm:h-9" width={40} height={40} />
                                <div className=" text-xl font-semibold whitespace-nowrap text-gray-700 p-3">
                                    SRM
                                </div>
                            </a>
                        </Link>
                        <div className="hidden w-full md:block md:w-auto" id="navbar-default">
                            <ul className="flex flex-col mt-4 md:flex-row md:space-x-8 md:mt-0 md:text-sm md:font-medium">
                                <li>
                                    <a onClick={(e) => { cookie.remove('token'); Router.push('/') }} className="text-white bg-pink-500 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-3 md:mr-0">Log Out</a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </nav>
                <main className="flex items-stretch h-full">{children}</main>
            </div>
        </div>
    )
}