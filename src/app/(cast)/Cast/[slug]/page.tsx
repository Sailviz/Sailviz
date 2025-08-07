'use client'
import React, { act, useEffect, useState } from 'react'
import Script from 'next/script'
import * as DB from '@/components/apiMethods'
import SeriesResultsTable from '@/components/tables/FleetSeriesResultsTable'
import RaceTimer from '@/components/HRaceTimer'
import LiveFleetResultsTable from '@/components/tables/LiveFleetResultsTable'
import { animateScroll, Events } from 'react-scroll'
import { useTheme } from 'next-themes'
import { Peer, DataConnection } from 'peerjs'
import { useQRCode } from 'next-qrcode'
import { title } from '@/components/layout/home/primitaves'
import FleetHandicapResultsTable from '@/components/tables/FleetHandicapResultsTable'
import FleetPursuitResultsTable from '@/components/tables/FleetPursuitResultsTable'
import * as Fetcher from '@/components/Fetchers'
import { mutate } from 'swr'
import { Progress } from '@/components/ui/progress'

enum pageStateType {
    live,
    series,
    race,
    info
}

const scrollOptions = {
    delay: 10000,
    duration: 15000,
    smooth: false
}

//This is the page that a chromecast is directed to.
//it receives messages from the chromecast and displays the appropriate data.
// club id is stored in a cookie and is used to get the relavent data / page to display.

type PageProps = { params: Promise<{ slug: string }> }

export default async function Page(props: PageProps) {
    var interval: NodeJS.Timer | null = null
    const params = await props.params

    const { theme, setTheme } = useTheme()

    const { Image: QRCode } = useQRCode()

    const [club, setClub] = useState<ClubDataType>({ id: params.slug } as ClubDataType)

    const { todaysRaces, todaysRacesIsError, todaysRacesIsValidating } = Fetcher.GetTodaysRaceByClubId(club.id)

    const [pagestate, setPageState] = useState<pageStateType>(pageStateType.info)
    var [activeRaceData, setActiveRaceData] = useState<RaceDataType>({} as RaceDataType)
    var [activeSeriesData, setActiveSeriesData] = useState<SeriesDataType>({} as SeriesDataType)

    const [peerId, setPeerId] = useState<string>('')

    const [timerValue, setTimerValue] = useState<number>(0)
    const [timerActive, setTimerActive] = useState<boolean>(false)
    const [timerMax, setTimerMax] = useState<number>(0)

    const [origin, setOrigin] = useState<string>('')

    var peer: Peer
    var conn: DataConnection | null

    function initialize() {
        // Create own peer object with connection to shared PeerJS server
        peer = new Peer()

        peer.on('open', function (id) {
            console.log('ID: ' + peer.id)
            setPeerId(peer.id)
        })
        peer.on('connection', function (c) {
            conn = c
            console.log('Connected to: ' + conn.peer)
            ready()
        })
        peer.on('disconnected', function () {
            console.log('Connection lost. Please reconnect')

            peer.reconnect()
        })
        peer.on('close', function () {
            conn = null
            console.log('Connection destroyed')
        })
        peer.on('error', function (err) {
            console.log(err)
            alert('' + err)
        })
    }

    /**
     * Triggered once a connection has been achieved.
     * Defines callbacks to handle incoming data and connection events.
     */
    const ready = () => {
        conn!.on('data', function (datastring) {
            console.log('Data recieved')
            console.log('datastring: ' + datastring)
            let data = JSON.parse(datastring as string)
            console.log(data)
            if (data['type'] == 'showPage') {
                showPage(data['id'], data['pageType'])
                setTimerActive(true)
                //set the timeout to 100 seconds
                setTimerValue(20)
                setTimerMax(20)
            } else if (data['type'] == 'theme') {
                console.log(data['theme'])
                setTheme(data['theme'])
            }
        })
        conn!.on('close', function () {
            conn = null
        })
    }

    const checkActive = (race: RaceDataType) => {
        if (race.fleets.length == 0) {
            console.error('no fleets found')
        }

        //if any fleets have been started
        if (race.fleets.some(fleet => fleet.startTime != 0)) {
            //race has started, check if all boats have finished
            return !race.fleets
                .flatMap(fleet => fleet.results)
                .every(result => {
                    if (result.finishTime != 0) {
                        return true
                    }
                })
        }
        return false
    }

    const showPage = async (id: string, type: string) => {
        switch (type) {
            case 'race':
                setActiveRaceData(await DB.getRaceById(id))
                setPageState(pageStateType.race)
                break

            case 'series':
                setActiveSeriesData(await DB.GetSeriesById(id))
                setPageState(pageStateType.series)
                break

            case 'live':
                setPageState(pageStateType.live)
                break
        }
    }

    let scrollFlag = false
    Events.scrollEvent.register('end', () => {
        if (scrollFlag) {
            console.log('scrolling up')
            scrollFlag = false
            animateScroll.scrollToTop({
                duration: 100,
                smooth: false
            })
        } else {
            scrollFlag = true
            console.log('scrolling down')
            animateScroll.scrollToBottom(scrollOptions)
        }
    })

    const scaleRange = (value: number, r1: number[], r2: number[]) => {
        return ((value - r1[0]!) * (r2[1]! - r2[0]!)) / (r1[1]! - r1[0]!) + r2[0]!
    }

    const updateCheck = async () => {
        console.log('refreshing results')
        let activeFlag = false
        var races = await DB.getTodaysRaceByClubId(club.id)
        if (races.length > 0) {
            for (let i = 0; i < races.length; i++) {
                const res = await DB.getRaceById(races[i]!.id)
                if (checkActive(res)) {
                    setActiveRaceData(res)
                    activeFlag = true
                    break
                }
            }
        } else {
            //there aren't any races today so show info page
            showPage('', 'info')
        }
        if (activeFlag) {
            showPage('', 'live')
        }
        //if no active races decide if series results or race results are more important.
        //if it is a trophy day show series results
        //if it is a normal day show last race results.
        if (!activeFlag && races.length > 0) {
            //check if all races have the same series ID
            let sameSeries = races.flatMap(race => race.series.id).every((val, i, arr) => val === arr[0])
            if (sameSeries) {
                setActiveSeriesData(await DB.GetSeriesById(races[0]!.series.id))
                setPageState(pageStateType.series)
            } else {
                //show the most recent results
                races.sort((a, b) => {
                    return a.Time < b.Time ? 1 : -1
                })
                showPage(races[0]!.id, 'race')
            }
        }
    }

    // useEffect(() => {
    //     const timer1 = setInterval(async () => {
    //         updateCheck()
    //     }, 10000);
    //     return () => {
    //         clearTimeout(timer1);
    //     }
    // }, [club]);

    useEffect(() => {
        animateScroll.scrollToBottom(scrollOptions)
        const fetch = async () => {
            setClub(await DB.GetClubById(club.id))
        }
        if (club.id != '') {
            fetch()
            setOrigin(window.location.origin)
        }
        initialize()
    }, [])

    useEffect(() => {
        if (!todaysRacesIsValidating && todaysRaces && !timerActive) {
            updateCheck()
        }
    }, [todaysRaces, todaysRacesIsValidating])

    useEffect(() => {
        let localTimer = timerValue
        if (timerActive) {
            const timer = setInterval(() => {
                if (localTimer > 0) {
                    setTimerValue(prevTime => prevTime - 1)
                    localTimer = localTimer - 1
                } else {
                    mutate('/api/GetTodaysRaceByClubId')
                    setTimerActive(false)
                    return
                }
            }, 1000)
            return () => {
                clearInterval(timer)
            }
        }
    }, [timerActive])

    return (
        <div>
            <div className='absolute right-8 top-8'>
                <div className='flex flex-row'>
                    <h1 className={title({ color: 'blue' })}>
                        Scan to <br></br>Control
                    </h1>
                    <div onClick={() => window.open(window.location.origin + '/CastControl/' + peerId, '_blank')?.focus()}>
                        <QRCode
                            text={origin + '/CastControl/' + peerId + '?clubId=' + club.id}
                            options={{
                                type: 'image/jpeg',
                                quality: 0.3,
                                errorCorrectionLevel: 'M',
                                margin: 3,
                                scale: 4,
                                width: 100,
                                color: {
                                    dark: '#000000',
                                    light: '#ffffff'
                                }
                            }}
                        />
                    </div>
                </div>
            </div>
            <div key={JSON.stringify(timerActive)}>
                {timerActive ? (
                    <div className='absolute left-0 bottom-0 w-full'>
                        <Progress color='primary' aria-label='Loading...' value={scaleRange(timerValue, [0, timerMax], [100, 0])} className='' />
                    </div>
                ) : null}
            </div>
            <div className='p-6'>
                <h1 className={title({ color: 'blue' })}>SailViz - {club.displayName}</h1>
            </div>

            {(() => {
                switch (pagestate) {
                    case pageStateType.live:
                        return (
                            <div key={JSON.stringify(activeRaceData)}>
                                {activeRaceData.fleets.map((fleet, index) => {
                                    //change this to select the active race.
                                    return (
                                        <>
                                            <div className='flex flex-row'>
                                                <div className='w-1/4 p-2 m-2 border-4 rounded-lg text-lg font-medium'>
                                                    Race Time:{' '}
                                                    <RaceTimer
                                                        key={'fleetTimer' + index}
                                                        fleetId={fleet.id}
                                                        startTime={fleet.startTime}
                                                        timerActive={true}
                                                        onFiveMinutes={null}
                                                        onFourMinutes={null}
                                                        onOneMinute={null}
                                                        onGo={null}
                                                        onWarning={null}
                                                        reset={false}
                                                    />
                                                </div>
                                                <div className='text-4xl font-extrabold px-6 py-3'>
                                                    {activeRaceData.series.name}: {activeRaceData.number} - {fleet.fleetSettings.name}
                                                </div>
                                            </div>

                                            <div className='m-6' key={activeRaceData.id}>
                                                <LiveFleetResultsTable fleet={fleet} startTime={fleet.startTime} handicap={activeRaceData.Type} />
                                            </div>
                                        </>
                                    )
                                })}
                            </div>
                        )
                    case pageStateType.series:
                        return (
                            <div className='p-4'>
                                <div className='text-xl font-extrabold px-6 pt-2'>{activeSeriesData.name}</div>
                                <SeriesResultsTable seriesId={activeSeriesData.id} fleetSettingsId={''} />
                            </div>
                        )
                    case pageStateType.race:
                        return (
                            <div>
                                {activeRaceData.fleets.map((fleet, index) => {
                                    return (
                                        <div key={'fleetResults' + index}>
                                            <div className='text-4xl font-extrabold p-6'>
                                                {activeRaceData.series.name}: {activeRaceData.number} - {fleet.fleetSettings.name}
                                            </div>
                                            {activeRaceData.Type == 'Handicap' ? (
                                                <FleetHandicapResultsTable showTime={true} editable={false} fleetId={fleet.id} />
                                            ) : (
                                                <FleetPursuitResultsTable editable={false} fleetId={fleet.id} />
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        )

                    case pageStateType.info:
                        return <div className='text-6xl font-extrabold p-6'>Placeholder</div>
                    default:
                        return null
                }
            })()}
        </div>
    )
}
