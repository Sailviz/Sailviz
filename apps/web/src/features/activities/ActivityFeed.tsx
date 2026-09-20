import { useFeed } from '@hooks/use-feed'
import { FeedItem } from './FeedItem'

export function ActivityFeed({ userId }: { userId: string }) {
    const { items, bottomRef, loading } = useFeed(userId)

    return (
        <div className='space-y-4'>
            {items.map(item => (
                <FeedItem key={item.id} activity={item} />
            ))}

            <div ref={bottomRef} style={{ height: 1 }} />

            {loading && <div className='text-sm text-gray-500 py-2'>Loading more…</div>}
        </div>
    )
}
