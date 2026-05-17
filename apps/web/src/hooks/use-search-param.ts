import { useNavigate, useSearch } from '@tanstack/react-router'
import { useCallback } from 'react'

export type SearchParamUpdater<T> = T | null | ((old: T) => T | null)

type UseSearchParamOptions<T> = {
    from?: string
    parse?: (value: unknown, fallback: T) => T
}

const identityParse = <T>(value: unknown, fallback: T) => (value as T | undefined) ?? fallback

export function useSearchParam<T>(key: string, defaultValue: T, options?: UseSearchParamOptions<T>) {
    // `from` is cast to `any` to avoid over-constraining consumers to known route ids while we migrate routes.
    const search = useSearch({ from: options?.from as any, strict: false }) as Record<string, unknown>
    const navigate = useNavigate({ from: options?.from as any }) as unknown as (args: {
        search: (prev: Record<string, unknown>) => Record<string, unknown>
        replace?: boolean
    }) => Promise<void> | void
    const parse = options?.parse ?? identityParse<T>

    const parsedValue = parse(search?.[key], defaultValue) ?? defaultValue

    const setValue = useCallback(
        (next: SearchParamUpdater<T>) =>
            navigate({
                search: prev => {
                    const previousValue = parse((prev as Record<string, unknown> | undefined)?.[key], defaultValue) ?? defaultValue
                    const resolvedValue = typeof next === 'function' ? (next as (old: T) => T | null)(previousValue) : next
                    const nextSearch: Record<string, unknown> = { ...(prev as Record<string, unknown> | undefined) }

                    if (resolvedValue === null || resolvedValue === undefined || resolvedValue === defaultValue) {
                        delete nextSearch[key]
                    } else {
                        nextSearch[key] = resolvedValue
                    }

                    return nextSearch
                },
                replace: true
            }),
        [defaultValue, key, navigate, parse]
    )

    return [parsedValue, setValue] as const
}

export const parseNumberSearchParam = (value: unknown, fallback: number) => {
    const asNumber = typeof value === 'number' ? value : Number(value)
    return Number.isFinite(asNumber) ? asNumber : fallback
}

export const parseStringSearchParam = (value: unknown, fallback: string) => {
    if (typeof value === 'string') return value
    return value == null ? fallback : String(value)
}
