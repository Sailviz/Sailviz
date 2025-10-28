import { createFileRoute, useLoaderData } from '@tanstack/react-router'
import { title } from '@components/layout/home/primitaves'

function Page() {
    const session = useLoaderData({ from: `__root__` })

    return (
        <div>
            <div className='p-6'>
                <h1 className={title({ color: 'blue' })}>Admin</h1>
            </div>
            <div className='flex flex-row'></div>
        </div>
    )
}

export const Route = createFileRoute('/admin/')({
    component: Page
})
