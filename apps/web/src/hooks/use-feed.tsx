import { useEffect, useRef } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { orpcClient } from '@lib/orpc'

export function useFeed(userId: string) {
    const bottomRef = useRef<HTMLDivElement | null>(null)

    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
        queryKey: orpcClient.user.feed.get.key(),
        initialPageParam: '',
        queryFn: async ({ pageParam }) => {
            return await orpcClient.user.feed.get.call({
                userId,
                cursor: pageParam
            })
        },
        getNextPageParam: lastPage => {
            if (lastPage.length === 0) {
                return undefined
            }

            return lastPage.at(-1)?.id
        }
    })

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
                fetchNextPage()
            }
        })

        const element = bottomRef.current

        if (element) {
            observer.observe(element)
        }

        return () => observer.disconnect()
    }, [fetchNextPage, hasNextPage, isFetchingNextPage])

    return {
        items: data?.pages.flat() ?? [],
        loading: isLoading || isFetchingNextPage,
        bottomRef
    }
}
