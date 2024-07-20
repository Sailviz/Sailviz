import { Layout } from "components/ui/layout/layout";
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
        <Layout>
            {children}
        </Layout>
    )
}