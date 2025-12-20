"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"

interface LiquidBackgroundProps {
  isTransitioning?: boolean
  onTransitionComplete?: () => void
}

interface Ripple {
  x: number
  y: number
  radius: number
  maxRadius: number
  speed: number
  opacity: number
}

export function LiquidBackground({ isTransitioning = false, onTransitionComplete }: LiquidBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const ripplesRef = useRef<Ripple[]>([])
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
      time += 0.008

      if (isTransitioning) {
        ctx.fillStyle = "#0a0a0a"
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
        const gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width * 0.7)
        gradient.addColorStop(0, "#1a1a2e")
        gradient.addColorStop(0.5, "#0f0f1e")
        gradient.addColorStop(1, "#000000")
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, width, height)

        ripplesRef.current = ripplesRef.current.filter((ripple) => {
          ripple.radius += ripple.speed
          ripple.opacity -= 0.015

          if (ripple.opacity <= 0 || ripple.radius >= ripple.maxRadius) {
            return false
          }

          // Draw ripple waves with purple tint
          ctx.beginPath()
          ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(147, 51, 234, ${ripple.opacity * 0.6})`
          ctx.lineWidth = 2
          ctx.stroke()

          // Inner glow
          ctx.beginPath()
          ctx.arc(ripple.x, ripple.y, ripple.radius - 5, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(196, 181, 253, ${ripple.opacity * 0.3})`
          ctx.lineWidth = 1
          ctx.stroke()

          return true
        })

        ctx.globalCompositeOperation = "lighten"

        for (let i = 0; i < 4; i++) {
          ctx.beginPath()

          for (let x = 0; x < width; x += 3) {
            const distanceFromMouse = Math.sqrt(
              Math.pow((x - mousePos.x * width) / width, 2) + Math.pow((height / 2 - mousePos.y * height) / height, 2),
            )
            const mouseInfluence = Math.max(0, 1 - distanceFromMouse * 2)

            const y =
              height / 2 +
              Math.sin(x * 0.008 + time + i * 0.5) * (20 + mouseInfluence * 30) +
              Math.cos(x * 0.004 + time * 1.2 - i * 0.3) * (15 + mouseInfluence * 20) +
              Math.sin(time * 0.5 + i) * (10 + mouseInfluence * 15)

            if (x === 0) {
              ctx.moveTo(x, y)
            } else {
              ctx.lineTo(x, y)
            }
          }

          ctx.lineTo(width, height)
          ctx.lineTo(0, height)
          ctx.closePath()

          // Purple gradient waves
          const waveGradient = ctx.createLinearGradient(0, height / 2, 0, height)
          waveGradient.addColorStop(0, `rgba(147, 51, 234, ${0.03 + i * 0.02})`)
          waveGradient.addColorStop(1, `rgba(79, 70, 229, ${0.01 + i * 0.01})`)
          ctx.fillStyle = waveGradient
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

    // Create ripple at mouse position (throttled)
    if (Math.random() > 0.85) {
      ripplesRef.current.push({
        x: e.clientX,
        y: e.clientY,
        radius: 0,
        maxRadius: 150 + Math.random() * 100,
        speed: 2 + Math.random() * 2,
        opacity: 0.8,
      })

      // Limit ripples to prevent performance issues
      if (ripplesRef.current.length > 15) {
        ripplesRef.current.shift()
      }
    }
  }

  const handleClick = (e: React.MouseEvent) => {
    if (isTransitioning) return

    ripplesRef.current.push({
      x: e.clientX,
      y: e.clientY,
      radius: 0,
      maxRadius: 300,
      speed: 4,
      opacity: 1,
    })
  }

  return (
    <canvas
      ref={canvasRef}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      className="fixed inset-0 -z-10"
      style={{ willChange: "contents" }}
    />
  )
}
