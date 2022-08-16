import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'

async function checkClubExist (club: string) {   
    const body = { 'name': club }
    const res = await fetch(`/api/GetClub`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    })
    .then((r) => r.json())
    return res
}

const Clubindex = () => {


    const router = useRouter()
    var [message, setMessage] = useState('Loading')
    const club  = router.query.club
    //check that club exists
    useEffect(()=>{
        async function run(){
            var res = await checkClubExist(club! as string)
            if (res.error == false){
                setMessage("Club " + club + " found")
            } else {
                setMessage("Club " + club + " not found")
            }
        }
        run()
    }, [club])
    //use cookie to log in
    //otherwise show log in page
    /*
    useEffect(() => {
        //router.push('/' + club + '/Dashboard')
    })
    */
    return (
        <>
            <div className="container mx-auto flex flex-col items-center justify-center h-screen p-4">
                <h1 className="text-5xl md:text-[5rem] leading-normal font-extrabold text-gray-700">
                    {message}
                </h1>
            </div>
        </>
    )
}

export default Clubindex