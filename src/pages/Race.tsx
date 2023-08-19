import React from "react"
import Router, { useRouter } from "next/router"

const RacePage = () => {

    const router = useRouter()

    const query = router.query
    console.log(query.race)
    if (query.race == undefined) {
        return (
            <p> Race not selected </p>
        )
    }

    return (
        <>
            <p>this page works {query.race}</p>
        </>
    )
}

export default RacePage