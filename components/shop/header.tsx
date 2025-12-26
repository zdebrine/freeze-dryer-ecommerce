"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ShoppingCart } from "lucide-react"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { useCart } from "@/components/cart/cart-context"

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
  const pathname = usePathname()
  const { itemCount } = useCart()

  const isHomePage = pathname === "/" || pathname === "/instant-processing"
  const shouldUseTransparentHeader = isHomePage && !isScrolled

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const logoText = config?.logoText ?? "mernin'"
  const navLinks: NavLink[] =
    config?.navLinks?.length
      ? config.navLinks
      : [
          { label: "Shop", href: "/#products" },
          { label: "For Roasters", href: "/instant-processing" },
          { label: "About", href: "/#about" },
        ]
  const loginLabel = config?.loginLabel ?? "Login"

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        shouldUseTransparentHeader
          ? "bg-transparent border-b border-secondary/10"
          : "bg-background/95 backdrop-blur-sm border-b"
      }`}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <span
            className={`text-3xl font-hero transition-colors ${
              shouldUseTransparentHeader ? "text-secondary" : "text-primary"
            }`}
          >
            {logoText}
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((l, idx) => {
            const linkProps = isExternalUrl(l.href)
              ? { href: l.href, target: "_blank", rel: "noreferrer" }
              : { href: l.href }

            return (
              <Link
                key={`${l.label}-${l.href}-${idx}`}
                {...(linkProps as any)}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  shouldUseTransparentHeader ? "text-secondary hover:text-secondary/80" : "text-foreground"
                }`}
              >
                {l.label}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-4">
          <Button
            asChild
            variant="ghost"
            size="icon"
            className={`relative ${shouldUseTransparentHeader ? "text-secondary hover:text-secondary hover:bg-secondary/10" : ""}`}
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
            className={shouldUseTransparentHeader ? "text-secondary hover:text-secondary hover:bg-secondary/10" : ""}
          >
            <Link href="/auth/login">{loginLabel}</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
