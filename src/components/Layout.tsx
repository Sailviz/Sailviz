import Head from 'next/head'
import { ToastContainer, toast } from 'react-toastify';

export const siteTitle = 'SRM'


export default function Layout({
    children,
    home
  }: {
    children: React.ReactNode
    home?: boolean
  }) {
    return (
    <div className="h-screen">
        <Head>
        <link rel="shortcut icon" href="/favicon.ico"/>
        <title>{siteTitle}</title>
        <meta
            name="description"
            content="Play the pirate game with your friends"
        />
        {/* image for when link is shared on social media */}
        <meta
            property="og:image"
            content={`https://og-image.vercel.app/${encodeURI(
            siteTitle
            )}.png?theme=light&md=0&fontSize=75px&images=https%3A%2F%2Fassets.zeit.co%2Fimage%2Fupload%2Ffront%2Fassets%2Fdesign%2Fnextjs-black-logo.svg`}
        />
        </Head>
        <ToastContainer />
        <div className="flex flex-col h-full">
            <nav className="border-pink-500 px-4 sm:px-4 py-2.5 border-b-2 flex">
                <div className="container flex flex-wrap justify-between items-center mx-auto">
                    <a href="/" className="flex items-center">
                        <img src="/favicon.ico" className="mr-3 h-6 sm:h-9" alt="Flowbite Logo" />
                        <span className="self-center text-xl font-semibold whitespace-nowrap text-gray-700">SRM</span>
                    </a>
                    <div className="hidden w-full md:block md:w-auto" id="navbar-default">
                    <ul className="flex flex-col mt-4 md:flex-row md:space-x-8 md:mt-0 md:text-sm md:font-medium">
                        <li>
                            <a href="About" className="block py-2 pr-4 pl-3 text-gray-700 border-b border-gray-100 hover:bg-gray-50 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0">About</a>
                        </li>
                        <li>
                            <a href="Join" className="block py-2 pr-4 pl-3 text-gray-700 border-b border-gray-100 hover:bg-gray-50 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0">Join</a>
                        </li>
                        <li>
                            <a href="#" className="block py-2 pr-4 pl-3 text-gray-700 hover:bg-gray-50 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 ">Contact</a>
                        </li>
                        <li>
                            <a href="/Login" className="text-white bg-blue-700 hover:bg-pink-500 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-3 md:mr-0">Login</a>
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