import { useRouter } from 'next/router'
import React, { useEffect } from 'react'
import Layout from '../../components/Layout'


const Clubindex = () => {
    const router = useRouter()
    var club  = router.query.club
    useEffect(() => {
    router.push('/' + club + '/Dashboard')
    })

    return (
        <>
            <div className="container mx-auto flex flex-col items-center justify-center h-screen p-4">
                <h1 className="text-5xl md:text-[5rem] leading-normal font-extrabold text-gray-700">
                    Loading {club}
                </h1>
            </div>
        </>
    )
}

export default Clubindex