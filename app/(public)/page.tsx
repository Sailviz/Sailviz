// Import your Client Component
import Card from 'components/ui/Card'

export default async function Page() {
    // Forward fetched data to your Client Component
    return (
        <div className="container mx-auto flex flex-col items-center justify-center h-full p-4">
            <h1 className="text-5xl md:text-[5rem] leading-normal font-extrabold text-gray-700">
                SailViz
            </h1>
            <div className="grid gap-3 pt-3 mt-3 text-center md:grid-cols-1 lg:w-2/3">
                <Card
                    name="Sailing Race System and Results Management"
                    description=""
                    link="/"
                />
            </div>
        </div>
    )
}