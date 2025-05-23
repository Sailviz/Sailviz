'use client'
import LapsCounter from '@/components/layout/home/LapsCounter'
import { useTheme } from 'next-themes'
import { title, subtitle } from '@/components/layout/home/primitaves'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardFooter, CardHeader } from '@/components/ui/card'
import Image from 'next/image'

export default function Page() {
    const { theme, setTheme } = useTheme()

    const router = useRouter()

    //force home page to light theme
    setTheme('light')

    return (
        <div className='flex flex-col items-center justify-center gap-4'>
            <div className='inline-block max-w-xl text-left justify-left p-4 sm:p-12'>
                <h1 className={title()}>Organise&nbsp;</h1>
                <h1 className={title({ color: 'violet' })}>Races&nbsp;</h1>
                <br />
                <h1 className={title()}>without the hassle.</h1>
                <h2 className={subtitle({ class: 'mt-4' })}>Efficiently manage Competitors, Races and Results.</h2>
            </div>

            <Button color='primary' onClick={() => router.push('/Demo')}>
                Try it now!
            </Button>

            <div className='w-full gap-2 grid grid-cols-12 grid-rows-2 px-8'>
                <Card className='col-span-12 sm:col-span-2 h-[300px]'>
                    <CardHeader>
                        <p className='text-tiny text-black/60 uppercase font-bold'>Race Sign On</p>
                        <h4 className='text-black font-medium text-large'>Digital Race Sign On</h4>
                    </CardHeader>
                </Card>

                <Card className='col-span-12 sm:col-span-2 h-[300px]'>
                    <CardHeader>
                        <p className='text-tiny text-black/60 uppercase font-bold'>Starting</p>
                        <h4 className='text-black font-medium text-large'>Fully automated start procedure</h4>
                    </CardHeader>
                </Card>
                <Card className='col-span-12 sm:col-span-2 h-[300px]'>
                    <CardHeader>
                        <p className='text-tiny text-black/60 uppercase font-bold'>Racing</p>
                        <h4 className='text-black font-medium text-large'>Touch friendly interface for recording lap times</h4>
                    </CardHeader>
                </Card>
                <Card className='col-span-12 sm:col-span-2 h-[300px]'>
                    <CardHeader>
                        <p className='text-tiny text-black/60 uppercase font-bold'>Live Results</p>
                        <h4 className='text-black font-medium text-large'>See Calculated Positions in real-time</h4>
                    </CardHeader>
                </Card>
                <Card className='w-full col-span-12 sm:col-span-4'>
                    <CardHeader>
                        <p className='text-tiny text-black/60 uppercase font-bold'>Upcoming Feature</p>
                        <h4 className='text-black font-medium text-2xl'>Live Boat Tracking</h4>
                    </CardHeader>
                    <CardFooter>
                        <Button className='w-full'>Notify Me</Button>
                    </CardFooter>
                </Card>
            </div>
            <LapsCounter />
        </div>
    )
}
