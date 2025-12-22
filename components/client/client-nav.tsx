"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ShoppingCart, User, LogOut, Plus, Menu, X } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useState } from "react"

const navigation = [
  { name: "My Orders", href: "/client", icon: ShoppingCart },
  { name: "Profile", href: "/client/profile", icon: User },
]

export function ClientNav() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  return (
    <nav className="sticky top-0 z-50 border-b bg-background">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/client" className="flex items-center gap-2">
          <span className="text-2xl font-hero text-primary sm:text-3xl">mernin'</span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <item.icon className="h-4 w-4" />
                <span className="hidden lg:inline">{item.name}</span>
              </Link>
            )
          })}
          <Link href="/client/orders/request">
            <Button size="sm" className="ml-2">
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden lg:inline">Request Order</span>
              <span className="lg:hidden">Request</span>
            </Button>
          </Link>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="ml-2">
            <LogOut className="mr-2 h-4 w-4" />
            <span className="hidden lg:inline">Logout</span>
          </Button>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {isMobileMenuOpen && (
        <div className="border-t bg-background md:hidden">
          <div className="space-y-1 p-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              )
            })}
            <Link href="/client/orders/request" onClick={() => setIsMobileMenuOpen(false)}>
              <Button size="sm" className="w-full justify-start">
                <Plus className="mr-2 h-4 w-4" />
                Request Order
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="w-full justify-start">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      )}
    </nav>
  )
}
