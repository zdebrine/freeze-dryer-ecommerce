"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { ShoppingCart, Loader2 } from "lucide-react"

export function CreateShopifyCheckoutButton({ orderId }: { orderId: string }) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleCreateCheckout = async () => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/shopify/create-draft-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create checkout")
      }

      const data = await response.json()

      toast({
        title: "Checkout created",
        description: "The client has been emailed the payment link.",
      })

      // Optionally open the checkout URL
      if (data.checkoutUrl) {
        window.open(data.checkoutUrl, "_blank")
      }

      router.refresh()
    } catch (error) {
      console.error("[v0] Error creating checkout:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create checkout. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handleCreateCheckout} disabled={isLoading} size="lg">
      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShoppingCart className="mr-2 h-4 w-4" />}
      Create Shopify Checkout
    </Button>
  )
}
