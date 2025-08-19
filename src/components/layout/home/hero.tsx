'use client'
import { MoveDown, MoveRight, PhoneCall } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export function Hero() {
    const router = useRouter()

    return (
        <div className='w-full bg-gradient-to-b from-blue-500 to-blue-700 text-white py-20'>
            <div className='container mx-auto'>
                <div className='flex gap-4 py-10 lg:py-20 items-center justify-center flex-col'>
                    <div className='flex gap-4 flex-col text-center'>
                        <h1 className='text-6xl md:text-8xl max-w-3xl tracking-tighter font-bold'>Revolutionise Sailing Race Management</h1>
                        <p className='text-lg md:text-xl leading-relaxed tracking-tight max-w-3xl'>
                            Simplify your race day with cutting-edge technology. From automated starts to real-time results, SailViz has everything you need to run a smooth
                            and efficient sailing event.
                        </p>
                    </div>
                    <div className='flex flex-row gap-3'>
                        <Button size='lg' className='gap-2 bg-yellow-500 hover:bg-yellow-600' onClick={() => router.push('/Demo')}>
                            Try the Demo Now <MoveRight className='w-4 h-4' />
                        </Button>
                        <Button
                            size='lg'
                            className='gap-2 bg-white text-blue-700 hover:bg-gray-100'
                            onClick={() => document.getElementById('features-section')?.scrollIntoView({ behavior: 'smooth' })}
                        >
                            Learn More <MoveDown className='w-4 h-4' />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
