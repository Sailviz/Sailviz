import { useState, useEffect, useRef } from 'react'
import * as Types from '@sailviz/types'
import { useMutation } from '@tanstack/react-query'
import { orpcClient } from '@lib/orpc'

export function useFeed(userId: string) {
    const [items, setItems] = useState<Types.Activity[]>([])
    const [nextCursor, setNextCursor] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const bottomRef = useRef<HTMLDivElement | null>(null)

    const feedMutation = useMutation(orpcClient.user.feed.get.mutationOptions())

    const loadMore = async () => {
        if (loading) return
        if (nextCursor == null && items.length > 0) return
        console.log('Loading more feed items for user:', userId, 'with cursor:', nextCursor)
        setLoading(true)

        const data = await feedMutation.mutateAsync({
            userId: userId,
            cursor: nextCursor || ''
        })

        setItems(prev => [...prev, ...data])
        setNextCursor(data.at(-1)?.id || null)
        setLoading(false)
    }

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) loadMore()
        })

        if (bottomRef.current) observer.observe(bottomRef.current)
        return () => observer.disconnect()
    }, [bottomRef.current, nextCursor, loading])

    useEffect(() => {
        loadMore()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return { items, bottomRef, loading }
}
