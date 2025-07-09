import { title } from '@/components/layout/home/primitaves'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
export default async function Page() {
    const session = await auth.api.getSession({
        headers: await headers() // you need to pass the headers object.
    })
    console.log('Session:', session)

    return (
        <div>
            <div className='p-6'>
                <h1 className={title({ color: 'blue' })}>Admin</h1>
            </div>
            <div className='flex flex-row'></div>
        </div>
    )
}
