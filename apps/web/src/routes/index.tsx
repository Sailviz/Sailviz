import { Hero } from '@components/layout/home/hero'
import { Features } from '@components/layout/home/features'
import { Stats } from '@components/layout/home/stats'
import { Footer } from '@components/layout/home/footer'
import { createFileRoute } from '@tanstack/react-router'
import HomeNav from '@componentslayout/home/navbar'

function HomePage() {
    return (
        <>
            <HomeNav />
            <Hero />
            <Features />
            <Stats />
            <Footer />
        </>
    )
}

export const Route = createFileRoute('/')({
    component: HomePage
})
