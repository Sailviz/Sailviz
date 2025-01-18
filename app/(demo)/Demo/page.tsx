'use client'
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import * as DB from 'components/apiMethods';
import cookie from 'js-cookie'

export default function DemoPage({ params }: { params: { slug: string } }) {
    const Router = useRouter();

    useEffect(() => {
        const run = async () => {
            //create a new race for the demo
            let newRace = await DB.createRace('2ad3c0f0-1a54-4e49-bef1-50256d5ce9e9', 'd21e2ca9-22fd-43a2-95fe-6a9b24cf4466')
            newRace = await DB.getRaceById(newRace.id, true)
            //load demo data into the new race
            const demoData = await DB.getRaceById('ca1941a9-9cd8-4a41-8508-3e1a258a42c2', true);
            console.log(newRace)
            //update race data
            await DB.updateRaceById({ ...demoData, id: newRace.id, Type: "handicap", seriesId: 'd21e2ca9-22fd-43a2-95fe-6a9b24cf4466' });
            //add results data
            await Promise.all(demoData.fleets.flatMap(fleet => fleet.results).map(result => {
                return DB.createResult(newRace.fleets[0]!.id).then(newResult => {
                    DB.updateResult({ ...newResult, Helm: result.Helm, Crew: result.Crew, boat: result.boat })
                })
            }))

            // set user cookies if they don't exist
            if (!cookie.get('userId')) {
                cookie.set('userId', 'dfcc60fd-2f12-4f4b-b847-016ac9883553', { expires: 1 });
            }
            if (!cookie.get('clubId')) {
                cookie.set('clubId', '2ad3c0f0-1a54-4e49-bef1-50256d5ce9e9', { expires: 1 });
            }

            // Redirect to another page
            Router.replace(`/Demo/Race/${newRace.id}`);
        }
        run();
    }, [Router]);

    return (
        <div>
            <p>Setting up practice Mode</p>
        </div>
    );
};