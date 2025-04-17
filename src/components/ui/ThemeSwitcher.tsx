// app/components/ThemeSwitcher.tsx
'use client'

import { Switch } from '@nextui-org/react'
import { MoonIcon } from '@/components/icons/moon-icon'
import { SunIcon } from '@/components/icons/sun-icon'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function ThemeSwitcher() {
    const [mounted, setMounted] = useState(false)
    const { theme, setTheme } = useTheme()

    function updateTheme(e: any) {
        if (e) {
            setTheme('dark')
        } else {
            setTheme('light')
        }
    }

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    return (
        <Switch
            defaultSelected
            aria-label='Automatic updates'
            isSelected={theme == 'dark'}
            onValueChange={updateTheme}
            size='lg'
            startContent={<SunIcon />}
            endContent={<MoonIcon />}
            thumbIcon={({ isSelected, className }) => (isSelected ? <MoonIcon className={className} /> : <SunIcon className={className} />)}
        />
    )
}
