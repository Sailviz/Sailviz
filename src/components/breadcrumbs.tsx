'use client'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Slash } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { Fragment } from 'react'

type BreadcrumbItem = {
    title: string
    link: string
}

const routeMapping: Record<string, BreadcrumbItem[]> = {
    '/Race': [{ title: 'Dashboard', link: '/dashboard' }],
    '/dashboard/employee': [
        { title: 'Dashboard', link: '/dashboard' },
        { title: 'Employee', link: '/dashboard/employee' }
    ],
    '/dashboard/product': [
        { title: 'Dashboard', link: '/dashboard' },
        { title: 'Products', link: '/dashboard/product' }
    ]
}

export function Breadcrumbs() {
    const pathname = usePathname()
    console.log('Breadcrumbs pathname:', pathname)
    var items: BreadcrumbItem[]
    if (routeMapping[pathname]) {
        items = routeMapping[pathname]
    } else {
        // If no exact match, fall back to generating breadcrumbs from the path
        const segments = pathname.split('/').filter(Boolean)
        items = segments.map((segment, index) => {
            const path = `/${segments.slice(0, index + 1).join('/')}`
            return {
                title: segment.charAt(0).toUpperCase() + segment.slice(1),
                link: path
            }
        })
    }

    if (items.length === 0) return null

    return (
        <Breadcrumb>
            <BreadcrumbList>
                {items.map((item, index) => (
                    <Fragment key={item.title}>
                        {index !== items.length - 1 && (
                            <BreadcrumbItem className='hidden md:block'>
                                <BreadcrumbLink href={item.link}>{item.title}</BreadcrumbLink>
                            </BreadcrumbItem>
                        )}
                        {index < items.length - 1 && (
                            <BreadcrumbSeparator className='hidden md:block'>
                                <Slash />
                            </BreadcrumbSeparator>
                        )}
                        {index === items.length - 1 && <BreadcrumbPage>{item.title}</BreadcrumbPage>}
                    </Fragment>
                ))}
            </BreadcrumbList>
        </Breadcrumb>
    )
}
