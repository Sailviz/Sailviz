import { Check } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export const Features = () => (
    <div className='w-full'>
        <div className='container mx-auto'>
            <div className='flex gap-4 py-20 lg:py-40 flex-col items-start'>
                <div className='flex gap-2 flex-col'>
                    <h2 className='text-3xl md:text-5xl tracking-tighter lg:max-w-xl font-regular'>Features</h2>
                </div>
                <div className='flex gap-10 pt-12 flex-col w-full'>
                    <div className='grid grid-cols-2 items-start lg:grid-cols-3 gap-10'>
                        <div className='flex flex-row gap-6 w-full items-start'>
                            <Check className='w-4 h-4 mt-2 text-primary' />
                            <div className='flex flex-col gap-1'>
                                <p>Automated Start Procedure</p>
                                <p className='text-muted-foreground text-sm'>Customisable start Procedure with automated sound signals.</p>
                            </div>
                        </div>
                        <div className='flex flex-row gap-6 items-start'>
                            <Check className='w-4 h-4 mt-2 text-primary' />
                            <div className='flex flex-col gap-1'>
                                <p>Touch Friendly Race Interface</p>
                                <p className='text-muted-foreground text-sm'>Designed for touchscreen use.</p>
                            </div>
                        </div>
                        <div className='flex flex-row gap-6 items-start'>
                            <Check className='w-4 h-4 mt-2 text-primary' />
                            <div className='flex flex-col gap-1'>
                                <p>Digital Race Entry</p>
                                <p className='text-muted-foreground text-sm'>Ensure readability and accuracy in entry details.</p>
                            </div>
                        </div>
                        <div className='flex flex-row gap-6 w-full items-start'>
                            <Check className='w-4 h-4 mt-2 text-primary' />
                            <div className='flex flex-col gap-1'>
                                <div>
                                    Live Results
                                    <Badge className='bg-blue-500 text-white dark:bg-blue-600 ml-4' variant='outline'>
                                        Pro
                                    </Badge>
                                </div>
                                <p className='text-muted-foreground text-sm'>View corrected results in real-time.</p>
                            </div>
                        </div>
                        <div className='flex flex-row gap-6 items-start'>
                            <Check className='w-4 h-4 mt-2 text-primary' />
                            <div className='flex flex-col gap-1'>
                                <div>
                                    Multiple Fleets
                                    <Badge className='bg-blue-500 text-white dark:bg-blue-600 ml-4' variant='outline'>
                                        Pro
                                    </Badge>
                                </div>
                                <p className='text-muted-foreground text-sm'>Race with multiple fleets simultaneously.</p>
                            </div>
                        </div>
                        <div className='flex flex-row gap-6 items-start'>
                            <Check className='w-4 h-4 mt-2 text-primary' />
                            <div className='flex flex-col gap-1'>
                                <p>Trackable.uk Integration</p>
                                <p className='text-muted-foreground text-sm'>Live boat position tracking with laps and timing.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
)
