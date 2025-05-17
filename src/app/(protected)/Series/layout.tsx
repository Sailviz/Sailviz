import Link from 'next/link'

export default function Layout({ create, children }: { create: React.ReactNode; children: React.ReactNode }) {
    return (
        <>
            <div>{create}</div>
            <div>{children}</div>
        </>
    )
}
