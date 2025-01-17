import BackButton from "components/ui/backButton";
import { Layout } from "components/ui/dashboard/layout";
import { Metadata } from 'next'
import 'styles/globals.css'

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
        <div>
            <div className="bg-green-500 text-center p-3 font-bold flex flex-row justify-between">
                <BackButton />
                <div className=" text-center">Demo Mode</div>
                <div></div>
            </div>
            {children}
        </div>
    )
}