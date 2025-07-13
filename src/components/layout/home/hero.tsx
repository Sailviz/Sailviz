'use client'
import { MoveDown, MoveRight, PhoneCall } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { subtitle, title } from './primitaves'
import { useRouter } from 'next/navigation'

export function Hero() {
    const router = useRouter()

    return (
        <div className='w-full'>
            <div className='container mx-auto'>
                <div className='flex gap-4 py-10 lg:py-20 items-center justify-center flex-col'>
                    <div className='flex gap-4 flex-col'>
                        <h1 className='text-5xl md:text-7xl max-w-2xl tracking-tighter text-center font-regular'>Simple Sailing Races</h1>
                        <p className='text-lg md:text-xl leading-relaxed tracking-tight text-muted-foreground max-w-2xl text-center'>
                            Simple and powerful management for your events. <br /> Efficiently manage Competitors, Races and Results.
                        </p>
                    </div>
                    <div className='flex flex-row gap-3'>
                        <Button size='lg' className='gap-2' onClick={() => router.push('/Demo')}>
                            Try the Demo <MoveRight className='w-4 h-4' />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
