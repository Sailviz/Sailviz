import { getVersion } from '@tauri-apps/api/app'
import { useEffect, useState } from 'react'

export function useTauriVersion() {
    const [version, setVersion] = useState<string | null>(null)

    useEffect(() => {
        getVersion().then(setVersion)
    }, [])

    return version
}
