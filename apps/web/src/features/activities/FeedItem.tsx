import * as Types from '@sailviz/types'
import { formatDistanceToNow } from 'date-fns'

export function FeedItem({ activity }: { activity: Types.Activity }) {
    const timeAgo = formatDistanceToNow(new Date(activity.createdAt), {
        addSuffix: true
    })

    return (
        <div className='rounded-xl border border-slate-700 bg-slate-800 p-4 text-white shadow-md'>
            <div className='mb-2 flex items-center justify-between'>
                <span className='text-sm font-semibold capitalize'>{activity.type}</span>
                <span className='text-xs text-slate-400'>{timeAgo}</span>
            </div>
            <div className='text-sm text-slate-300'>
                A new sailing session was uploaded.
                <div className='mt-2 text-xs text-slate-400'>Session ID: {activity.id}</div>
            </div>
        </div>
    )
}
