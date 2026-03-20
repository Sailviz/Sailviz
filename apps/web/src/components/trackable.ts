export async function getTrackerStatus(trackerID: string) {
    const response = await fetch(`${process.env.TRACKABLE_BASE}/api/tracker/${trackerID}`)

    if (!response.ok) {
        throw new Error(`Error Fetching Tracker Status, Response: ${response.status}`)
    }

    return (await response.json()) as TrackerDataType
}
