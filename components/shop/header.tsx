"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Package, ShoppingCart } from "lucide-react"
import { useState, useEffect } from "react"

export function ShopHeader() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-background/95 backdrop-blur-sm border-b" : "bg-transparent border-b border-white/10"
      }`}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          {/* <Package className={`h-6 w-6 transition-colors ${isScrolled ? "text-primary" : "text-white"}`} /> */}
          <span className={`text-3xl font-hero transition-colors ${isScrolled ? "text-primary" : "text-white"}`}>mernin'</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/#products"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isScrolled ? "" : "text-white hover:text-white/80"
            }`}
          >
            Shop
          </Link>
          <Link
            href="/instant-processing"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isScrolled ? "" : "text-white hover:text-white/80"
            }`}
          >
            For Roasters
          </Link>
          <Link
            href="/#about"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isScrolled ? "" : "text-white hover:text-white/80"
            }`}
          >
            About
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <Button
            asChild
            variant="ghost"
            size="icon"
            className={isScrolled ? "" : "text-white hover:text-white hover:bg-white/10"}
          >
            <Link href="/auth/login">
              <ShoppingCart className="h-5 w-5" />
              <span className="sr-only">Cart</span>
            </Link>
          </Button>
          <Button
            asChild
            variant={isScrolled ? "ghost" : "ghost"}
            className={isScrolled ? "" : "text-white hover:text-white hover:bg-white/10"}
          >
            <Link href="/auth/login">Login</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
