'use client'
import { SailVizIcon } from '@/components/icons/sailviz-icon'
import Link from 'next/link'

export default function HomeFooter({}) {
    return (
        <footer className='w-full flex flex-col items-center justify-center py-3'>
            <div className='flex items-center gap-2'>
                <p>&copy; 2024 SailViz. All rights reserved.</p>
                <p>
                    Contact us: <a href='mailto:admin@sailviz.com'>admin@sailviz.com</a>
                </p>
            </div>
            <div className='flex flex-row'>
                <span className='text-default-600'>Powered by&ensp;</span>
                <Link className='flex items-center gap-1 text-current' href='https://nextui.org/' title='nextui.org homepage'>
                    <p className='text-primary'>NextUI</p>
                </Link>
                <span className='text-default-600'>&ensp;and&ensp;</span>
                <Link className='flex items-center gap-1 text-current' href='https://nextjs.org/' title='nextjs.org homepage'>
                    <p className='text-primary'>NextJS</p>
                </Link>
            </div>
        </footer>
    )
}
