'use client'
import { MoveUpRight } from 'lucide-react'
import useSWR from 'swr'
import * as Fetcher from '@/components/Fetchers'
export function Stats() {
    var { data, error, isValidating } = useSWR('/api/GetGlobalLaps', Fetcher.fetcher)
    if (data == undefined) {
        data = 0
    }

    const { clubs, clubsIsError, clubsIsValidating } = Fetcher.Clubs()
    console.log('Clubs:', clubs)
    const clubCount = clubs ? clubs.length : 0

    return (
        <div className='w-full bg-white py-20 lg:py-40'>
            <div className='container mx-auto'>
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-10'>
                    <div className='flex gap-4 flex-col items-start'>
                        <div className='flex gap-2 flex-col'>
                            <h2 className='text-4xl md:text-6xl tracking-tighter font-bold text-left'>Trusted by Sailing Enthusiasts Worldwide</h2>
                            <p className='text-lg lg:max-w-sm leading-relaxed tracking-tight text-muted-foreground text-left'>
                                Simplify race management with a platform designed to make your life easier. Join the growing community of clubs and sailors who trust SailViz.
                            </p>
                        </div>
                    </div>
                    <div className='flex justify-center items-center'>
                        <div className='grid text-left grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 w-full gap-6'>
                            <div className='flex gap-0 flex-col justify-between p-6 border rounded-md shadow-md'>
                                <MoveUpRight className='w-6 h-6 mb-10 text-blue-500' />
                                <h2 className='text-5xl tracking-tighter font-bold flex flex-row gap-4 items-end'>{data}</h2>
                                <p className='text-base leading-relaxed tracking-tight text-muted-foreground'>Laps Raced</p>
                            </div>
                            <div className='flex gap-0 flex-col justify-between p-6 border rounded-md shadow-md'>
                                <MoveUpRight className='w-6 h-6 mb-10 text-blue-500' />
                                <h2 className='text-5xl tracking-tighter font-bold flex flex-row gap-4 items-end'>{clubCount}</h2>
                                <p className='text-base leading-relaxed tracking-tight text-muted-foreground'>Clubs Using SailViz</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
