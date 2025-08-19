import Link from 'next/link'

export const Footer = () => {
    return (
        <div className='w-full py-10 bg-gray-900 text-white'>
            <div className='container mx-auto'>
                <div className='grid lg:grid-cols-3 gap-10'>
                    <div className='flex flex-col gap-4'>
                        <h2 className='text-3xl font-bold'>SailViz</h2>
                        <p className='text-sm text-gray-400'>Revolutionizing Sailing Race Management</p>
                        <p className='text-sm text-gray-400'>Gloucestershire, UK</p>
                    </div>
                    <div className='flex flex-col gap-2'>
                        <h3 className='text-lg font-semibold'>Quick Links</h3>
                        <Link href='/' className='text-sm text-gray-300 hover:text-white'>
                            Home
                        </Link>
                        <Link href='/Pricing' className='text-sm text-gray-300 hover:text-white'>
                            Pricing
                        </Link>
                    </div>
                    <div className='flex flex-col gap-2'>
                        <h3 className='text-lg font-semibold'>Get in Touch</h3>
                        <p className='text-sm text-gray-400'>Email: admin@sailviz.com</p>
                    </div>
                </div>
                <div className='mt-10 text-center text-sm text-gray-500'>© 2025 SailViz. All rights reserved.</div>
            </div>
        </div>
    )
}
