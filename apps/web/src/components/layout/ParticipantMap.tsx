import { Fragment, useEffect, useRef, useState } from 'react'
import { orpcClient } from '@lib/orpc'
import { Circle, MapContainer, Marker, Polyline, TileLayer, useMap } from 'react-leaflet'
import { Icon, type LatLngExpression } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useMutation, useQuery } from '@tanstack/react-query'
import L from 'leaflet'
import * as Types from '@sailviz/types'
import dayjs from 'dayjs'

export default function ParticipantMap({ raceId, windowHeight, participantId }: { raceId: string; windowHeight: number; participantId: string }) {
    const ZOOM_LEVEL = 9

    const race = useQuery(orpcClient.race.find.queryOptions({ input: { raceId } })).data
    const event = useQuery(orpcClient.trackable.event.find.queryOptions({ input: { eventId: race!.trackableEventId! } })).data

    const getParticipantPositionsMutation = useMutation(orpcClient.trackable.device.positions.mutationOptions())
    const { data: participant } = useQuery(orpcClient.trackable.participant.find.queryOptions({ input: { participantId } }))
    const [participantData, setParticipantData] = useState<Types.Participant>({} as Types.Participant)
    const [currentPosition, setCurrentPosition] = useState<LatLngExpression | null>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [playbackSpeed, setPlaybackSpeed] = useState(1) // Playback speed multiplier
    const [scrubIndex, setScrubIndex] = useState(0) // Current index for scrubbing
    const [boundsSet, setBoundsSet] = useState(false) // Track if bounds have been set

    async function fetchParticipantPositions(participant: Types.Participant, live: boolean): Promise<Types.Participant> {
        console.log(event)
        console.log(participant)
        let positions = await getParticipantPositionsMutation.mutateAsync(
            {
                deviceId: participant.Device.id,
                start: live ? '-10m' : dayjs(event?.startTime! * 1000).toISOString(),
                stop: live ? dayjs().toISOString() : dayjs(event?.endTime! * 1000).toISOString(),
                highres: false
            },
            {
                onSuccess(positions) {
                    console.log(`Fetched positions for ${participant.Device.id}:`, positions)
                },
                onError(error) {
                    console.log('Failed to fetch positions for ' + participant.Device.id, error)
                }
            }
        )
        return { ...participant, position: positions }
    }

    useEffect(() => {
        console.log('Event data:', event)
        let mounted = true
        if (event && !event.isRunning && event.endTime != 0) {
            const fetchAll = async () => {
                try {
                    const results = await fetchParticipantPositions(participant!, false)
                    console.log('Fetched participant positions', results)
                    if (mounted) setParticipantData(results)
                } catch (err) {
                    console.error('Error fetching participant positions', err)
                }
            }
            // initial fetch and then interval
            fetchAll()
        }
    }, [event, participant])

    // ref to the outer wrapper so fullscreen can be toggled on that element
    const wrapperRef = useRef<HTMLDivElement | null>(null)

    // Fullscreen button that always displays in the wrapper and toggles the wrapper's fullscreen
    function FullscreenButton({ wrapper }: { wrapper: React.RefObject<HTMLDivElement | null> }) {
        const toggle = async () => {
            try {
                const el = wrapper.current
                if (!el) return
                if (!document.fullscreenElement) {
                    await el.requestFullscreen?.()
                } else {
                    await document.exitFullscreen?.()
                }
            } catch (err) {
                console.warn('Fullscreen toggle failed', err)
            }
        }
        return (
            <button
                onClick={toggle}
                style={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    zIndex: 1001,
                    background: 'white',
                    border: '1px solid #ddd',
                    padding: '6px 8px',
                    borderRadius: 4,
                    cursor: 'pointer'
                }}
                aria-label='Toggle fullscreen'
                type='button'
            >
                ⛶
            </button>
        )
    }

    function FitBounds({ buoys }: { buoys?: Types.BuoyType[] }) {
        const map = useMap()

        useEffect(() => {
            // Ensure buoys exist, are not empty, and bounds haven't been set yet
            if (!buoys || buoys.length === 0 || boundsSet) return

            // Create LatLng objects from buoy data
            const buoyPoints = buoys.map(b => L.latLng(b.lat, b.lon))

            // Create bounds and fit them to the map
            const bounds = L.latLngBounds(buoyPoints)
            map.fitBounds(bounds, { padding: [50, 50] }) // padding in pixels

            // Mark bounds as set
            setBoundsSet(true)
        }, [buoys]) // Dependency on `buoys` ensures it checks for initial data

        return null
    }

    const bearing = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const toRad = (d: number) => (d * Math.PI) / 180
        const toDeg = (r: number) => (r * 180) / Math.PI
        const φ1 = toRad(lat1)
        const φ2 = toRad(lat2)
        const Δλ = toRad(lon2 - lon1)
        const y = Math.sin(Δλ) * Math.cos(φ2)
        const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ)
        return (toDeg(Math.atan2(y, x)) + 360) % 360
    }

    const markerIcon = new Icon({ iconUrl: '/marker-icon.png', iconSize: [25, 41], iconAnchor: [13, 41] })

    useEffect(() => {
        let interval: NodeJS.Timeout
        if (isPlaying && participantData.position) {
            const positions = participantData.position.map((pos: any) => [pos.lat, pos.lon] as LatLngExpression)
            let index = scrubIndex

            interval = setInterval(() => {
                if (index < positions.length) {
                    setCurrentPosition(positions[index])
                    setScrubIndex(index)
                    index++
                } else {
                    clearInterval(interval)
                    setIsPlaying(false)
                }
            }, 1000 / playbackSpeed) // Adjust interval based on playback speed
        }

        return () => clearInterval(interval)
    }, [isPlaying, participantData.position, playbackSpeed, scrubIndex])

    const handleScrubChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newIndex = parseInt(event.target.value, 10)
        setScrubIndex(newIndex)
        if (participantData.position) {
            const positions = participantData.position.map((pos: any) => [pos.lat, pos.lon] as LatLngExpression)
            setCurrentPosition(positions[newIndex])
        }
    }

    const togglePlaybackSpeed = () => {
        const speeds = [1, 2, 4, 8, 16]
        const currentIndex = speeds.indexOf(playbackSpeed)
        const nextIndex = (currentIndex + 1) % speeds.length
        setPlaybackSpeed(speeds[nextIndex])
    }

    return (
        // wrapper ensures positioned button sits above the map and can be full-screened
        <div ref={wrapperRef} style={{ position: 'relative', height: windowHeight, width: '100%', zIndex: 2 }}>
            <FullscreenButton wrapper={wrapperRef} />
            <MapContainer center={[51.6, -1.9]} zoom={ZOOM_LEVEL} style={{ height: '80%', width: '100%' }}>
                <TileLayer
                    maxZoom={20}
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                />
                {participantData.position &&
                    (() => {
                        const points: any[] = participantData.position.map((pos: any) => [pos.lat, pos.lon]) || []
                        return <Polyline key={participantData.id} positions={points} pathOptions={{ color: '#FF00FF', weight: 4 }} />
                    })()}
                {currentPosition && (
                    <Circle
                        center={currentPosition}
                        radius={5} // Small circle radius
                        pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 1 }}
                    />
                )}
                {race?.courseBuoys?.flatMap(waypoint => {
                    if (!waypoint.buoy.isStartLine) {
                        return (
                            <Fragment key={waypoint.id}>
                                <Circle center={[waypoint.buoy.lat, waypoint.buoy.lon]} radius={10} />
                            </Fragment>
                        )
                    } else {
                        return (
                            <Fragment key={waypoint.id}>
                                <Marker position={[waypoint.buoy.lat, waypoint.buoy.lon]} icon={markerIcon} />
                                <Marker position={[waypoint.buoy.lat ? waypoint.buoy.lat : 0, waypoint.buoy.lon ? waypoint.buoy.lon : 0]} icon={markerIcon} />
                                <Polyline
                                    positions={[
                                        [waypoint.buoy.lat, waypoint.buoy.lon],
                                        [waypoint.buoy.lat ? waypoint.buoy.lat : 0, waypoint.buoy.lon ? waypoint.buoy.lon : 0]
                                    ]}
                                    color='red'
                                />
                            </Fragment>
                        )
                    }
                })}
                {race?.courseBuoys?.some(w => w.order !== 0) && race.courseBuoys.length >= 2 && (
                    <>
                        {race.courseBuoys.slice(0, -1).map((from, i) => {
                            let positions: [number, number][]
                            const to = race.courseBuoys![i + 1]
                            positions = [
                                [from.buoy.lat, from.buoy.lon],
                                [to.buoy.lat, to.buoy.lon]
                            ]

                            const mid: [number, number] = [(positions[0][0] + positions[1][0]) / 2, (positions[0][1] + positions[1][1]) / 2]
                            const angle = bearing(positions[0][0], positions[0][1], positions[1][0], positions[1][1]) - 90
                            const arrowIcon = L.divIcon({
                                html: `<div style="display:inline-block; transform: rotate(${angle}deg); font-size:18px; line-height:1;">➤</div>`,
                                className: '',
                                iconSize: [20, 20],
                                iconAnchor: [10, 10]
                            })
                            return (
                                <Fragment key={`seg-${from.id}-${to.id}`}>
                                    <Polyline positions={positions} color='blue' weight={2} />
                                    <Marker position={mid} icon={arrowIcon} interactive={false} />
                                </Fragment>
                            )
                        })}
                        {race.courseBuoys.length >= 2 &&
                            (() => {
                                const first = race.courseBuoys[0]
                                const last = race.courseBuoys[race.courseBuoys.length - 1]
                                let positions: [number, number][]

                                positions = [
                                    [last.buoy.lat, last.buoy.lon],
                                    [first.buoy.lat, first.buoy.lon]
                                ]

                                const mid: [number, number] = [(positions[0][0] + positions[1][0]) / 2, (positions[0][1] + positions[1][1]) / 2]
                                const angle = bearing(positions[0][0], positions[0][1], positions[1][0], positions[1][1]) - 90
                                const arrowIcon = L.divIcon({
                                    html: `<div style="display:inline-block; transform: rotate(${angle}deg); font-size:18px; line-height:1;">➤</div>`,
                                    className: '',
                                    iconSize: [20, 20],
                                    iconAnchor: [10, 10]
                                })
                                return (
                                    <Fragment key={`seg-loop-${last.id}-${first.id}`}>
                                        <Polyline positions={positions} color='blue' weight={2} />
                                        <Marker position={mid} icon={arrowIcon} interactive={false} />
                                    </Fragment>
                                )
                            })()}
                    </>
                )}
                <FitBounds buoys={race?.courseBuoys?.map(m => m.buoy)} />
            </MapContainer>
            <div className='controls-container' style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '10px' }}>
                <button onClick={() => setIsPlaying(!isPlaying)} className='control-button play-pause' style={{ fontSize: '1.5rem', padding: '10px' }}>
                    {isPlaying ? '⏸' : '▶️'}
                </button>
                <input
                    type='range'
                    min='0'
                    max={participantData.position ? participantData.position.length - 1 : 0}
                    value={scrubIndex}
                    onChange={handleScrubChange}
                    className='control-slider'
                    style={{ flex: 1, margin: '0 10px', height: '10px' }}
                />
                <button onClick={togglePlaybackSpeed} className='control-button speed-toggle' style={{ fontSize: '1.5rem', padding: '10px' }}>
                    {playbackSpeed}x
                </button>
            </div>
        </div>
    )
}
