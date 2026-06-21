'use client'
import dynamic from 'next/dynamic'
const GymScene = dynamic(() => import('./GymScene'), { ssr: false })
export default GymScene
