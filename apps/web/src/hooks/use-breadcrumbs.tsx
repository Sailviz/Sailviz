import { useLocation } from '@tanstack/react-router'
import { useMemo } from 'react'

type BreadcrumbItem = {
    title: string
    link: string
}

// This allows to add custom title as well
const routeMapping: Record<string, BreadcrumbItem[]> = {
    '/dashboard': [{ title: 'Dashboard', link: '/dashboard' }]
    // Add more custom mappings as needed
}

export function useBreadcrumbs() {
    const pathname = useLocation().pathname

    const breadcrumbs = useMemo(() => {
        // Check if we have a custom mapping for this exact path
        if (routeMapping[pathname]) {
            return routeMapping[pathname]
        }

        // If no exact match, fall back to generating breadcrumbs from the path
        const segments = pathname.split('/').filter(Boolean)
        return segments.map((segment: string, index: number) => {
            const path = `/${segments.slice(0, index + 1).join('/')}`
            return {
                title: segment.charAt(0).toUpperCase() + segment.slice(1),
                link: path
            }
        })
    }, [pathname])

    return breadcrumbs
}
