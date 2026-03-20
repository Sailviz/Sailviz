import { QueryClient } from '@tanstack/react-query'

// Export a single app-wide QueryClient instance so loaders, beforeLoad, and components share cache
export const queryClient = new QueryClient()
