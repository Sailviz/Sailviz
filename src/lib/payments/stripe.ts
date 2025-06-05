import Stripe from 'stripe'
import { redirect } from 'next/navigation'
import { auth } from '@/server/auth'
import prisma from '../prisma'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-05-28.basil'
})

export async function createCheckoutSession({ club, priceId }: { club: ClubDataType | null; priceId: string }) {
    const session = await auth()

    if (!club || !session) {
        redirect(`/sign-up?redirect=checkout&priceId=${priceId}`)
    }

    const stripeSession = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
            {
                price: priceId,
                quantity: 1
            }
        ],
        mode: 'subscription',
        success_url: `${process.env.BASE_URL}/api/stripe/checkout?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.BASE_URL}/pricing`,
        customer: club.stripe.customerId || undefined,
        client_reference_id: sessionStorage.user.id.toString(),
        allow_promotion_codes: true,
        subscription_data: {
            trial_period_days: 14
        }
    })

    redirect(stripeSession.url!)
}

export async function createCustomerPortalSession(club: ClubDataType) {
    if (!club.stripe.customerId || !club.stripe.productId) {
        redirect('/pricing')
    }

    let configuration: Stripe.BillingPortal.Configuration
    const configurations = await stripe.billingPortal.configurations.list()

    if (configurations.data.length > 0) {
        configuration = configurations.data[0]!
    } else {
        const product = await stripe.products.retrieve(club.stripe.productId)
        if (!product.active) {
            throw new Error("Team's product is not active in Stripe")
        }

        const prices = await stripe.prices.list({
            product: product.id,
            active: true
        })
        if (prices.data.length === 0) {
            throw new Error("No active prices found for the team's product")
        }

        configuration = await stripe.billingPortal.configurations.create({
            business_profile: {
                headline: 'Manage your subscription'
            },
            features: {
                subscription_update: {
                    enabled: true,
                    default_allowed_updates: ['price', 'quantity', 'promotion_code'],
                    proration_behavior: 'create_prorations',
                    products: [
                        {
                            product: product.id,
                            prices: prices.data.map(price => price.id)
                        }
                    ]
                },
                subscription_cancel: {
                    enabled: true,
                    mode: 'at_period_end',
                    cancellation_reason: {
                        enabled: true,
                        options: ['too_expensive', 'missing_features', 'switched_service', 'unused', 'other']
                    }
                },
                payment_method_update: {
                    enabled: true
                }
            }
        })
    }

    return stripe.billingPortal.sessions.create({
        customer: club.stripe.customerId,
        return_url: `${process.env.BASE_URL}/dashboard`,
        configuration: configuration.id
    })
}

export async function handleSubscriptionChange(subscription: Stripe.Subscription) {
    const customerId = subscription.customer as string
    const subscriptionId = subscription.id
    const status = subscription.status

    const club = await prisma.club.findFirst({
        where: {
            stripe: {
                customerId: customerId
            }
        }
    })

    if (!club) {
        console.error('Club not found for Stripe customer:', customerId)
        return
    }

    if (status === 'active' || status === 'trialing') {
        const plan = subscription.items.data[0]?.plan
        await prisma.club.update({
            where: {
                id: club.id
            },
            data: {
                stripe: {
                    update: {
                        customerId: customerId,
                        subscriptionId: subscriptionId,
                        productId: plan?.product as string,
                        planName: (plan?.product as Stripe.Product).name,
                        subscriptionStatus: status,
                        updatedAt: new Date().toISOString()
                    }
                }
            }
        })
    } else if (status === 'canceled' || status === 'unpaid') {
        await prisma.club.update({
            where: {
                id: club.id
            },
            data: {
                stripe: {
                    update: {
                        subscriptionId: null,
                        productId: null,
                        planName: null,
                        subscriptionStatus: status,
                        updatedAt: new Date().toISOString()
                    }
                }
            }
        })
    }
}

export async function getStripePrices() {
    const prices = await stripe.prices.list({
        expand: ['data.product'],
        active: true,
        type: 'recurring'
    })

    return prices.data.map(price => ({
        id: price.id,
        productId: typeof price.product === 'string' ? price.product : price.product.id,
        unitAmount: price.unit_amount,
        currency: price.currency,
        interval: price.recurring?.interval,
        trialPeriodDays: price.recurring?.trial_period_days
    }))
}

export async function getStripeProducts() {
    const products = await stripe.products.list({
        active: true,
        expand: ['data.default_price']
    })

    return products.data.map(product => ({
        id: product.id,
        name: product.name,
        description: product.description,
        defaultPriceId: typeof product.default_price === 'string' ? product.default_price : product.default_price?.id
    }))
}
