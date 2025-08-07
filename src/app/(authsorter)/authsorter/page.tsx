import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function Dashboard() {
    const session = await auth.api.getSession({
        headers: await headers() // you need to pass the headers object.
    })

    if (!session) {
        return redirect('/')
    } else {
        if (session.user.admin) {
            return redirect('/admin/Dashboard')
        } else {
            return redirect('/Dashboard')
        }
    }
}
