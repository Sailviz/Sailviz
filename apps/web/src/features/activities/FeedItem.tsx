import { Avatar, AvatarImage } from '@components/ui/avatar'
import * as Types from '@sailviz/types'
import { formatDistanceToNow } from 'date-fns'

export function FeedItem({ activity }: { activity: Types.Activity }) {
    const timeAgo = formatDistanceToNow(new Date(activity.createdAt), {
        addSuffix: true
    })

    return (
        <div className='rounded-xl border border-slate-700 bg-slate-800 p-4 text-white shadow-md'>
            <div className='mb-2 flex flex-row'>
                <Avatar>
                    <AvatarImage src={activity.user.image || '/default-avatar.png'} alt={activity.user.name} />
                </Avatar>
                <div className='flex flex-col ml-2'>
                    <span className='text-xs text-slate-400'>{activity.user.name}</span>
                    <span className='text-xs text-slate-400'>{timeAgo}</span>
                </div>
            </div>
            <div className='mb-2 flex items-center justify-between'>
                <span className='text-sm font-semibold capitalize'>{activity.title}</span>
            </div>
            <div className='text-sm text-slate-300'>
                {activity.description}
                <div className='mt-2 text-xs text-slate-400'>Session ID: {activity.id}</div>
            </div>
            <div className='mt-2 text-xs text-slate-400'>Likes: {activity.likes?.length ?? 0}</div>
        </div>
    )
}
