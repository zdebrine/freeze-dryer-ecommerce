import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info } from "lucide-react"
import Link from "next/link"

export function ShopifySetupNotice() {
  return (
    <section className="border-t bg-muted/30 px-4 py-12">
      <div className="container mx-auto max-w-4xl">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Shopify Integration Required</AlertTitle>
          <AlertDescription className="mt-2 space-y-2">
            <p>
              To display products from your Shopify store, you need to configure the Shopify Storefront API access
              token.
            </p>
            <div className="mt-4">
              <p className="font-semibold mb-2">Quick Setup:</p>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Go to Shopify Admin → Settings → Apps → Develop apps</li>
                <li>Create a new app and enable Storefront API access</li>
                <li>Copy the Storefront API access token</li>
                <li>
                  Add <code className="bg-muted px-1 py-0.5 rounded text-xs">SHOPIFY_STOREFRONT_ACCESS_TOKEN</code> to
                  environment variables
                </li>
              </ol>
            </div>
            <p className="mt-4 text-sm">
              In the meantime, you can still{" "}
              <Link href="/instant-processing" className="font-medium underline">
                submit orders for instant coffee processing
              </Link>
              .
            </p>
          </AlertDescription>
        </Alert>
      </div>
    </section>
  )
}
