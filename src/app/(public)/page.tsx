import { Hero } from '@/components/layout/home/hero'
import { Features } from '@/components/layout/home/features'
import { Stats } from '@/components/layout/home/stats'
import { Footer } from '@/components/layout/home/footer'
export default async function Page() {
    return (
        <>
            <Hero />
            <Features />
            <Stats />
            <Footer />
        </>
    )
}
