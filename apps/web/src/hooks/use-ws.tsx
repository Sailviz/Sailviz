import { useEffect, useState } from 'react'

const useWebSocket = (url: string) => {
    const [messages, setMessages] = useState<string[]>([])
    const [ws, setWs] = useState<WebSocket | null>(null)

    const connect = () => {
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

        return socket
    }

    useEffect(() => {
        const socket = connect()

        return () => {
            socket.close()
        }
    }, [url])

    const sendMessage = (message: string) => {
        if (ws && ws?.readyState == ws?.OPEN) {
            ws.send(message)
        } else {
            console.warn('WebSocket is not open. Unable to send message:', message)
            connect() // Attempt to reconnect if the socket is not open
        }
    }

    return { messages, sendMessage }
}

export default useWebSocket
