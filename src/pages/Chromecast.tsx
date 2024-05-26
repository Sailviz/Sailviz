import React, { useEffect, useState } from 'react'
import Script from 'next/script';
import Cookies from 'js-cookie';
import Dashboard from "../components/Dashboard";
import { useRouter } from 'next/router';
import * as DB from '../components/apiMethods'

const applicationID = '0AA4CA7E';
const namespace = 'urn:x-cast:com.sailviz';


const CCDashboard = () => {

    //chromecast code
    var session: any = null

    const connect = async () => {
        chrome.cast.requestSession((e: any) => {
            session = e;
            sessionListener(e);
            // tell the receiver the clubId
            sendMessage({
                type: 'clubId',
                clubId: clubId,
            });
        }, onError)
    }

    function sessionListener(e: any) {
        console.log('New session ID: ' + e.sessionId);
        e.addUpdateListener(sessionUpdateListener);
    }

    function sessionUpdateListener(isAlive: any) {
        console.log((isAlive ? 'Session Updated' : 'Session Removed') + ': ' + session.sessionId);
        if (!isAlive) {
            session = null;
        }
    };

    const sendMessage = (message: object) => {
        session.sendMessage(namespace, message, onSuccess.bind(this, message), onError);
        session.addMessageListener(namespace, console.log)
    }

    function onInitSuccess(e: any) {
        console.log('onInitSuccess');
    }

    function onError(message: any) {
        console.log('onError: ' + JSON.stringify(message));
    }

    function onStopAppSuccess() {
        console.log('onStopAppSuccess');
    }


    function receiverListener(e: any) {
        // Due to API changes just ignore this.
    }

    function stopApp(sessionId: string) {
        console.log(sessionId)
        session.stop(onStopAppSuccess, onError);
    }

    function initializeCastApi() {
        var sessionRequest = new chrome.cast.SessionRequest(applicationID);
        var apiConfig = new chrome.cast.ApiConfig(sessionRequest,
            sessionListener,
            receiverListener);

        chrome.cast.initialize(apiConfig, onInitSuccess, onError);
    };

    function onSuccess(message: any) {
        console.log('onSuccess: ' + JSON.stringify(message));
    }

    useEffect(() => {
        if (!chrome.cast || !chrome.cast.isAvailable) {
            setTimeout(initializeCastApi, 1000);
        }
    }, [])

    //main code

    const router = useRouter()

    var [clubId, setClubId] = useState<string>("invalid")

    var [club, setClub] = useState<ClubDataType>({
        id: "",
        name: "",
        settings: {
            clockIP: "",
            hornIP: "",
            pursuitLength: 0,
            clockOffset: 0
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

    const showPage = () => {
        sendMessage({
            type: 'showPage',
            page: 'id'
        });
    }

    useEffect(() => {
        setClubId(Cookies.get('clubId') || "")
    }, [])

    useEffect(() => {
        if (clubId != "") {
            //catch if not fully updated
            if (clubId == "invalid") {
                return
            }
            const fetchClub = async () => {
                var data = await DB.GetClubById(clubId)
                if (data) {
                    console.log(data)
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
            <Script src="https://www.gstatic.com/cv/js/sender/v1/cast_sender.js"></Script>
            <div className="flex flex-col w-full">
                <div onClick={connect} className="w-1/4 p-2 m-2 cursor-pointer text-white bg-blue-600 font-medium rounded-lg text-xl px-5 py-2.5 text-center">
                    Add new Device
                </div>
                <div className='flex flex-row w-full justify-around flex-wrap'>
                    {/* loop though chromecasts. */}
                    {[0, 1, 2].map((chromecast, index) => {
                        return (
                            <div key={index} className='flex flex-col justify-between p-2 m-4 border-2 border-gray-500 rounded-lg shadow-xl w-96 shrink-0'>
                                <div className='flex flex-row justify-between'>
                                    <div className="w-1/2 m-2 text-black font-medium text-xl px-5 py-2.5 text-center">
                                        {"chromecast " + index}
                                    </div>
                                    <div className="w-1/2 m-2 text-black font-medium text-xl px-5 py-2.5 text-center">
                                        Status
                                    </div>
                                </div>
                                <p onClick={showPage} className="w-1/2 p-2 m-2 cursor-pointer text-white bg-green-600 font-medium rounded-lg text-xl px-5 py-2.5 text-center">
                                    Control
                                </p>
                                <p onClick={() => stopApp("id")} className="w-1/2 p-2 m-2 cursor-pointer text-white bg-blue-600 font-medium rounded-lg text-xl px-5 py-2.5 text-center">
                                    Disconnect
                                </p>
                                <p onClick={showPage} className="w-1/2 p-2 m-2 cursor-pointer text-white bg-red-600 font-medium rounded-lg text-xl px-5 py-2.5 text-center">
                                    Remove
                                </p>
                            </div>
                        )
                    })}
                </div>
            </div>
        </Dashboard>
    )
}

export default CCDashboard