import { orpcClient } from '@lib/orpc'
import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import * as Types from '@sailviz/types'
import html2canvas from 'html2canvas'
import { Button } from '@components/ui/button'

const width = 800
const height = 400

export const ActivitySharePage = ({ activityId }: { activityId: string }) => {
    const activity = useQuery(orpcClient.activity.find.queryOptions({ input: { activityId: activityId } })).data
    const positions = useQuery(orpcClient.activity.positions.queryOptions({ input: { activityId: activityId } })).data

    function computeBounds(points: Types.Position[]) {
        let minLat = Infinity,
            maxLat = -Infinity
        let minLon = Infinity,
            maxLon = -Infinity

        for (const point of points) {
            minLat = Math.min(minLat, point.lat)
            maxLat = Math.max(maxLat, point.lat)
            minLon = Math.min(minLon, point.lon)
            maxLon = Math.max(maxLon, point.lon)
        }

        return { minLat, maxLat, minLon, maxLon }
    }

    function projectPoint(lat: number, lon: number, bounds: any, width: number, height: number, padding = 40) {
        const { minLat, maxLat, minLon, maxLon } = bounds

        const trackWidth = maxLon - minLon
        const trackHeight = maxLat - minLat

        const trackAspect = trackWidth / trackHeight
        const canvasAspect = width / height

        let scale, offsetX, offsetY

        if (trackAspect > canvasAspect) {
            // Fit width, centre vertically
            scale = (width - padding * 2) / trackWidth
            const drawnHeight = trackHeight * scale
            offsetX = padding
            offsetY = (height - drawnHeight) / 2
        } else {
            // Fit height, centre horizontally
            scale = (height - padding * 2) / trackHeight
            const drawnWidth = trackWidth * scale
            offsetY = padding
            offsetX = (width - drawnWidth) / 2
        }

        const x = offsetX + (lon - minLon) * scale
        const y = offsetY + (maxLat - lat) * scale // flip Y

        return { x, y }
    }

    const drawPolyline = (canvas: HTMLCanvasElement, points: Types.Position[]) => {
        const ctx = canvas.getContext('2d')

        if (!ctx) {
            return
        }

        ctx.strokeStyle = '#00FFFF'
        ctx.lineWidth = 4
        const bounds = computeBounds(points)
        ctx.beginPath()
        points.forEach((point, i) => {
            const { x, y } = projectPoint(point.lat, point.lon, bounds, width, height)

            if (i === 0) ctx.moveTo(x, y)
            else ctx.lineTo(x, y)
        })
        ctx.stroke()
    }

    const exportStory = async () => {
        const element = document.getElementById('story-card')
        if (!element) {
            throw new Error('Story card element not found')
        }

        const canvas = await html2canvas(element, {
            scale: 1,
            width: 1080,
            height: 1920,
            backgroundColor: null
        })

        const dataUrl = canvas.toDataURL('image/png')

        return dataUrl
    }

    function dataUrlToUint8Array(dataUrl: string): Uint8Array {
        const base64 = dataUrl.split(',')[1]
        const binary = atob(base64)
        const bytes = new Uint8Array(binary.length)

        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i)
        }

        return bytes // <-- clean Uint8Array, no generics
    }

    async function shareActivityCard(dataUrl: string) {
        const bytes = dataUrlToUint8Array(dataUrl)
        const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer

        const isTauri = '__TAURI_INTERNALS__' in window
        console.log('Is Tauri:', isTauri)

        // 1. Running inside Tauri desktop/mobile
        if (isTauri) {
            const { writeFile, BaseDirectory } = await import('@tauri-apps/plugin-fs')

            await writeFile('sailviz-story.png', bytes, {
                baseDir: BaseDirectory.Download
            })
            return
        }

        // 2. Running in browser AND Web Share API supports files (Android)
        if (navigator.canShare && navigator.canShare({ files: [] })) {
            const file = new File([buffer], 'sailviz-story.png', {
                type: 'image/png'
            })

            await navigator.share({
                title: 'Sailviz Activity',
                files: [file]
            })

            return
        }

        // 3. Browser fallback → download the file
        const blob = new Blob([buffer], { type: 'image/png' })
        const url = URL.createObjectURL(blob)

        const a = document.createElement('a')
        a.href = url
        a.download = 'sailviz-story.png'
        a.click()

        URL.revokeObjectURL(url)
    }

    const shareOnClick = async () => {
        await shareActivityCard(await exportStory())
    }

    useEffect(() => {
        if (!positions) return

        const previewCanvas = document.getElementById('share-canvas') as HTMLCanvasElement
        const storyCanvas = document.getElementById('story-canvas') as HTMLCanvasElement

        drawPolyline(previewCanvas, positions)
        drawPolyline(storyCanvas, positions)
    }, [positions])

    return (
        <>
            <div
                className='bg-slate-900 text-white p-10 rounded-xl flex flex-col items-center'
                style={{
                    width: 360, // preview size (scaled down)
                    height: 640, // preview size (scaled down)
                    transform: 'scale(1)'
                }}
            >
                {/* Title */}
                <h2 className='text-3xl font-bold mb-4'>Sailviz Activity</h2>

                {/* Canvas for the map */}
                <canvas
                    id='share-canvas'
                    width={1080}
                    height={800}
                    style={{
                        width: '100%',
                        height: '50%',
                        borderRadius: '20px',
                        background: '#0f172a'
                    }}
                />

                {/* Stats */}
                <div className='mt-6 text-xl w-full'>
                    {activity?.activityAnalysis != null && (
                        <>
                            <p>Distance: {Math.round(activity.activityAnalysis.distance)} m</p>
                            <p>Max Speed: {Math.round(activity.activityAnalysis.maxSpeed)} m/s</p>
                        </>
                    )}
                </div>
            </div>
            <Button onClick={shareOnClick} className='mt-4'>
                Share Activity
            </Button>
            <div
                id='story-card'
                style={{
                    position: 'absolute',
                    left: '-9999px',
                    width: '1080px',
                    height: '1920px',
                    backgroundColor: '#0f172a',
                    color: 'white',
                    padding: '60px'
                }}
            >
                <h2 style={{ fontSize: '80px', fontWeight: 'bold' }}>Sailviz Activity</h2>

                <canvas
                    id='story-canvas'
                    width={1080}
                    height={800}
                    style={{
                        width: '1080px',
                        height: '800px',
                        borderRadius: '40px',
                        marginTop: '40px'
                    }}
                />

                <div style={{ fontSize: '48px', marginTop: '60px' }}>
                    <p>Distance: {activity?.activityAnalysis?.distance} nm</p>
                    <p>Max Speed: {activity?.activityAnalysis?.maxSpeed} kn</p>
                </div>
            </div>
        </>
    )
}
