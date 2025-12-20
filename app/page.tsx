"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Package, Users, Zap } from "lucide-react"
import { LiquidBackground } from "@/components/liquid-background"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [targetPath, setTargetPath] = useState<string>("")
  const router = useRouter()

  const handleNavigation = (path: string) => {
    setTargetPath(path)
    setIsTransitioning(true)
  }

  const handleTransitionComplete = () => {
    if (targetPath) {
      router.push(targetPath)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <LiquidBackground isTransitioning={isTransitioning} onTransitionComplete={handleTransitionComplete} />

      {/* Header */}
      <header className="border-b border-white/10 bg-transparent">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Package className="h-6 w-6 text-amber-600" />
            <span className="text-xl font-bold text-white">CoffeeDry</span>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              className="text-white hover:bg-white/10"
              onClick={() => handleNavigation("/auth/login")}
            >
              Login
            </Button>
            <Button className="bg-amber-600 hover:bg-amber-700" onClick={() => handleNavigation("/auth/signup")}>
              Sign Up
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex flex-1 items-center justify-center px-4 py-20">
        <div className="container mx-auto max-w-5xl text-center">
          <h1 className="text-balance text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
            Turn your coffee into
            <span className="text-amber-500"> instant coffee</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-white/80 sm:text-xl">
            Professional freeze-drying services with real-time tracking, seamless order management, and instant payment
            processing.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              className="min-w-40 bg-amber-600 hover:bg-amber-700"
              onClick={() => handleNavigation("/auth/signup")}
            >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="min-w-40 border-white/20 bg-transparent text-white hover:bg-white/10"
              onClick={() => handleNavigation("/auth/login")}
            >
              Login
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-white/10 bg-black/30 px-4 py-20 backdrop-blur-sm">
        <div className="container mx-auto max-w-6xl">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-600/20">
                <Package className="h-8 w-8 text-amber-500" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-white">Order Management</h3>
              <p className="text-white/70">
                Track orders from submission to completion with real-time status updates and detailed logs.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-600/20">
                <Zap className="h-8 w-8 text-amber-500" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-white">Machine Tracking</h3>
              <p className="text-white/70">
                Monitor freeze-drying equipment status, capacity, and assignment to optimize your operations.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-600/20">
                <Users className="h-8 w-8 text-amber-500" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-white">Client Portal</h3>
              <p className="text-white/70">
                Provide clients with secure access to view their orders and stay updated on progress.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-white/60">
          <p>&copy; 2025 CoffeeDry. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
