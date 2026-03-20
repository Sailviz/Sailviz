import { useEffect, useState } from 'react'

const useWebSocket = (url: string) => {
    const [messages, setMessages] = useState<string[]>([])
    const [ws, setWs] = useState<WebSocket | null>(null)

    useEffect(() => {
        console.log('useWebSocket effect triggered with URL:', url)
        const socket = new WebSocket(url)
        console.log('Connecting to WebSocket')
        socket.addEventListener('open', _ => {
            console.log('Connection opened')
            setWs(socket)
        })

        socket.onmessage = event => {
            setMessages(prevMessages => [...prevMessages, event.data])
        }

        return () => {
            socket.close()
        }
    }, [url])

    const sendMessage = (message: string) => {
        if (ws) {
            ws.send(message)
        }
    }

    return { messages, sendMessage }
}

export default useWebSocket
