"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ShoppingCart } from "lucide-react"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { useCart } from "@/components/cart/cart-context"

export function ShopHeader() {
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()
  const { itemCount } = useCart()

  const isHomePage = pathname === "/"

  const shouldUseTransparentHeader = isHomePage && !isScrolled

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
        shouldUseTransparentHeader
          ? "bg-transparent border-b border-white/10"
          : "bg-background/95 backdrop-blur-sm border-b"
      }`}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <span
            className={`text-3xl font-hero transition-colors ${shouldUseTransparentHeader ? "text-white" : "text-primary"}`}
          >
            mernin'
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/#products"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              shouldUseTransparentHeader ? "text-white hover:text-white/80" : "text-foreground"
            }`}
          >
            Shop
          </Link>
          <Link
            href="/instant-processing"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              shouldUseTransparentHeader ? "text-white hover:text-white/80" : "text-foreground"
            }`}
          >
            For Roasters
          </Link>
          <Link
            href="/#about"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              shouldUseTransparentHeader ? "text-white hover:text-white/80" : "text-foreground"
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
            className={`relative ${shouldUseTransparentHeader ? "text-white hover:text-white hover:bg-white/10" : ""}`}
          >
            <Link href="/cart">
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {itemCount}
                </span>
              )}
              <span className="sr-only">Cart ({itemCount} items)</span>
            </Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            className={shouldUseTransparentHeader ? "text-white hover:text-white hover:bg-white/10" : ""}
          >
            <Link href="/auth/login">Login</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
