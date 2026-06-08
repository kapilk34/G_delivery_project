'use client'
import { SessionProvider } from 'next-auth/react'
import React from 'react'

function Provider({children} : {children:React.ReactNode}) {
  return (
    <SessionProvider 
      basePath="/api/auth"
      refetchInterval={0}
      refetchOnWindowFocus={true}
    >
        {children}
    </SessionProvider>
  )
}

export default Provider
