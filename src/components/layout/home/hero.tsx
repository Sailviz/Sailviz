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
                        <h1 className='text-5xl md:text-7xl max-w-3xl tracking-tighter text-center font-regular'>From Entry to Results</h1>
                        <h1 className='text-5xl md:text-7xl max-w-2xl tracking-tighter text-center font-regular'>All in One Platform</h1>
                        <p className='text-lg md:text-xl leading-relaxed tracking-tight text-muted-foreground max-w-3xl text-center'>
                            Say goodbye to manual timekeeping, paper score sheets, and delayed results. <br />
                            Modern sailing deserves modern technology that just works.
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
