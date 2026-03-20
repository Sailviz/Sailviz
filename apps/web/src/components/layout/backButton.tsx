import { useRouter } from '@tanstack/react-router'
import { Button } from '../ui/button'

export default function BackButton({ route }: { route: string }) {
    const router = useRouter()
    const handleClick = async () => {
        router.navigate({ to: route })
    }
    return (
        <Button onClick={() => handleClick()} variant={'secondary'} className='w-24 h-8'>
            Back
        </Button>
    )
}
