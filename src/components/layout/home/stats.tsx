'use client'
import { MoveDownLeft, MoveUpRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import useSWR from 'swr'
import * as Fetcher from '@/components/Fetchers'
export function Stats() {
    var { data, error, isValidating } = useSWR('/api/GetGlobalLaps', Fetcher.fetcher)
    if (data == undefined) {
        data = 0
    }

    return (
        <div className='w-full py-20 lg:py-40'>
            <div className='container mx-auto'>
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-10'>
                    <div className='flex gap-4 flex-col items-start'>
                        <div className='flex gap-2 flex-col'>
                            <h2 className='text-xl md:text-5xl tracking-tighter lg:max-w-xl font-regular text-left'>Trusted platform</h2>
                            <p className='text-lg lg:max-w-sm leading-relaxed tracking-tight text-muted-foreground text-left'>
                                Learning to become a race officer is complicated. Avoid further complications by ditching outdated, tedious methods. Our goal is to streamline
                                race results, making it easier and faster than ever to get results correct.
                            </p>
                        </div>
                    </div>
                    <div className='flex justify-center items-center'>
                        <div className='grid text-left grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 w-full gap-2'>
                            <div className='flex gap-0 flex-col justify-between p-6 border rounded-md'>
                                <MoveUpRight className='w-4 h-4 mb-10 text-primary' />
                                <h2 className='text-4xl tracking-tighter max-w-xl text-left font-regular flex flex-row gap-4 items-end'>{data}</h2>
                                <p className='text-base leading-relaxed tracking-tight text-muted-foreground max-w-xl text-left'>Laps Raced</p>
                            </div>
                            <div className='flex gap-0 flex-col justify-between p-6 border rounded-md'>
                                <MoveUpRight className='w-4 h-4 mb-10' />
                                <h2 className='text-4xl tracking-tighter max-w-xl text-left font-regular flex flex-row gap-4 items-end'>2</h2>
                                <p className='text-base leading-relaxed tracking-tight text-muted-foreground max-w-xl text-left'>Clubs Joined</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
