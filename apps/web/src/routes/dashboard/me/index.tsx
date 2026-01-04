import { createFileRoute } from '@tanstack/react-router'

function Page() {
    console.log('Page component rendered') // Log when Page renders
    return <div>{/* <PersonalRacesTable /> */}</div>
}

export const Route = createFileRoute('/dashboard/me/')({
    component: Page
})
