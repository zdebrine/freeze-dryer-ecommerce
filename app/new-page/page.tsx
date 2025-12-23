import Image from "next/image"
import Link from "next/link"
import { client } from "@/sanity/lib/client"
import { HERO_QUERY, FEATURED_PRODUCTS_QUERY } from "@/sanity/lib/queries"
import { getProduct } from "@/lib/shopify/storefront"

export const revalidate = 60

export default async function HomePage() {
  const [hero, featured] = await Promise.all([client.fetch(HERO_QUERY), client.fetch(FEATURED_PRODUCTS_QUERY)])

  const handles: string[] = featured?.productHandles ?? []
  const products = (await Promise.all(handles.map((h) => getProduct(h)))).filter(Boolean)

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      {/* HERO */}
      <section className="grid gap-8 md:grid-cols-2 md:items-center">
        <div>
          <h1 className="text-4xl font-bold">{hero?.title}</h1>
          <p className="mt-4 text-muted-foreground">{hero?.subtitle}</p>

          {hero?.buttonText && hero?.buttonLink && (
            <Link className="mt-6 inline-flex rounded-md bg-black px-4 py-2 text-white" href={hero.buttonLink}>
              {hero.buttonText}
            </Link>
          )}
        </div>

        {hero?.imageUrl && (
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl">
            <Image
              src={hero.imageUrl || "/placeholder.svg"}
              alt={hero?.title ?? "Hero image"}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="mt-14">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-2xl font-semibold">{featured?.title ?? "Featured"}</h2>
          <Link className="text-sm underline" href="/products">
            View all
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p: any) => (
            <Link key={p.id} href={`/products/${p.handle}`} className="rounded-xl border p-4 hover:shadow-sm">
              <div className="relative aspect-square w-full overflow-hidden rounded-lg">
                <Image
                  src={p.featuredImage?.url ?? hero.imageUrl}
                  alt={p.featuredImage?.altText ?? p.title}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="mt-4">
                <div className="font-medium">{p.title}</div>
                {p.price && (
                  <div className="text-sm text-muted-foreground">
                    {Number(p.price.amount).toFixed(2)} {p.price.currencyCode}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
