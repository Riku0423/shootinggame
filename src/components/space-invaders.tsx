'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import dynamic from 'next/dynamic'

const GAME_WIDTH = 300
const GAME_HEIGHT = 400
const PLAYER_SIZE = 30
const ENEMY_SIZE = 20
const BULLET_SIZE = 5
const ENEMY_ROWS = 4
const ENEMY_COLS = 8

type Position = { x: number; y: number }

const SpaceInvadersComponentClient = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [player, setPlayer] = useState<Position>({ x: GAME_WIDTH / 2 - PLAYER_SIZE / 2, y: GAME_HEIGHT - PLAYER_SIZE - 10 });
  const [enemies, setEnemies] = useState<Position[]>([]);
  const [bullets, setBullets] = useState<Position[]>([]);

  const initializeEnemies = useCallback(() => {
    const newEnemies: Position[] = []
    for (let row = 0; row < ENEMY_ROWS; row++) {
      for (let col = 0; col < ENEMY_COLS; col++) {
        newEnemies.push({
          x: col * (ENEMY_SIZE + 10) + 20,
          y: row * (ENEMY_SIZE + 10) + 20,
        })
      }
    }
    return newEnemies
  }, [])

  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setPlayer({ x: GAME_WIDTH / 2 - PLAYER_SIZE / 2, y: GAME_HEIGHT - PLAYER_SIZE - 10 });
    setEnemies(initializeEnemies());
    setBullets([]);
  }

  useEffect(() => {
    if (!gameStarted || gameOver) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setPlayer(prev => ({ ...prev, x: Math.max(0, prev.x - 10) }))
      } else if (e.key === 'ArrowRight') {
        setPlayer(prev => ({ ...prev, x: Math.min(GAME_WIDTH - PLAYER_SIZE, prev.x + 10) }))
      } else if (e.key === ' ') {
        setBullets(prev => [...prev, { x: player.x + PLAYER_SIZE / 2 - BULLET_SIZE / 2, y: player.y }])
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [gameStarted, gameOver, player])

  useEffect(() => {
    if (!gameStarted || gameOver) return

    const gameLoop = setInterval(() => {
      // Move bullets
      setBullets(prev => prev.map(bullet => ({ ...bullet, y: bullet.y - 5 })).filter(bullet => bullet.y > 0))

      // Move enemies
      setEnemies(prev => {
        const newEnemies = prev.map(enemy => ({ ...enemy, y: enemy.y + 0.2 }))
        if (newEnemies.some(enemy => enemy.y + ENEMY_SIZE > player.y)) {
          setGameOver(true)
        }
        return newEnemies
      })

      // Check collisions
      setBullets(prev => {
        const remainingBullets = [...prev]
        setEnemies(prevEnemies => {
          const remainingEnemies = prevEnemies.filter(enemy => {
            const hitByBullet = remainingBullets.some((bullet, bulletIndex) => {
              if (
                bullet.x < enemy.x + ENEMY_SIZE &&
                bullet.x + BULLET_SIZE > enemy.x &&
                bullet.y < enemy.y + ENEMY_SIZE &&
                bullet.y + BULLET_SIZE > enemy.y
              ) {
                remainingBullets.splice(bulletIndex, 1)
                setScore(s => s + 10)
                return true
              }
              return false
            })
            return !hitByBullet
          })

          if (remainingEnemies.length === 0) {
            setEnemies(initializeEnemies())
          }

          return remainingEnemies
        })
        return remainingBullets
      })
    }, 1000 / 60)  // 60 FPS

    return () => clearInterval(gameLoop)
  }, [gameStarted, gameOver, player, initializeEnemies])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">スペースインベーダー</h1>
      <div 
        className="relative bg-black"
        style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
        role="region"
        aria-label="スペースインベーダーゲーム"
      >
        {!gameStarted && !gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70">
            <Button onClick={startGame}>ゲームスタート</Button>
          </div>
        )}
        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70">
            <p className="text-white text-2xl mb-4">ゲームオーバー</p>
            <Button onClick={startGame}>リスタート</Button>
          </div>
        )}
        <div
          className="absolute bg-green-500"
          style={{
            left: player.x,
            top: player.y,
            width: PLAYER_SIZE,
            height: PLAYER_SIZE,
          }}
        />
        {enemies.map((enemy, index) => (
          <div
            key={index}
            className="absolute bg-red-500"
            style={{
              left: enemy.x,
              top: enemy.y,
              width: ENEMY_SIZE,
              height: ENEMY_SIZE,
            }}
          />
        ))}
        {bullets.map((bullet, index) => (
          <div
            key={index}
            className="absolute bg-yellow-500"
            style={{
              left: bullet.x,
              top: bullet.y,
              width: BULLET_SIZE,
              height: BULLET_SIZE,
            }}
          />
        ))}
      </div>
      <p className="mt-4 text-xl">スコア: {score}</p>
      <p className="mt-2 text-sm">
        操作方法: 左右矢印キーで移動、スペースキーで射撃
      </p>
    </div>
  )
}

const SpaceInvadersComponentWrapper = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  return <SpaceInvadersComponentClient />;
};

export const SpaceInvadersComponent = dynamic(
  () => Promise.resolve(SpaceInvadersComponentWrapper),
  { ssr: false }
)
