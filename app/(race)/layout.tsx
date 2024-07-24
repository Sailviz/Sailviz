import { Button } from "@nextui-org/react";
import { Metadata } from 'next'
import 'styles/globals.css'
import { use } from "chai";
import BackButton from "components/ui/backButton";

export const metadata: Metadata = {
    title: 'SailViz',
    description: 'Sailing race system for clubs and regattas',
}
export default function DashboardLayout({
    children, // will be a page or nested layout
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex flex-col h-full overflow-hidden">
            <nav className="border-gray-400 px-4 sm:px-4 py-2.5 border-b-2 flex h-16">
                <div className="container flex flex-wrap justify-between items-center mx-auto">
                    <div className="flex items-center">
                        <div className='flex flex-row'>
                            <div className="px-3">
                                <BackButton />
                            </div>
                            <div className=' text-4xl font-bold text-blue-600 px-1 cursor-pointer'>SailViz - </div>
                            <p className="text-4xl font-bold text-blue-600 px-1 cursor-pointer">
                                club name
                            </p>
                            <p className=" text-xl font-semibold whitespace-nowrap text-gray-700 px-3 py-2">
                                logged in as user
                            </p>
                        </div>
                    </div>
                </div>
            </nav>
            <main className="flex items-stretch w-full h-full">{children}</main>
        </div>
    )
}