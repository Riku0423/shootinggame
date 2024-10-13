'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

const SpaceInvadersComponent = dynamic(
  () => import('@/components/space-invaders').then((mod) => mod.SpaceInvadersComponent),
  { ssr: false }
)

export default function Home() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return null // または適切なローディング表示
  }

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <SpaceInvadersComponent />
    </div>
  );
}
