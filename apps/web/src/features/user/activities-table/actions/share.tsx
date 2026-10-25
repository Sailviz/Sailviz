import { Button } from '@components/ui/button'
import * as Types from '@sailviz/types'
import { useRouter } from '@tanstack/react-router'
import { Share2 } from 'lucide-react'

interface ShareProps {
    data: Types.Activity
}

export const Share: React.FC<ShareProps> = (props: ShareProps) => {
    const router = useRouter()

    const redirectPath = '/Dashboard/me/share/' + props.data.id

    return (
        <>
            <Button className='cursor-pointer' onClick={() => router.navigate({ to: redirectPath })}>
                <Share2 />
            </Button>
        </>
    )
}
