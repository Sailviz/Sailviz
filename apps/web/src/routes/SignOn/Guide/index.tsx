// @ts-ignore: MDX module has no type declarations in this repo
import Docs from '@documentation/guides/SignOn.mdx'
import { createFileRoute } from '@tanstack/react-router'

function Page() {
    return (
        <div className='flex justify-center w-full pt-12'>
            <div className='w-8/12 print:!w-full'>
                <Docs />
            </div>
        </div>
    )
}
export const Route = createFileRoute('/SignOn/Guide/')({
    component: Page
})
