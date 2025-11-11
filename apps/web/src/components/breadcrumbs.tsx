import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@components/ui/breadcrumb'
import { Fragment, useEffect, useState } from 'react'
import { useRouterState } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { orpcClient } from '@lib/orpc'

type BreadcrumbItem = {
    title: string
    link: string
}

export function Breadcrumbs() {
    const Router = useRouterState()
    const pathname = Router.location.pathname
    const [items, setItems] = useState<BreadcrumbItem[]>([])

    const findRaceMutation = useMutation(orpcClient.race.find.mutationOptions())

    useEffect(() => {
        // If no exact match, fall back to generating breadcrumbs from the path
        const segments = pathname.split('/').filter(Boolean)
        console.log('Pathname segments:', segments)
        //Race page
        if (segments[1] == 'Race') {
            findRaceMutation.mutateAsync({ raceId: segments[2]! }).then(res => {
                console.log(res)
                setItems([
                    {
                        title: res.series!.name,
                        link: `/Dashboard/Series/${res.series!.id}`
                    },
                    {
                        title: `Race ${res.number}`,
                        link: ``
                    }
                ])
            })
        } else {
            setItems(
                segments.map((segment, index) => {
                    const path = `/${segments.slice(0, index + 1).join('/')}`
                    return {
                        title: segment.charAt(0).toUpperCase() + segment.slice(1),
                        link: path
                    }
                })
            )
        }
        console.log('Breadcrumbs items:', items)
    }, [pathname])
    if (items.length === 0)
        return (
            <Breadcrumb>
                <BreadcrumbList>
                    <Fragment>
                        <BreadcrumbItem className='hidden md:block'>
                            {/* this is an invisible character to stop page moving when breadcrums is calculated */}
                            <BreadcrumbLink>{'\u00A0'}</BreadcrumbLink>
                        </BreadcrumbItem>
                    </Fragment>
                </BreadcrumbList>
            </Breadcrumb>
        )

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
                        {index < items.length - 1 && <BreadcrumbSeparator className='hidden md:block'>&gt;</BreadcrumbSeparator>}
                        {index === items.length - 1 && <BreadcrumbPage>{item.title}</BreadcrumbPage>}
                    </Fragment>
                ))}
            </BreadcrumbList>
        </Breadcrumb>
    )
}
