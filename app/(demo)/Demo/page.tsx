'use client'
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import * as DB from 'components/apiMethods';

export default function DemoPage({ params }: { params: { slug: string } }) {
    const router = useRouter();

    useEffect(() => {
        const run = async () => {
            //create a new race for the demo
            const newRace = await DB.createRace('2ad3c0f0-1a54-4e49-bef1-50256d5ce9e9', 'd21e2ca9-22fd-43a2-95fe-6a9b24cf4466');

            //load demo data into the new race
            const demoData = await DB.getRaceById('ca1941a9-9cd8-4a41-8508-3e1a258a42c2');

            await DB.updateRaceById({ ...demoData, id: newRace.id, Type: 'Handicap' });


            // Redirect to another page
            router.push(`/Demo/Race/${newRace.id}`);
        }
        run();
    }, [router]);

    return (
        <div>
            <p>Setting up practice Mode</p>
        </div>
    );
};