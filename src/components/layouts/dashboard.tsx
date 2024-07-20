import Head from 'next/head'
import Router, { useRouter } from 'next/router'
import cookie from 'js-cookie'
import Link from 'next/link'
import Image from 'next/image'


export const siteTitle = 'SailViz'


export default function Dashboard({
    children,
    club,
    displayName
}: {
    children: React.ReactNode
    club?: string
    displayName?: string
}) {
    const router = useRouter()
    return (
        <div className="h-screen">
            <Head>
                <link rel="shortcut icon" href="/favicon.ico" />
                <title>{siteTitle}</title>
                <meta
                    name="description"
                    content="An online tool for managing sailing races."
                />
            </Head>
            <div className="flex flex-col h-full overflow-hidden">
                <nav className="bg-white border-pink-500 dark:bg-gray-900 border-b">
                    <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
                        <a href="#" className="flex items-center space-x-3 rtl:space-x-reverse">
                            <img src="/favicon.ico" className="h-8"
                                 alt="Logo"/>
                            <span className="self-center text-2xl font-semibold whitespace-nowrap">Sailviz - {club}</span>
                        </a>
                        <div className="hidden w-full md:block md:w-auto" id="navbar-default">
                            <a href="#" className="block">
                                Logged In:
                                <span className="font-semibold"> {displayName}</span>
                            </a>
                        </div>
                    </div>
                </nav>
                <main className="gap-4">{children}</main>
            </div>
        </div>
    )
}