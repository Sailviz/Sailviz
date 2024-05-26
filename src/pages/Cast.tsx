import React, { useEffect, useState } from 'react';
import Script from 'next/script';
import SignOnTable from '../components/SignOnTable';
import * as DB from '../components/apiMethods'
import FleetResultsTable from '../components/FleetResultsTable';
const namespace = 'urn:x-cast:com.sailviz';

const CastPage = () => {
    var senderId = '';
    const initializeCastApi = () => {
        // Initialize the CastReceiverManager with an application status message.
        // cast.receiver.logger.setLevelValue(0);
        window.castReceiverManager = cast.receiver.CastReceiverManager.getInstance();
        console.log('Starting Receiver Manager');

        window.castReceiverManager.onReady = function (event) {
            console.log('Received Ready event: ' + JSON.stringify(event.data));
            window.castReceiverManager.setApplicationState('chromecast-dashboard is ready...');
        };

        window.castReceiverManager.onSenderConnected = function (event) {
            console.log('Received Sender Connected event: ' + event.senderId);
        };

        window.castReceiverManager.onSenderDisconnected = function (event) {
            console.log('Received Sender Disconnected event: ' + event.senderId);
        };

        window.messageBus =
            window.castReceiverManager.getCastMessageBus(
                namespace, cast.receiver.CastMessageBus.MessageType.JSON);

        window.messageBus.onMessage = function (event) {
            senderId = event.senderId;
            console.log('Message [' + event.senderId + ']: ' + event.data);

            if (event.data['type'] == 'clubId') {
                window.messageBus.send(event.senderId, "test");
                setClubId(event.data['clubId'])
            } else if (event.data['type'] == 'showPage') {
                window.messageBus.send(event.senderId, new Date().toISOString());
            }
        }

        // Initialize the CastReceiverManager with an application status message.
        window.castReceiverManager.start({ statusText: 'Application is starting' });
        console.log('Receiver Manager started');


    }

    var [races, setRaces] = useState<RaceDataType[]>([])

    const [clubId, setClubId] = useState<string>("")

    var [activeRaceData, setActiveRaceData] = useState<RaceDataType>({
        id: "",
        number: 0,
        Time: "",
        OOD: "",
        AOD: "",
        SO: "",
        ASO: "",
        fleets: [],
        Type: "",
        seriesId: "",
        series: {} as SeriesDataType
    })

    useEffect(() => {
        if (clubId != "") {
            //catch if not fully updated
            if (clubId == "invalid") {
                return
            }

            const fetchTodaysRaces = async () => {
                var data = await DB.getTodaysRaceByClubId(clubId)
                console.log(data)
                if (data) {
                    let racesCopy: RaceDataType[] = []
                    let fleetsCopy: FleetDataType[] = []
                    for (let i = 0; i < data.length; i++) {
                        console.log(data[i]!.number)
                        const res = await DB.getRaceById(data[i]!.id)
                        racesCopy[i] = res
                    }
                    setRaces(racesCopy)
                } else {
                    console.log("could not find todays race")
                }
            }
            fetchTodaysRaces()
        }
    }, [clubId])


    return (
        <div className='bg-white h-full'>
            <Script type="text/javascript" src="//www.gstatic.com/cast/sdk/libs/receiver/2.0.0/cast_receiver.js" onReady={() => {
                initializeCastApi()
            }}></Script>

            <div>
                <div className="flex w-full shrink flex-row justify-around">
                    {races.map((race, index) => {
                        return (
                            <p key={index} className="w-1/4 p-2 m-2 cursor-pointer text-white bg-blue-600 font-medium rounded-lg text-xl px-5 py-2.5 text-center">
                                {race.series.name}: {race.number} Results
                            </p>
                        )
                    })}
                </div>
                {races.length > 0 ?
                    <div>
                        {races.map((race, index) => {
                            return (
                                <div className="m-6" key={JSON.stringify(races) + index}>
                                    <div className="text-4xl font-extrabold text-gray-700 p-6">
                                        {race.series.name}: {race.number} at {race.Time.slice(10, 16)}
                                    </div>
                                    <SignOnTable data={race.fleets.flatMap((fleet) => (fleet.results))} updateResult={null} createResult={null} clubId={clubId} showEditModal={null} />
                                </div>
                            )
                        })}

                    </div>
                    :
                    <div>
                        <p className="text-6xl font-extrabold text-gray-700 p-6"> No Races Today</p>
                    </div>
                }
            </div>
            <div id="Results" className="hidden" >
                <div className="p-4">
                    <div className="text-6xl font-extrabold text-gray-700 p-6">
                        {activeRaceData.series.name}: {activeRaceData.number}
                    </div>
                    <FleetResultsTable data={activeRaceData.fleets.flatMap((fleet) => (fleet.results))} startTime={null} key={JSON.stringify(activeRaceData)} deleteResult={() => { }} updateResult={() => { }} createResult={() => { }} clubId={clubId} raceId={activeRaceData.id} />
                </div>
            </div>
            <div id="Guide" className="hidden" >
                <div className=' w-11/12 mx-auto my-3'>
                    <iframe
                        className='block w-full'
                        src="/0.2 Race Sign On Guide.pdf#toolbar=0"
                        height="800"
                    />

                </div>
            </div>
        </div>
    )
};

export default CastPage;