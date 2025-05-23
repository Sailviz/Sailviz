// app/components/ThemeSwitcher.tsx
'use client'

import { MoonIcon } from '@/components/icons/moon-icon'
import { SunIcon } from '@/components/icons/sun-icon'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Switch } from './switch'

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

    return <Switch aria-label='Automatic updates' checked={theme == 'dark'} onCheckedChange={updateTheme} endContent={<SunIcon />} startContent={<MoonIcon />} />
}
