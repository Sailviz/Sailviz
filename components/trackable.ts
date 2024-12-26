'use server'
import prisma from 'components/prisma'

export async function syncTrackers(trackableOrgID: string, clubId: string) {
    const response = await fetch(`${process.env.TRACKABLE_BASE}/api/tracker/org/${trackableOrgID}`)

    if (!response.ok) {
        throw new Error(`Error Fetching Trackers, Response: ${response.status}`);
    }

    const json = await response.json()
    const trackers = json.trackers

    for (const tracker of trackers) {
        await prisma.trackers.upsert({
            where: {
                trackerID: tracker.trackerID,
            },
            update: {
                name: tracker.name,
            },
            create: {
                trackerID: tracker.trackerID,
                clubId: clubId,
                name: tracker.name,
            },
        })
    }

    return
}

export async function getTrackerStatus(trackerID: string) {
    const response = await fetch(`${process.env.TRACKABLE_BASE}/api/tracker/${trackerID}`)

    if (!response.ok) {
        throw new Error(`Error Fetching Tracker Status, Response: ${response.status}`);
    }

    return await response.json() as TrackerDataType
}


