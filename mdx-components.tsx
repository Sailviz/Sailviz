import type { MDXComponents } from 'mdx/types'
import { title, subtitle } from 'components/ui/home/primitaves'
import Image from 'next/image'

export function useMDXComponents(components: MDXComponents): MDXComponents {
    return {
        // Allows customizing built-in components, e.g. to add styling.
        h1: ({ children }) => (
            <h1 className={title({ color: "blue" })}>{children}</h1>
        ),
        h2: ({ children }) => (
            <h2 className={subtitle({ class: "mt-4" })}>{children}</h2>
        ),
        ...components,
    }
}