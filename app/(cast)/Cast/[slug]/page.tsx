'use client'
import React, { useEffect, useState } from 'react';
import Script from 'next/script';
import * as DB from 'components/apiMethods'
import FleetResultsTable from 'components/tables/FleetHandicapResultsTable';
import SeriesResultsTable from 'components/tables/SeriesResultsTable';
import RaceTimer from "components/HRaceTimer"
import LiveFleetResultsTable from 'components/tables/LiveFleetResultsTable';
import { animateScroll, Events } from 'react-scroll';
import { useTheme } from 'next-themes';
import { Peer, DataConnection } from 'peerjs';
import { useQRCode } from 'next-qrcode';
import { title } from "components/ui/home/primitaves";


const namespace = 'urn:x-cast:com.sailviz';

declare global {
    interface Window { castReceiverManager: any; messageBus: any; }
}

declare var cast: any;

enum pageStateType {
    live,
    series,
    race,
    info
}

const scrollOptions = {
    delay: 10000,
    duration: 15000,
    smooth: false,
};


//This is the page that a chromecast is directed to.
//it receives messages from the chromecast and displays the appropriate data.
// club id is stored in a cookie and is used to get the relavent data / page to display.

export default function Page({ params }: { params: { slug: string } }) {
    var interval: NodeJS.Timer | null = null

    const { theme, setTheme } = useTheme()

    const { Image: QRCode } = useQRCode()


    const [clubId, setClubId] = useState<string>(params.slug)
    const [pagestate, setPageState] = useState<pageStateType>(pageStateType.info)
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
    var [activeRaceData, setActiveRaceData] = useState<RaceDataType>({
        id: "",
        number: 0,
        Time: "",
        OOD: "",
        AOD: "",
        SO: "",
        ASO: "",
        fleets: [{
            id: "",
            startTime: 0,
            raceId: "",
            fleetSettings: {
                id: "",
                name: "",
                boats: [],
                startDelay: 0,
                fleets: []
            } as FleetSettingsType,
            results: [{
                id: "",
                raceId: "",
                Helm: "",
                Crew: "",
                boat: {} as BoatDataType,
                SailNumber: "",
                finishTime: 0,
                CorrectedTime: 0,
                laps: [{
                    time: 0,
                    id: "",
                    resultId: ""
                }],
                PursuitPosition: 0,
                HandicapPosition: 0,
                resultCode: "",
                fleetId: ""
            } as ResultsDataType]

        }],
        Type: "",
        seriesId: "",
        series: {
            name: "",
        } as SeriesDataType
    })
    var [activeSeriesData, setActiveSeriesData] = useState<SeriesDataType>({
        id: "",
        name: "",
        clubId: "",
        settings: {
            numberToCount: 0
        },
        races: [],
        fleetSettings: [{
            id: "",
            name: "",
            boats: [],
            startDelay: 0,
            fleets: []
        } as FleetSettingsType]
    })

    const [peerId, setPeerId] = useState<string>("")

    var peer: Peer;
    var conn: DataConnection | null;

    function initialize() {
        // Create own peer object with connection to shared PeerJS server
        peer = new Peer();

        peer.on('open', function (id) {
            console.log('ID: ' + peer.id);
            setPeerId(peer.id)
        });
        peer.on('connection', function (c) {

            conn = c;
            console.log("Connected to: " + conn.peer);
            ready();
        });
        peer.on('disconnected', function () {
            console.log('Connection lost. Please reconnect');

            peer.reconnect();
        });
        peer.on('close', function () {
            conn = null;
            console.log('Connection destroyed');
        });
        peer.on('error', function (err) {
            console.log(err);
            alert('' + err);
        });
    };

    /**
     * Triggered once a connection has been achieved.
     * Defines callbacks to handle incoming data and connection events.
     */
    const ready = () => {
        //delay to allow peer to connect before sending data
        setTimeout(() => {
            conn!.send(JSON.stringify({ type: 'clubId', clubId: clubId }));
        }, 100)
        conn!.on('data', function (datastring) {
            console.log("Data recieved");
            console.log("datastring: " + datastring)
            let data = JSON.parse(datastring as string)
            console.log(data)
            if (data['type'] == 'showPage') {
                showPage(data['id'], data['pageType'])
            } else if (data['type'] == 'slideShow') {
                slideShow(data['ids'], data['pageType'])
            } else if (data['type'] == 'theme') {
                console.log(data['theme'])
                setTheme(data['theme'])
            }

        });
        conn!.on('close', function () {
            conn = null;
        });
    }

    const initializeCastApi = () => {
        //check if running on a chromecast
        let userAgent = navigator.userAgent
        if (!userAgent.includes("CrKey")) {
            console.log("Not running on chromecast - not loading receiver api")
            return
        }
        window.castReceiverManager = cast.receiver.CastReceiverManager.getInstance();
        console.log('Starting Receiver Manager');

        window.castReceiverManager.onReady = function (event: any) {
            window.castReceiverManager.setApplicationState('chromecast-dashboard is ready...');
        };

        window.castReceiverManager.onSenderConnected = function (event: any) {
            console.log('Received Sender Connected event: ' + event.senderId);
        };

        window.castReceiverManager.onSenderDisconnected = function (event: any) {
            console.log('Received Sender Disconnected event: ' + event.senderId);
        };

        window.messageBus =
            window.castReceiverManager.getCastMessageBus(
                namespace, cast.receiver.CastMessageBus.MessageType.JSON);

        window.messageBus.onMessage = function (event: any) {
            //remove any existing intervals
            if (interval != null) { clearInterval(interval) }

            console.log('Message [' + event.senderId + ']: ' + event.data);

            if (event.data['type'] == 'showPage') {
                showPage(event.data['id'], event.data['pageType'])
                window.messageBus.send(event.senderId, new Date().toISOString());
            } else if (event.data['type'] == 'slideShow') {
                slideShow(event.data['ids'], event.data['pageType'])
                window.messageBus.send(event.senderId, new Date().toISOString());
            } else if (event.data['type'] == 'theme') {
                setTheme(event.data['theme'])
                window.messageBus.send(event.senderId, new Date().toISOString());
            } else {
                window.messageBus.send(event.senderId, new Date().toISOString());
            }
        }

        // Initialize the CastReceiverManager with an application status message.
        window.castReceiverManager.start({ statusText: 'Application is starting' });
        console.log('Receiver Manager started');

    }

    const checkActive = (race: RaceDataType) => {
        if (race.fleets.length == 0) {
            console.error("no fleets found")
        }

        //if any fleets have been started
        if (race.fleets.some((fleet) => fleet.startTime != 0)) {
            //race has started, check if all boats have finished
            return !race.fleets.flatMap(fleet => fleet.results).every((result) => {
                if (result.finishTime != 0) {
                    return true
                }
            })
        }
        return false
    }

    const slideShow = (ids: string[], type: string) => {
        var i = 0
        showPage(ids[i]!, type) // Run immediately
        interval = setInterval(() => {
            i++
            //reset count if at end of array.
            if (i >= ids.length) {
                i = 0
            }
            showPage(ids[i]!, type) // Run on interval
        }, 30000)
    }

    const showPage = async (id: string, type: string) => {
        switch (type) {
            case "race":
                setActiveRaceData(await DB.getRaceById(id))
                setPageState(pageStateType.race)
                break;

            case "series":
                setActiveSeriesData(await DB.GetSeriesById(id))
                setPageState(pageStateType.series)
                break;

            case "live":
                setPageState(pageStateType.live)
                break;
        }
    }

    let scrollFlag = false
    Events.scrollEvent.register('end', () => {
        if (scrollFlag) {
            console.log("scrolling up")
            scrollFlag = false
            animateScroll.scrollToTop({
                duration: 100,
                smooth: false
            });
        } else {
            scrollFlag = true
            console.log("scrolling down")
            animateScroll.scrollToBottom(scrollOptions);
        }
    });

    useEffect(() => {
        animateScroll.scrollToBottom(scrollOptions)
        const fetch = async () => {
            setClub(await DB.GetClubById(clubId))
        }
        if (clubId != "") {
            fetch()
        }
        initialize();

    }, [clubId])

    useEffect(() => {
        const timer1 = setInterval(async () => {
            console.log("refreshing results")
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
                showPage("", "info")
            }
            if (activeFlag) {
                showPage("", "live")
            }
            //if no active races decide if series results or race results are more important.
            //if it is a trophy day show series results
            //if it is a normal day show last race results.
            if (!activeFlag && races.length > 0) {
                //check if all races have the same series ID
                let sameSeries = races.flatMap((race) => race.series.id).every((val, i, arr) => val === arr[0])
                if (sameSeries) {
                    setActiveSeriesData(await DB.GetSeriesById(races[0]!.series.id))
                    setPageState(pageStateType.series)
                } else {
                    //show the most recent results
                    races.sort((a, b) => { return a.Time < b.Time ? 1 : -1 })
                    showPage(races[0]!.id, "race")
                }
            }
        }, 10000);
        return () => {
            clearTimeout(timer1);
        }
    }, [club]);


    return (
        <div>
            <div className=' absolute right-8 top-8'>
                <div className='flex flex-row'>
                    <h1 className={title({ color: "blue" })}>Scan to <br></br>Control</h1>
                    <div onClick={() => window.open(window.location.origin + '/CastControl/' + peerId, '_blank')?.focus()}>
                        <QRCode
                            text={window.location.origin + '/CastControl/' + peerId}
                            options={{
                                type: 'image/jpeg',
                                quality: 0.3,
                                errorCorrectionLevel: 'M',
                                margin: 3,
                                scale: 4,
                                width: 100,
                                color: {
                                    dark: '#000000',
                                    light: '#ffffff',
                                },
                            }}
                        />
                    </div>
                </div>
            </div>
            <Script type="text/javascript" src="//www.gstatic.com/cast/sdk/libs/receiver/2.0.0/cast_receiver.js" onReady={() => {
                initializeCastApi()
            }}></Script>
            <div className='p-4'>
                <h1 className={title({ color: "blue" })}>SailViz - {club.name}</h1>
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
                                                <div className="w-1/4 p-2 m-2 border-4 rounded-lg text-lg font-medium">
                                                    Race Time: <RaceTimer key={"fleetTimer" + index} startTime={fleet.startTime} timerActive={true} onFiveMinutes={null} onFourMinutes={null} onOneMinute={null} onGo={null} onWarning={null} reset={false} />
                                                </div>
                                                <div className="text-4xl font-extrabold px-6 py-3">
                                                    {activeRaceData.series.name}: {activeRaceData.number} - {fleet.fleetSettings.name}
                                                </div>
                                            </div>

                                            <div className="m-6" key={activeRaceData.id}>
                                                <LiveFleetResultsTable fleet={fleet} startTime={fleet.startTime} handicap={activeRaceData.Type} />
                                            </div>
                                        </>
                                    )
                                })}
                            </div>
                        );
                    case pageStateType.series:
                        return (
                            <div className="p-4">
                                <div className="text-xl font-extrabold px-6 pt-2">
                                    {activeSeriesData.name}
                                </div>
                                <SeriesResultsTable data={activeSeriesData} editable={false} showTime={false} key={activeRaceData.id} />
                            </div>
                        );
                    case pageStateType.race:
                        return (
                            <div className="p-4">
                                <div className="text-xl font-extrabold p-6">
                                    {activeRaceData.series.name}: {activeRaceData.number}
                                </div>
                                <FleetResultsTable data={activeRaceData.fleets.flatMap(fleet => fleet.results)} startTime={activeRaceData.fleets[0]?.startTime} key={activeRaceData.id} editable={false} showTime={false} />

                            </div>
                        );
                    case pageStateType.info:
                        return (
                            <div className="text-6xl font-extrabold p-6">
                                Placeholder
                            </div>
                        );
                    default:
                        return null;
                }
            })()}
        </div>
    )
}
