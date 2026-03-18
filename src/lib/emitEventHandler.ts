import axios from 'axios'
import React from 'react'

async function emitEventHandler(event:string, data:any, socketId?:string) {
  const socketBaseUrl = (process.env.NEXT_PUBLIC_SOCKET_SERVER)
  try {
    await axios.post(`${socketBaseUrl}/notify`, { socketId, event, data })
  } catch (error) {
    console.log(error)
  }
}

export default emitEventHandler