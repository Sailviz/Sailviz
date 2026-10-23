import { Avatar, AvatarImage } from '@components/ui/avatar'
import * as Types from '@sailviz/types'
import { formatDistanceToNow } from 'date-fns'
import { LikeButton } from './LikeButton'
import type { Session } from '@lib/session'
import { useLoaderData } from '@tanstack/react-router'

export function FeedItem({ activity }: { activity: Types.Activity }) {
    const timeAgo = formatDistanceToNow(new Date(activity.createdAt), {
        addSuffix: true
    })
    const session: Session = useLoaderData({ from: `__root__` })
    const userId = session.user.id

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
            <div className='mt-4 flex flex-row items-center justify-between'>
                {activity.likes.length > 0 ? (
                    <div className='flex flex-row items-center space-x-2'>
                        <span className='text-xs text-slate-400'>Bravo from:</span>
                        <div className='flex flex-row space-x-1'>
                            {activity.likes?.map(like => (
                                <Avatar key={like.id} className='size-6'>
                                    <AvatarImage src={like.user.image || '/default-avatar.png'} title={like.user.name} />
                                </Avatar>
                            ))}
                        </div>
                    </div>
                ) : (
                    <span className='text-xs text-slate-400'>No Bravos yet</span>
                )}
                {userId !== activity.user.id && <LikeButton activityId={activity.id} id={activity.likes.find(like => like.user.id == userId)?.id} />}
            </div>
        </div>
    )
}
