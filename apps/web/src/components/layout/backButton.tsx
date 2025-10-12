import { useRouter } from '@tanstack/react-router'
import { Button } from '../ui/button'

export default function BackButton() {
    const router = useRouter()
    const handleClick = async () => {
        //navigate back
        router.history.back()
    }
    return (
        <Button onClick={() => handleClick()} variant={'secondary'} className='w-24 h-8'>
            Back
        </Button>
    )
}
