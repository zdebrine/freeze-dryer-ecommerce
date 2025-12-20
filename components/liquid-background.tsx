"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"

interface LiquidBackgroundProps {
  isTransitioning?: boolean
  onTransitionComplete?: () => void
}

export function LiquidBackground({ isTransitioning = false, onTransitionComplete }: LiquidBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d", { alpha: false })
    if (!ctx) return

    // Set canvas size
    const setCanvasSize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    setCanvasSize()
    window.addEventListener("resize", setCanvasSize)

    let time = 0
    let animationId: number

    const drawLiquid = () => {
      const { width, height } = canvas
      time += 0.005

      // Create gradient
      const gradient = ctx.createLinearGradient(0, 0, width, height)

      if (isTransitioning) {
        // Fill with brown tones
        ctx.fillStyle = "#2d1810"
        ctx.fillRect(0, 0, width, height)

        // Add grain effect
        const imageData = ctx.getImageData(0, 0, width, height)
        const data = imageData.data
        const grainIntensity = Math.min(time * 50, 255)

        for (let i = 0; i < data.length; i += 4) {
          const noise = (Math.random() - 0.5) * grainIntensity
          data[i] += noise // red
          data[i + 1] += noise // green
          data[i + 2] += noise // blue
        }

        ctx.putImageData(imageData, 0, 0)

        if (time > 0.5) {
          onTransitionComplete?.()
          return
        }
      } else {
        gradient.addColorStop(0, "#1a0f0a")
        gradient.addColorStop(0.5, "#3d2314")
        gradient.addColorStop(1, "#1a0f0a")
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, width, height)

        // Draw flowing liquid waves
        ctx.globalCompositeOperation = "screen"

        for (let i = 0; i < 3; i++) {
          ctx.beginPath()
          const offsetY = height * 0.3 * i

          for (let x = 0; x < width; x += 2) {
            const waveInfluence = mousePos.y * 0.3
            const y =
              height / 2 +
              offsetY +
              Math.sin(x * 0.005 + time + i) * 30 * (1 + waveInfluence) +
              Math.cos(x * 0.003 + time * 1.5 + i) * 20 * (1 + waveInfluence)

            if (x === 0) {
              ctx.moveTo(x, y)
            } else {
              ctx.lineTo(x, y)
            }
          }

          ctx.lineTo(width, height)
          ctx.lineTo(0, height)
          ctx.closePath()

          const alpha = 0.05 + i * 0.02 + mousePos.x * 0.05
          ctx.fillStyle = `rgba(139, 69, 19, ${alpha})`
          ctx.fill()
        }

        ctx.globalCompositeOperation = "source-over"
      }

      animationId = requestAnimationFrame(drawLiquid)
    }

    drawLiquid()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener("resize", setCanvasSize)
    }
  }, [isTransitioning, mousePos, onTransitionComplete])

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isTransitioning) return
    const x = e.clientX / window.innerWidth
    const y = e.clientY / window.innerHeight
    setMousePos({ x, y })
  }

  return (
    <canvas
      ref={canvasRef}
      onMouseMove={handleMouseMove}
      className="fixed inset-0 -z-10"
      style={{ willChange: "contents" }}
    />
  )
}
