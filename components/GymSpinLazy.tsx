'use client'
import dynamic from 'next/dynamic'
const GymSpin = dynamic(() => import('./GymSpin'), { ssr: false, loading: () => <div style={{ width: '100%', height: '100vh', background: '#000' }} /> })
export default GymSpin
