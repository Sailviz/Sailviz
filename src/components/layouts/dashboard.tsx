import Head from 'next/head'
import Router, { useRouter } from 'next/router'
import cookie from 'js-cookie'
import Link from 'next/link'
import Image from 'next/image'
import React from "react";


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
                        <div id="nav_back" onClick={() => router.back()}
                             className="hidden md:flex md:visible btn-pink">

                            &lt; Back
                        </div>
                        <a href="/Dashboard" className="flex space-x-3">
                            <img src="/favicon.ico" className="h-8"
                                 alt="Logo"/>
                            <span
                                className="self-center text-xl font-semibold md:text-2xl">Sailviz - {club}</span>
                        </a>
                        <div className="w-full text-center md:block md:w-auto" id="navbar-default">
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