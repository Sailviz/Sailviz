import { Button } from '@components/ui/button'
import * as Types from '@sailviz/types'
import { useRouter } from '@tanstack/react-router'
import { Share2 } from 'lucide-react'

interface ShareProps {
    data: Types.RaceType
}

export const Share: React.FC<ShareProps> = () => {
    const router = useRouter()
    //get activityId for result that matches the user's Id.
    const activityId = '3ec7b133-0128-42d1-a901-ba4d5a386039'

    const redirectPath = '/Dashboard/me/share/' + activityId

    return (
        <>
            <Button className='cursor-pointer' onClick={() => router.navigate({ to: redirectPath })}>
                <Share2 />
            </Button>
        </>
    )
}
