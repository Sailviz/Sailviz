import { checkoutAction } from '@/lib/payments/actions'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useState } from 'react'
import { Select } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'

export default function PricingPage() {
    const [monthly, setMonthly] = useState(true)
    return (
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
            <div className='flex flex-row items-center justify-center mb-8'>
                <div className='text-lg font-bold'>Annually</div>
                <Switch
                    checked={monthly}
                    onCheckedChange={checked => {
                        setMonthly(checked)
                    }}
                    className='m-4'
                >
                    <span className='text-sm text-gray-600'>Monthly</span>
                    <span className='ml-2 text-sm text-gray-600'>Yearly</span>
                </Switch>
                <div className='text-lg font-bold'>Monthly</div>
            </div>
            <div className='grid md:grid-cols-2 gap-8 max-w-xl mx-auto'>
                <PricingCard
                    name={'SailViz'}
                    price={monthly ? 30 : 330}
                    interval={monthly ? 'month' : 'year'}
                    features={['Unlimited Races', 'Unlimited Racers', 'Email Support']}
                    priceId={monthly ? 'price_1RWlKP02rrqm9SsNwEEvRUMu' : 'price_1RX3nv02rrqm9SsN8D8hJPdg'}
                />
                <PricingCard
                    name={'SailViz Pro'}
                    price={monthly ? 50 : 550}
                    interval={monthly ? 'month' : 'year'}
                    features={['Everything in Base, and:', 'Multiple Fleets', 'Live Results']}
                    priceId={monthly ? 'price_1RX5Cb02rrqm9SsNxUCifUrq' : 'price_1RX5D602rrqm9SsNadC6XPNn'}
                />
            </div>
        </div>
    )
}

function PricingCard({ name, price, interval, features, priceId }: { name: string; price: number; interval: string; features: string[]; priceId?: string }) {
    return (
        <div className='pt-6'>
            <h2 className='text-2xl font-medium text-gray-900 mb-2'>{name}</h2>
            <p className='text-4xl font-medium text-gray-900 mb-6'>
                £{price} <span className='text-xl font-normal text-gray-600'>per club / {interval}</span>
            </p>
            <ul className='space-y-4 mb-8'>
                {features.map((feature, index) => (
                    <li key={index} className='flex items-start'>
                        <Check className='h-5 w-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0' />
                        <span className='text-gray-700'>{feature}</span>
                    </li>
                ))}
            </ul>
            <form action={checkoutAction}>
                <input type='hidden' name='priceId' value={priceId} />
                <Button> Start Now </Button>
            </form>
        </div>
    )
}
