import Dashboard from '../components/Dashboard';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import * as DB from '../components/apiMethods';
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
            hornIP: ""
        },
        series: [],
        boats: [],
    })

    var [user, setUser] = useState<UserDataType>({
        id: "",
        name: "",
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
        <Dashboard club={club.name} userName={user.name}>
            <div className='w-full'>
                <div id="BackToHome" onClick={() => router.push("/Dashboard")} className="cursor-pointer text-white bg-blue-600 hover:bg-pink-500 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center w-1/12 mt-4 mx-4">
                    Back To Home
                </div>
                <div className="container mx-auto flex flex-col items-center justify-center h-screen p-4">
                    <p className="text-5xl md:text-[5rem] leading-normal font-extrabold text-gray-700">
                        Dashboard Page
                    </p>
                    <p>This Will be populated with instructions on how to use it.</p>
                    <p className="text-5xl md:text-[5rem] leading-normal font-extrabold text-gray-700">
                        Handicap Racing
                    </p>
                    <p>This Will be populated with instructions on how to use it.</p>
                    <p className="text-5xl md:text-[5rem] leading-normal font-extrabold text-gray-700">
                        Pursuit Racing
                    </p>
                    <p>This Will be populated with instructions on how to use it.</p>
                </div>

            </div>
        </Dashboard>
    );
};


export default RaceOfficerGuide;