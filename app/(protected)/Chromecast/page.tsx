'use client'
import React, { useEffect, useState } from 'react'
import Script from 'next/script';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import * as DB from 'components/apiMethods'
import { io, Socket } from "socket.io-client";
import * as Fetcher from 'components/Fetchers';

const applicationID = '0AA4CA7E';
const namespace = 'urn:x-cast:com.sailviz';

export default function Page() {
    const Router = useRouter()

    const [chromecasts, setChromecasts] = useState<ChromecastDataType[]>([])
    const [activeHost, setActiveHost] = useState<string>("")
    const [connection, setConnection] = useState<Socket>()

    var [availiableCasts, setAvailiableCasts] = useState<AvailableCastType[]>([])
    var [races, setRaces] = useState<RaceDataType[]>([])
    var [series, setSeries] = useState<SeriesDataType[]>([])

    const { user, userIsError, userIsValidating } = Fetcher.UseUser()
    const { club, clubIsError, clubIsValidating } = Fetcher.UseClub()

    const addCast = async (host: string) => {
        //send socket message to connect to cast
        if (!connection) {
            console.warn("no connection")
            return
        }
        connection.emit("connectCast", host, (response: any) => {
            console.log(response)
            if (response.status == false) {
                console.log("could not connect to cast")
                return
            }
            //create db entry if successful
            DB.CreateChromecast({
                id: "",
                name: response.cast.name,
                clubId: club.id,
                host: response.cast.host,
                settings: {}
            })
        })
        setChromecasts(await DB.GetChromecastByClubId(club.id))
        hideAddCastModal()
        setTimeout(() => {
            connection.emit("messageCast", host, { type: "clubId", clubId: club.id }, (response: any) => {
                console.log(response)
            })
        }, 10000)
    }

    const connectCast = async (host: string) => {
        //send socket message to connect to cast
        if (!connection) {
            console.warn("no connection")
            return
        }
        connection.emit("connectCast", host, (response: any) => {
            console.log(response)
            if (response.status == false) {
                console.log("could not connect to cast")
                return
            }
        })
        setChromecasts(await DB.GetChromecastByClubId(club.id))
        hideAddCastModal()
        setTimeout(() => {
            connection.emit("messageCast", host, { type: "clubId", clubId: club.id }, (response: any) => {
                console.log(response)
            })
        }, 10000)
    }

    const disconnectCast = async (host: string) => {
        //send socket message to connect to cast
        if (!connection) {
            console.warn("no connection")
            return
        }
        connection.emit("disconnectCast", host, (response: any) => {
            console.log(response)
            if (response.status == false) {
                console.log("could not disconnect to cast")
                return
            }

        })
        setChromecasts(await DB.GetChromecastByClubId(club.id))
        hideAddCastModal()
    }


    const showPage = (id: string, type: string) => {
        if (!connection) {
            console.warn("no connection")
            return
        }
        connection.emit("messageCast", activeHost, { type: "showPage", id: id, pageType: type, clubId: club.id }, (response: any) => {
            console.log(response)
            if (response.status == false) {
                console.log("could not message cast")
                return
            }

        })
    }

    const slideShow = (ids: string[], type: string) => {
        console.log(ids)
        if (!connection) {
            console.warn("no connection")
            return
        }
        connection.emit("messageCast", activeHost, { type: "slideShow", ids: ids, pageType: type, clubId: club.id }, (response: any) => {
            console.log(response)
            if (response.status == false) {
                console.log("could not message cast")
                return
            }

        })
    }

    const sendClubId = () => {
        if (!connection) {
            console.warn("no connection")
            return
        }
        connection.emit("messageCast", activeHost, { type: "clubId", clubId: club.id }, (response: any) => {
            console.log(response)
            if (response.status == false) {
                console.log("could not message cast")
                return
            }

        })
    }

    const sendTheme = (theme: string) => {
        if (!connection) {
            console.warn("no connection")
            return
        }
        connection.emit("messageCast", activeHost, { type: "theme", theme: theme }, (response: any) => {
            console.log(response)
            if (response.status == false) {
                console.log("could not message cast")
                return
            }

        })
    }

    const showAddCastModal = () => {
        if (!connection) {
            console.warn("no connection")
            return
        }
        connection.emit("getAvailableCasts", (response: any) => {
            console.log(response)
            setAvailiableCasts(response.casts)
            if (response.status == false) {
                console.log("could not connect to cast")
            }
        })

        const modal = document.getElementById("addCastModal")
        modal?.classList.remove("hidden")
    }

    const hideAddCastModal = () => {
        const modal = document.getElementById("addCastModal")
        modal?.classList.add("hidden")

    }

    const showControlModal = (cast: ChromecastDataType) => {
        setActiveHost(cast.host)
        if (!connection) {
            console.warn("no connection")
            return
        }
        connection.emit("getAvailableCasts", (response: any) => {
            console.log(response)
            setAvailiableCasts(response.casts)
            if (response.status == false) {
                console.log("could not connect to cast")
            }
        })

        const modal = document.getElementById("controlModal")
        modal?.classList.remove("hidden")
    }

    const hideControlModal = () => {
        const modal = document.getElementById("controlModal")
        modal?.classList.add("hidden")

    }


    useEffect(() => {
        if (club != undefined) {
            const fetchChromecasts = async () => {
                var data = await DB.GetChromecastByClubId(club.id)
                if (data) {
                    console.log(data)
                    setChromecasts(data)
                } else {
                    console.log("could not fetch chromecasts")
                }

            }
            fetchChromecasts()

            var _socket = io("https://sailviz-castcontroller.local:3030/")
            // var _socket = io("https://localhost:3001/")
            if (!_socket) return
            setConnection(_socket)
            _socket.on('connect', () => {
                console.log('connected to socket')
            })
            _socket.emit("register", club.id, (response: any) => {
                console.log(response)
                if (response.status == false) {
                    console.log("could not register club")
                }
            })

            const fetchTodaysRaces = async () => {
                var data = await DB.getTodaysRaceByClubId(club.id)
                console.log(data)
                if (data) {
                    let racesCopy: RaceDataType[] = []
                    for (let i = 0; i < data.length; i++) {
                        console.log(data[i]!.number)
                        const res = await DB.getRaceById(data[i]!.id)
                        racesCopy[i] = res
                    }
                    setRaces(racesCopy)
                    let SeriesIds = racesCopy.flatMap(race => race.seriesId)
                    let uniqueSeriesIds = [...new Set(SeriesIds)]
                    let seriesCopy: SeriesDataType[] = []
                    uniqueSeriesIds.forEach(id => {
                        DB.GetSeriesById(id).then((data) => {
                            seriesCopy.push(data)
                        }
                        )
                    }
                    )
                    setSeries(seriesCopy)
                } else {
                    console.log("no races today.")
                }
            }
            fetchTodaysRaces()

            _socket.emit("getAvailableCasts", (response: any) => {
                console.log(response)
                setAvailiableCasts(response.casts.filter((cast: AvailableCastType) => {
                    //filter out already connected chromecasts
                    return !chromecasts.some((connectedCast: ChromecastDataType) => {
                        return connectedCast.host == cast.host
                    })
                }))
                if (response.status == false) {
                    console.log("could not register club")
                }
            })

        }
    }, [club])

    useEffect(() => {
        //update chromecasts status based on available casts
        //update this to check what app the device is running, then we can have connected, availiable, disconnected
        setChromecasts(chromecasts.map((cast: ChromecastDataType) => {
            if (availiableCasts.some((availiableCast: AvailableCastType) => {
                return (availiableCast.host == cast.host) && (availiableCast.connected)
            })) {
                cast.status = "connected"
            } else {
                cast.status = "disconnected"
            }
            return cast
        }))
    }, [availiableCasts])

    return (
        <>
            <Script src="https://www.gstatic.com/cv/js/sender/v1/cast_sender.js"></Script>
            <div id="addCastModal" className="hidden fixed z-10 left-0 top-0 w-full h-full overflow-auto bg-gray-400 backdrop-blur-sm bg-opacity-20">
                <div className="mx-auto my-20 px-a py-5 border w-1/4 bg-gray-300 rounded-sm">
                    <div className="text-6xl font-extrabold text-gray-700 flex justify-center">Add Cast</div>
                    {availiableCasts.map((cast, index) => {
                        //if cast is connected, dont show
                        if (cast.connected || chromecasts.some((connectedCast: ChromecastDataType) => { return connectedCast.host == cast.host })) {
                            return <></>
                        } else {
                            return (
                                <div key={"addcast" + cast.host + index} className="flex mb-2 justify-center">
                                    <div onClick={() => addCast(cast.host)} className="w-1/2 cursor-pointer text-white bg-blue-600 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-3 md:mr-0">
                                        {cast.name}
                                    </div>
                                </div>
                            )
                        }
                    })
                    }
                    <div className="flex mt-8 justify-center">
                        <p id="retireCancel" onClick={hideAddCastModal} className="w-1/2 cursor-pointer text-white bg-red-600 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-3 md:mr-0">
                            Cancel
                        </p>
                    </div>
                </div>
            </div>
            <div id="controlModal" className="hidden fixed z-10 left-0 top-0 w-full h-full overflow-auto bg-gray-400 backdrop-blur-sm bg-opacity-20">
                <div className="mx-auto my-20 px-a py-5 border w-7/12 bg-gray-300 rounded-sm">
                    <div className="text-6xl font-extrabold text-gray-700 flex justify-center">Control Cast</div>
                    <div className="m-6">
                        <div onClick={() => sendClubId()} className="w-full cursor-pointer text-white bg-blue-600 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-md px-5 py-2.5 text-center mr-3 md:mr-0">
                            send club id
                        </div>
                    </div>
                    <div className='flex flex-row'>
                        <div className="m-6">
                            <div onClick={() => sendTheme('light')} className="w-full cursor-pointer text-white bg-blue-600 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-md px-5 py-2.5 text-center mr-3 md:mr-0">
                                set light theme
                            </div>
                        </div>
                        <div className="m-6">
                            <div onClick={() => sendTheme('dark')} className="w-full cursor-pointer text-white bg-blue-600 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-md px-5 py-2.5 text-center mr-3 md:mr-0">
                                set dark theme
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-row mb-2 justify-center">
                        <div className='flex flex-col'>
                            <div className="m-6">
                                <div onClick={() => slideShow(races.flatMap(race => race.id), "race")} className="w-full cursor-pointer text-white bg-blue-600 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-md px-5 py-2.5 text-center mr-3 md:mr-0">
                                    Race Slideshow
                                </div>
                            </div>
                            {races.map((race, index) => {
                                return (
                                    <div className="m-6" key={JSON.stringify(races) + index}>
                                        <div onClick={() => showPage(race.id, "race")} className="w-full cursor-pointer text-white bg-blue-600 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-md px-5 py-2.5 text-center mr-3 md:mr-0">
                                            {race.series.name}: {race.number} at {race.Time.slice(10, 16)}
                                        </div>

                                    </div>
                                )
                            })}
                        </div>
                        <div className='flex flex-col'>
                            <div className="m-6">
                                <div onClick={() => slideShow(series.flatMap(serie => serie.id), "series")} className="w-full cursor-pointer text-white bg-blue-600 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-md px-5 py-2.5 text-center mr-3 md:mr-0">
                                    Series Slideshow
                                </div>
                            </div>
                            {series.map((series, index) => {
                                return (
                                    <div className="m-6" key={JSON.stringify(races) + index}>
                                        <div onClick={() => showPage(series.id, "series")} className="w-full cursor-pointer text-white bg-blue-600 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-md px-5 py-2.5 text-center mr-3 md:mr-0">
                                            {series.name}
                                        </div>

                                    </div>
                                )
                            })}
                        </div>
                    </div>
                    <div className="flex mt-8 justify-center">
                        <p id="retireCancel" onClick={hideControlModal} className="w-1/2 cursor-pointer text-white bg-red-600 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-3 md:mr-0">
                            Close
                        </p>
                    </div>
                </div>
            </div>
            <div className="flex flex-col w-full">
                <div onClick={showAddCastModal} className=" p-2 m-2 cursor-pointer text-white bg-blue-600 font-medium rounded-lg text-xl px-5 py-2.5 text-center">
                    Add new Device
                </div>
                <div className='flex flex-row w-full justify-around flex-wrap' id='chromecastContainer'>
                    {/* loop though chromecasts. */}
                    {chromecasts.map((cast, i) => {
                        return (
                            <div key={"cast" + cast.id} className='flex flex-col justify-between p-2 m-4 border-2 border-gray-500 rounded-lg shadow-xl w-96 shrink-0'>
                                <div className='flex flex-row justify-between'>
                                    <div className="w-1/2 m-2 text-black font-medium text-xl px-5 py-2.5 text-center">
                                        {cast.name}
                                    </div>
                                    <div className="w-1/2 m-2 text-black font-medium text-xl px-5 py-2.5 text-center">
                                        {cast.status}
                                    </div>
                                </div>
                                {cast.status == "connected" ?
                                    <p onClick={() => { showControlModal(cast) }} className="w-1/2 p-2 m-2 cursor-pointer text-white bg-green-600 font-medium rounded-lg text-xl px-5 py-2.5 text-center">
                                        Control
                                    </p>
                                    :
                                    <></>
                                }
                                {(() => {
                                    switch (cast.status) {
                                        case "connected":
                                            return (
                                                <p onClick={() => { }} className="w-1/2 p-2 m-2 cursor-pointer text-white bg-red-600 font-medium rounded-lg text-xl px-5 py-2.5 text-center">
                                                    Disconnect
                                                </p>
                                            )
                                        case "disconnected":
                                            return (
                                                <p onClick={() => { connectCast(cast.host) }} className="w-1/2 p-2 m-2 cursor-pointer text-white bg-blue-600 font-medium rounded-lg text-xl px-5 py-2.5 text-center">
                                                    Connect
                                                </p>
                                            )
                                        case "stopped":
                                            return (
                                                <p onClick={() => { }} className="w-1/2 p-2 m-2 cursor-pointer text-white bg-blue-600 font-medium rounded-lg text-xl px-5 py-2.5 text-center">
                                                    Reconnect
                                                </p>
                                            )
                                    }
                                })()}
                            </div>
                        )
                    }
                    )}
                </div>
            </div>
        </>
    )
}