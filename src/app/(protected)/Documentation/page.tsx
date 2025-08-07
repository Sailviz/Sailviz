'use client'
import { Button } from '@/components/ui/button'
import Docs from 'documentation/guides/RaceManagement.mdx'
import { useRouter } from 'next/navigation'
import { useRef } from 'react'
import { useReactToPrint } from 'react-to-print'

export default function Page() {
    const Router = useRouter()
    const contentRef = useRef<HTMLDivElement>(null)

    const handlePrint = useReactToPrint({
        contentRef,
        onAfterPrint: () => {
            Router.back()
        }
    })
    return (
        <div className='flex flex-col justify-center w-full pt-12'>
            <div ref={contentRef} className='mx-6'>
                <Docs />
            </div>
            <Button onClick={handlePrint} className='mt-4'>
                Print
            </Button>
        </div>
    )
}
