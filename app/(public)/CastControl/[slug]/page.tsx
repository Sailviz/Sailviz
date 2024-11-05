'use client'
import { useEffect, useState } from "react";
import { Peer, DataConnection } from "peerjs";
import { title } from "components/ui/home/primitaves";
import * as DB from 'components/apiMethods';

//club page should contain:
//list of current series
//list of recent races
//list of upcoming races

var peer: Peer = new Peer()
var conn: DataConnection | null = null;

export default function Page({ params }: { params: { slug: string } }) {

    const [clubId, setClubId] = useState<string>('')
    const [club, setClub] = useState<ClubDataType>({} as ClubDataType)
    const [races, setRaces] = useState<any[]>([])
    const [series, setSeries] = useState<any[]>([])

    const initialize = async () => {
        // Create own peer object with connection to shared PeerJS server
        peer = new Peer();

        peer.on('open', function (id) {
            console.log('ID: ' + peer.id);
            join()
        });
        peer.on('connection', function (c) {
            // Disallow incoming connections
            c.on('open', function () {
                c.send("Sender does not accept incoming connections");
                setTimeout(function () { c.close(); }, 500);
            });
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
     * Create the connection between the two Peers.
     *
     * Sets up callbacks that handle any events related to the
     * connection and data received on it.
     */
    function join() {
        console.log("Joining: " + params.slug);
        // Close old connection
        if (conn) {
            conn.close();
        }
        console.log("Connecting to: " + params.slug);
        // Create connection to destination peer specified in the input field
        conn = peer.connect(params.slug, {
            reliable: true
        });

        conn.on('open', function () {
            console.log("Connected to: " + conn!.peer);

            // Check URL params for comamnds that should be sent immediately
            var command = getUrlParam("command");
            if (command)
                conn!.send(command);
        });
        // Handle incoming data (messages only since this is the signal sender)
        conn.on('data', function (datastring) {
            console.log("Received: " + datastring);
            let data = JSON.parse(datastring as string)
            if (data['type'] == 'clubId') {
                setClubId(data['clubId'])
            };
        });
        conn.on('close', function () {
            console.log("Connection closed");
        });
    };

    /**
     * Get first "GET style" parameter from href.
     * This enables delivering an initial command upon page load.
     *
     * Would have been easier to use location.hash.
     */
    function getUrlParam(name: string) {
        name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
        var regexS = "[\\?&]" + name + "=([^&#]*)";
        var regex = new RegExp(regexS);
        var results = regex.exec(window.location.href);
        if (results == null)
            return null;
        else
            return results[1];
    };

    /**
     * Send a signal via the peer connection and add it to the log.
     * This will only occur if the connection is still alive.
     */
    function signal(sigName: string) {
        if (conn && conn.open) {
            conn.send(sigName);
            console.log(sigName + " signal sent");
        } else {
            console.log('Connection is closed');
        }
    }

    const sendTheme = (theme: string) => {
        let data = {
            type: "theme",
            theme: theme
        }
        signal(JSON.stringify(data));
    }

    const showPage = (id: string, type: string) => {
        let data = {
            type: "showPage",
            id: id,
            pageType: type
        }
        signal(JSON.stringify(data))
    }

    const slideShow = (ids: string[], type: string) => {
        let data = {
            type: "slideShow",
            ids: ids,
            pageType: type
        }
        signal(JSON.stringify(data))
    }

    useEffect(() => {
        const fetch = async () => {
            setClub(await DB.GetClubById(clubId))
        }
        if (clubId != "") {
            fetch()
        }

    }, [clubId])

    // Since all our callbacks are setup, start the process of obtaining an ID
    useEffect(() => {
        initialize();
    }, [])

    return (
        <div className="flex flex-col px-6">
            <h1 className={title({ color: "blue" })}>{club.name} - Control</h1>
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
        </div>
    );
}