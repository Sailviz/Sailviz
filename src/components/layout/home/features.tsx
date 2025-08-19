import { Check } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export const Features = () => (
    <div className='w-full bg-gray-100 py-20' id='features-section'>
        <div className='container mx-auto'>
            <div className='flex gap-4 py-10 lg:py-20 flex-col items-center'>
                <div className='flex gap-2 flex-col text-center'>
                    <h2 className='text-4xl md:text-6xl tracking-tighter font-bold'>Why Choose SailViz?</h2>
                    <p className='text-lg md:text-xl leading-relaxed tracking-tight text-muted-foreground max-w-3xl'>
                        Discover the features that make SailViz the ultimate solution for sailing race management.
                    </p>
                </div>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 pt-12 w-full'>
                    <div className='flex flex-row gap-6 items-start'>
                        <Check className='w-6 h-6 mt-2 text-blue-500' />
                        <div className='flex flex-col gap-2'>
                            <h3 className='text-xl font-semibold'>Automated Start Procedure</h3>
                            <p className='text-muted-foreground text-base'>Customizable start sequences with automated sound signals to ensure precision.</p>
                        </div>
                    </div>
                    <div className='flex flex-row gap-6 items-start'>
                        <Check className='w-6 h-6 mt-2 text-blue-500' />
                        <div className='flex flex-col gap-2'>
                            <h3 className='text-xl font-semibold'>Touch-Friendly Interface</h3>
                            <p className='text-muted-foreground text-base'>Designed for seamless use on touchscreens, making race management intuitive.</p>
                        </div>
                    </div>
                    <div className='flex flex-row gap-6 items-start'>
                        <Check className='w-6 h-6 mt-2 text-blue-500' />
                        <div className='flex flex-col gap-2'>
                            <h3 className='text-xl font-semibold'>Digital Race Entry</h3>
                            <p className='text-muted-foreground text-base'>Ensure accuracy and readability with digital entry forms.</p>
                        </div>
                    </div>
                    <div className='flex flex-row gap-6 items-start'>
                        <Check className='w-6 h-6 mt-2 text-blue-500' />
                        <div className='flex flex-col gap-2'>
                            <div className='flex flex-row gap-3 items-start'>
                                <h3 className='text-xl font-semibold'>Live Results</h3>
                                <Badge className='bg-blue-500 text-white dark:bg-blue-600 my-auto' variant='outline'>
                                    Pro
                                </Badge>
                            </div>
                            <p className='text-muted-foreground text-base'>View corrected results in real-time, keeping everyone informed.</p>
                        </div>
                    </div>
                    <div className='flex flex-row gap-6 items-start'>
                        <Check className='w-6 h-6 mt-2 text-blue-500' />
                        <div className='flex flex-col gap-2'>
                            <div className='flex flex-row gap-3 items-start'>
                                <h3 className='text-xl font-semibold'>Multiple Fleets</h3>
                                <Badge className='bg-blue-500 text-white dark:bg-blue-600 my-auto' variant='outline'>
                                    Pro
                                </Badge>
                            </div>
                            <p className='text-muted-foreground text-base'>Manage races with multiple fleets simultaneously for added flexibility.</p>
                        </div>
                    </div>
                    <div className='flex flex-row gap-6 items-start'>
                        <Check className='w-6 h-6 mt-2 text-blue-500' />
                        <div className='flex flex-col gap-2'>
                            <h3 className='text-xl font-semibold'>Trackable.uk Integration</h3>
                            <p className='text-muted-foreground text-base'>Live boat position tracking with laps and timing for enhanced accuracy.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
)
