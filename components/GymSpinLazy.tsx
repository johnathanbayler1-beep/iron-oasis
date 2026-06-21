'use client'
import dynamic from 'next/dynamic'
const GymSpin = dynamic(() => import('./GymSpin'), { ssr: false })
export default GymSpin
