import Dashboard from '../../components/layouts/dashboard';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import * as DB from '../../components/apiMethods';
import Cookies from "js-cookie";
const RaceOfficerGuide = () => {

    const router = useRouter()

    var [clubId, setClubId] = useState<string>("invalid")

    var [club, setClub] = useState<ClubDataType>({
        id: "",
        name: "",
        settings: {
            clockIP: "",
            pursuitLength: 0,
            hornIP: "",
            clockOffset: 0,
        },
        series: [],
        boats: [],
    })

    var [user, setUser] = useState<UserDataType>({
        id: "",
        displayName: "",
        settings: {},
        permLvl: 0,
        clubId: ""

    })

    useEffect(() => {
        setClubId(Cookies.get('clubId') || "")
        console.log("clubId: " + clubId)
    }, [router])

    useEffect(() => {
        if (clubId != "") {
            //catch if not fully updated
            if (clubId == "invalid") {
                return
            }

            const fetchClub = async () => {
                var data = await DB.GetClubById(clubId)
                if (data) {
                    setClub(data)
                } else {
                    console.log("could not fetch club settings")
                }

            }
            fetchClub()

            const fetchUser = async () => {
                var userid = Cookies.get('userId')
                if (userid == undefined) return
                var data = await DB.GetUserById(userid)
                if (data) {
                    setUser(data)
                } else {
                    console.log("could not fetch club settings")
                }

            }
            fetchUser()



        } else {
            console.log("user not signed in")
            router.push("/")
        }
    }, [clubId])

    return (
        <Dashboard club={club.name} displayName={user.displayName}>
            <div className="w-full h-full mx-auto my-4">
                <object
                    data="/0.2 Race Sign On Guide.pdf#toolbar=0"
                    type="application/pdf" width="100%" height="1000px"
                >
                    <div className="flex">
                        <p className="my-auto mx-auto">Race Officer&apos;s Guide</p>
                        <a href="/0.2 Race Sign On Guide.pdf" className="text-white bg-pink-500 hover:bg-white hover:text-gray-700 hover:border-pink-500 border shadow font-medium px-5 py-3 text-center mr-6">
                            Download
                        </a>
                    </div>
                </object>
            </div>
        </Dashboard>
);
};


export default RaceOfficerGuide;