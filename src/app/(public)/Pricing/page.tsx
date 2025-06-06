import { checkoutAction } from '@/lib/payments/actions'
import { Check } from 'lucide-react'
import { getStripePrices, getStripeProducts } from '@/lib/payments/stripe'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

// Prices are fresh for one hour max
export const revalidate = 3600

export default async function PricingPage() {
    const [prices, products] = await Promise.all([getStripePrices(), getStripeProducts()])
    const basePlan = products.find(product => product.name === 'SailViz')
    const proPlan = products.find(product => product.name === 'SailViz Pro')

    const basePrice = prices.find(price => price.productId === basePlan?.id)
    const proPrice = prices.find(price => price.productId === proPlan?.id)

    return (
        <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
            <div className='grid md:grid-cols-2 gap-8 max-w-xl mx-auto'>
                <PricingCard
                    name={basePlan?.name || 'Base'}
                    price={basePrice?.unitAmount || 800}
                    interval={basePrice?.interval || 'month'}
                    features={['Unlimited Races', 'Unlimited Racers', 'Email Support']}
                    priceId={basePrice?.id}
                />
                <PricingCard
                    name={proPlan?.name || 'Pro'}
                    price={proPrice?.unitAmount || 1200}
                    interval={proPrice?.interval || 'month'}
                    features={['Everything in Base, and:', 'Multiple Fleets', 'Live Results']}
                    priceId={proPrice?.id}
                />
            </div>
            <div className='mt-12 text-center'>
                <Link href='/Register'>
                    <Button size={'lg'}> Start Now</Button>
                </Link>
            </div>
        </main>
    )
}

function PricingCard({ name, price, interval, features, priceId }: { name: string; price: number; interval: string; features: string[]; priceId?: string }) {
    return (
        <div className='pt-6'>
            <h2 className='text-2xl font-medium text-gray-900 mb-2'>{name}</h2>
            <p className='text-4xl font-medium text-gray-900 mb-6'>
                ${price / 100} <span className='text-xl font-normal text-gray-600'>per club / {interval}</span>
            </p>
            <ul className='space-y-4 mb-8'>
                {features.map((feature, index) => (
                    <li key={index} className='flex items-start'>
                        <Check className='h-5 w-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0' />
                        <span className='text-gray-700'>{feature}</span>
                    </li>
                ))}
            </ul>
        </div>
    )
}
