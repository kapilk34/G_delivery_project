import { io, Socket } from "socket.io-client"

let socket : Socket | null = null

export const getSocket = ()=>{
    if(!socket){
        const socketBaseUrl = (process.env.NEXT_PUBLIC_SOCKET_SERVER)
        socket = io(socketBaseUrl)
    }
    return socket
}