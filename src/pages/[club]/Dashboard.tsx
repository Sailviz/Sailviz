import { useRouter } from 'next/router'

const Club = () => {
    const router = useRouter()
    var club  = router.query.club
    console.log(club)
    return (
        <>
            <div className="container mx-auto flex flex-col items-center justify-center h-screen p-4">
                <h1 className="text-5xl md:text-[5rem] leading-normal font-extrabold text-gray-700">
                    {club} Dashboard
                </h1>
            </div>
        </>
  )
}

export default Club