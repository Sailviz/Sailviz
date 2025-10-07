'use client'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '../ui/button'

export default function BackButton({ demoMode = false }) {
    const navigate = useNavigate()
    const handleClick = async () => {
        Router.back()
    }
    return (
        <Button onClick={() => handleClick()} variant={'secondary'} className='w-24 h-8'>
            {' '}
            Back{' '}
        </Button>
    )
}
