'use client'

import Image from 'next/image'
import { useState, useEffect, useCallback, useMemo } from 'react'

export default function ComingSoon() {
  const [gameActive, setGameActive] = useState(false)
  const [tapCount, setTapCount] = useState(0)
  const [lastTapTime, setLastTapTime] = useState(0)
  const TAP_THRESHOLD = 300
  const REQUIRED_TAPS = 5

  // Move KONAMI_CODE into useMemo to prevent unnecessary re-renders
  const SECRET_CODE = useMemo(() => ['ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowUp', 'v', 'e', 'a', 'x'], [])
  const [currentSequence, setCurrentSequence] = useState<string[]>([])

  const handleTap = () => {
    const currentTime = Date.now()
    if (currentTime - lastTapTime < TAP_THRESHOLD) {
      const newTapCount = tapCount + 1
      setTapCount(newTapCount)
      
      if (newTapCount >= REQUIRED_TAPS) {
        setGameActive(true)
        setTapCount(0)
      }
    } else {
      setTapCount(1)
    }
    setLastTapTime(currentTime)
  }

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    setCurrentSequence(prev => {
      const newSequence = [...prev, event.key]
      if (newSequence.length > SECRET_CODE.length) {
        newSequence.shift()
      }
      
      if (newSequence.join(',') === SECRET_CODE.join(',')) {
        setGameActive(true)
        return [] // Reset sequence after successful activation
      }
      
      return newSequence
    })
  }, [SECRET_CODE])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [handleKeyPress])

  // Add this helper function
  const getSequenceProgress = useMemo(() => {
    return SECRET_CODE.map((_, index) => 
      currentSequence[index] ? '●' : '○'
    ).join(' ')
  }, [currentSequence, SECRET_CODE])

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-white">
      {/* Stars */}
      <div className="stars"></div>
      
      {/* Sequence Progress Indicator - New Addition */}
      <div className="fixed top-4 right-4 text-xs opacity-30 select-none hidden md:block">
        {getSequenceProgress}
      </div>
      
      {/* Mini Game */}
      {gameActive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90">
          <div className="relative h-[80vh] w-[80vw] max-w-3xl border-2 border-white p-4">
            <button 
              onClick={() => setGameActive(false)}
              className="absolute -top-10 right-0 px-4 py-2 text-white hover:text-gray-300"
            >
              Close Game
            </button>
            <MiniGame />
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <div className="relative z-20 flex min-h-screen w-full flex-col items-center justify-center gap-12 p-4">
        {/* Logo Image - Now clickable */}
        <div 
          className="relative w-64 h-64 md:w-96 md:h-96 cursor-pointer active:scale-95 transition-transform"
          onClick={handleTap}
        >
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Untitled.jpg-6lZ0ZA6GXYDGq7o0DzNWqK8uBFhGRs.jpeg"
            alt="Bored Dog Club Background"
            fill
            className="object-contain"
            priority
            sizes="(max-width: 768px) 256px, 384px"
            quality={100}
          />
        </div>

        {/* Coming Soon Text */}
        <h1 className="text-5xl font-bold tracking-wider sm:text-7xl md:text-8xl animate-pulse">
          Coming Soon
        </h1>
      </div>
    </div>
  )
}

function MiniGame() {
  const [score, setScore] = useState(0)
  const [playerPosition, setPlayerPosition] = useState(50)
  const [bones, setBones] = useState<{id: number, x: number, y: number}[]>([])
  const [lastCatch, setLastCatch] = useState<{x: number, y: number, time: number} | null>(null)

  // Handle keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setPlayerPosition(prev => Math.max(0, prev - 3))
      } else if (e.key === 'ArrowRight') {
        setPlayerPosition(prev => Math.min(90, prev + 3))
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Handle touch controls with smoother movement
  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault() // Prevent screen drag
    const touch = e.touches[0]
    const rect = e.currentTarget.getBoundingClientRect()
    const x = touch.clientX - rect.left
    const percentage = (x / rect.width) * 100
    setPlayerPosition(Math.max(0, Math.min(90, percentage)))
  }

  useEffect(() => {
    const gameLoop = setInterval(() => {
      // Create new bones
      if (Math.random() < 0.1) {
        setBones(prev => [...prev, {
          id: Date.now(),
          x: Math.random() * 90,
          y: 0
        }])
      }

      // Update bones positions and check collisions
      setBones(prev => {
        const newBones = prev.map(bone => ({
          ...bone,
          y: bone.y + 1.5
        })).filter(bone => {
          // Check for collision
          if (bone.y > 80 && bone.y < 90 && Math.abs(bone.x - playerPosition) < 10) {
            setScore(s => s + 1)
            setLastCatch({ x: bone.x, y: bone.y, time: Date.now() })
            return false // Remove caught bone
          }
          return bone.y < 100 // Remove bones that fall off screen
        })

        return newBones
      })
    }, 16)

    return () => clearInterval(gameLoop)
  }, [playerPosition])

  return (
    <div 
      className="relative h-full w-full bg-black touch-none select-none"
      onTouchMove={handleTouchMove}
    >
      <div className="absolute top-4 left-4 text-3xl font-bold">Score: {score}</div>
      
      {/* Mobile Controls Hint */}
      <div className="absolute top-4 right-4 text-sm opacity-50 md:hidden">
        Slide finger to move
      </div>
      
      {/* Score Animation */}
      {lastCatch && Date.now() - lastCatch.time < 500 && (
        <div 
          className="absolute text-2xl font-bold text-yellow-400 animate-score-pop"
          style={{ 
            left: `${lastCatch.x}%`, 
            top: `${lastCatch.y}%`,
          }}
        >
          +1
        </div>
      )}
      
      {/* Player */}
      <div 
        className="absolute bottom-0 w-20 h-20 transition-all duration-75 ease-out"
        style={{ left: `${playerPosition}%`, transform: 'translateX(-50%)' }}
      >
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Untitled.jpg-6lZ0ZA6GXYDGq7o0DzNWqK8uBFhGRs.jpeg"
          alt="Player"
          fill
          className="object-contain"
        />
      </div>

      {/* Falling Bones */}
      {bones.map(bone => (
        <div
          key={bone.id}
          className="absolute w-10 h-10 text-3xl animate-bone-fall"
          style={{ 
            left: `${bone.x}%`, 
            top: `${bone.y}%`,
            transform: 'translateX(-50%)'
          }}
        >
          🦴
        </div>
      ))}
    </div>
  )
}
