"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Package, ShoppingCart, User, LogOut, Plus } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

const navigation = [
  { name: "My Orders", href: "/client", icon: ShoppingCart },
  { name: "Profile", href: "/client/profile", icon: User },
]

export function ClientNav() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/client" className="flex items-center gap-2">
          <Package className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">CoffeeDry</span>
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-1">
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
                {item.name}
              </Link>
            )
          })}
          <Link href="/client/orders/request">
            <Button size="sm" className="ml-2">
              <Plus className="mr-2 h-4 w-4" />
              Request Order
            </Button>
          </Link>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="ml-2">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </nav>
  )
}
