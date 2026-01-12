import { Button } from '@components/ui/button'
// @ts-ignore: MDX module has no type declarations in this repo
import Docs from '@documentation/guides/RaceManagement.mdx'

import { useRef } from 'react'
import { useReactToPrint } from 'react-to-print'
import { useMDXComponents } from '@components/mdx-components'
import { MDXProvider } from '@mdx-js/react'
import { useNavigate, createFileRoute } from '@tanstack/react-router'

function Page() {
    const navigate = useNavigate()
    const contentRef = useRef<HTMLDivElement>(null)

    const handlePrint = useReactToPrint({
        contentRef,
        onAfterPrint: () => {
            // navigate back to the dashboard after printing
            navigate({ to: '/dashboard/Documentation' })
        }
    })
    return (
        <div className='flex flex-col justify-center w-full pt-12'>
            <div ref={contentRef} className='mx-6'>
                <MDXProvider components={useMDXComponents}>
                    <Docs />
                </MDXProvider>
            </div>
            <Button onClick={handlePrint} className='mt-4'>
                Print
            </Button>
        </div>
    )
}

export const Route = createFileRoute('/dashboard/Documentation/')({
    component: Page
})
