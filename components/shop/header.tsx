"use client"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import Link from "next/link"
import { ShoppingCart, Menu, LogIn } from "lucide-react"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { useCart } from "@/components/cart/cart-context"
import { CartItems } from "@/components/cart/cart-items"

type NavLink = {
  label: string
  href: string
}

type HeaderConfig = {
  logoText?: string
  navLinks?: NavLink[]
  loginLabel?: string
}

function isExternalUrl(href: string) {
  return /^https?:\/\//i.test(href)
}

export function ShopHeader({ config }: { config?: HeaderConfig }) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isNavOpen, setIsNavOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const pathname = usePathname()
  const { itemCount, cart } = useCart()

  useEffect(() => {
    const checkScroll = () => {
      setIsScrolled(window.scrollY > 150)
    }

    // Set initial state based on current scroll position
    checkScroll()

    window.addEventListener("scroll", checkScroll)
    return () => window.removeEventListener("scroll", checkScroll)
  }, [])

  useEffect(() => {
    const handleOpenCart = () => {
      setIsCartOpen(true)
    }

    window.addEventListener("openCart", handleOpenCart)
    return () => window.removeEventListener("openCart", handleOpenCart)
  }, [])

  const isHomePage = pathname === "/" || pathname === "/b2b"
  const shouldUseTransparentHeader = isHomePage && !isScrolled

  const logoText = config?.logoText ?? "mernin'"
  const navLinks: NavLink[] = config?.navLinks?.length
    ? config.navLinks
    : [
        { label: "Shop", href: "/#products" },
        { label: "For Roasters", href: "/b2b" },
        { label: "About", href: "/#about" },
      ]
  const loginLabel = config?.loginLabel ?? "Login"

  const textColorClass = shouldUseTransparentHeader ? "text-secondary" : "text-secondary"
  const hoverColorClass = shouldUseTransparentHeader ? "hover:text-primary/80" : "hover:text-secondary"

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        shouldUseTransparentHeader ? "bg-transparent border-secondary/10" : "bg-primary/95 backdrop-blur-sm"
      }`}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <nav className="hidden lg:flex items-center gap-6 flex-1">
          {navLinks.map((l, idx) => {
            const linkProps = isExternalUrl(l.href)
              ? { href: l.href, target: "_blank", rel: "noreferrer" }
              : { href: l.href }

            return (
              <Link
                key={`${l.label}-${l.href}-${idx}`}
                {...(linkProps as any)}
                className={`text-sm font-bold font-calsans uppercase tracking-wide transition-colors ${textColorClass} ${hoverColorClass}`}
              >
                {l.label}
              </Link>
            )
          })}
        </nav>

        <div className="lg:hidden">
          <Sheet open={isNavOpen} onOpenChange={setIsNavOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className={textColorClass}>
                <Menu className="h-6 w-6" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-4 mt-8 ml-4">
                {navLinks.map((l, idx) => {
                  const linkProps = isExternalUrl(l.href)
                    ? { href: l.href, target: "_blank", rel: "noreferrer" }
                    : { href: l.href }

                  return (
                    <Link
                      key={`mobile-${l.label}-${l.href}-${idx}`}
                      {...(linkProps as any)}
                      className="text-lg font-bold transition-colors hover:text-primary"
                      onClick={() => setIsNavOpen(false)}
                    >
                      {l.label}
                    </Link>
                  )
                })}
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        <Link href="/" className="flex items-center gap-2 lg:flex-1 lg:justify-center">
          <span
            className={`text-4xl font-hero transition-colors ${
              shouldUseTransparentHeader ? "text-secondary" : "text-secondary"
            }`}
          >
            {logoText}
          </span>
        </Link>

        <div className="flex items-center gap-2 lg:flex-1 lg:justify-end">
          {/* Desktop Login */}
          <Button asChild variant="ghost" size="sm" className={`hidden lg:flex ${textColorClass} ${hoverColorClass}`}>
            <Link href="/auth/login">
              <LogIn className="h-4 w-4 mr-2" />
              {loginLabel}
            </Link>
          </Button>

          {/* Desktop Cart */}
          <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={`hidden lg:flex relative ${textColorClass} ${hoverColorClass}`}
              >
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-xs font-bold text-secondary-foreground">
                    {itemCount}
                  </span>
                )}
                <span className="sr-only">Cart ({itemCount} items)</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-lg overflow-scroll">
              <SheetHeader>
                <SheetTitle>Shopping Cart</SheetTitle>
              </SheetHeader>
              <div className="mt-8">
                <CartItems />
              </div>
            </SheetContent>
          </Sheet>

          {/* Mobile Cart */}
          <div className="lg:hidden">
            <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className={`relative ${textColorClass}`}>
                  <ShoppingCart className="h-6 w-6" />
                  {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-xs font-bold text-secondary-foreground">
                      {itemCount}
                    </span>
                  )}
                  <span className="sr-only">Cart</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:max-w-lg overflow-scroll">
                <SheetHeader>
                  <SheetTitle>Shopping Cart</SheetTitle>
                </SheetHeader>
                <div className="mt-8">
                  <CartItems />
                </div>
                <div className="mt-6 pt-6 border-t">
                  <Button
                    asChild
                    variant="outline"
                    className="w-full bg-transparent"
                    onClick={() => setIsCartOpen(false)}
                  >
                    <Link href="/auth/login">
                      <LogIn className="h-4 w-4 mr-2" />
                      {loginLabel}
                    </Link>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
