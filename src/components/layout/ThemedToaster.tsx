'use client'
import { Toaster } from 'react-hot-toast'

export function ThemedToaster() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: 'rgba(250,242,230,0.97)',
          color: '#2a1a08',
          border: '1px solid rgba(140,100,40,0.25)',
          backdropFilter: 'blur(20px)',
          fontFamily: 'var(--font-eb-garamond)',
          fontSize: '1rem',
          boxShadow: '0 4px 24px rgba(80,50,10,0.12)',
        },
      }}
    />
  )
}