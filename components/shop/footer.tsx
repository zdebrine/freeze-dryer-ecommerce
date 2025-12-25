import Link from "next/link"
import { Package } from "lucide-react"

export function ShopFooter() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-4xl font-hero text-primary">mernin'</span>
            </div>
            <p className="text-sm text-muted-foreground">Premium instant coffee, freeze-dried to perfection.</p>
          </div>
          <div>
            <h4 className="mb-4 font-semibold">Shop</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/#products" className="text-muted-foreground hover:text-foreground transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/#products" className="text-muted-foreground hover:text-foreground transition-colors">
                  Best Sellers
                </Link>
              </li>
              <li>
                <Link href="/#products" className="text-muted-foreground hover:text-foreground transition-colors">
                  New Arrivals
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 font-semibold">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/instant-processing"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  For Roasters
                </Link>
              </li>
              <li>
                <Link href="/#about" className="text-muted-foreground hover:text-foreground transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/auth/login" className="text-muted-foreground hover:text-foreground transition-colors">
                  Portal Login
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 font-semibold">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  Returns
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 mernin'. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
