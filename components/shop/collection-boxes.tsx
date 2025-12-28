import Image from "next/image"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Carousel } from "@/components/shop/carousel"

type CollectionBox = {
  title: string
  collectionHandle: string
  imageUrl?: string
}

type CollectionBoxesProps = {
  title?: string
  collections: CollectionBox[]
  visibleItems?: number
}

export function CollectionBoxes({ title, collections, visibleItems = 4 }: CollectionBoxesProps) {
  return (
    <section className="border-t bg-background px-4 py-8 md:px-8 md:py-20">
      <div className="container mx-auto max-w-7xl">
        {title && (
          <h2 className="mb-6 text-2xl font-bold font-calsans uppercase md:mb-8 md:text-4xl">{title}</h2>
        )}

        <Carousel visibleItems={visibleItems} mobileVisibleItems={2} gap={16}>
          {collections.map((collection) => (
            <Link
              key={collection.collectionHandle}
              href={`/shop/collection/${collection.collectionHandle}`}
              className="group block"
            >
              <Card className="overflow-hidden border-0 bg-muted/15 transition-all hover:bg-muted/25 hover:shadow-lg">
                <div className="relative aspect-square">
                  {collection.imageUrl ? (
                    <Image
                      src={collection.imageUrl || "/placeholder.svg"}
                      alt={collection.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-muted/50">
                      <span className="text-4xl font-bold text-muted-foreground/20">{collection.title.charAt(0)}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/5 " />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-base font-bold tracking-wide font-calsans uppercase text-center md:text-lg">{collection.title}</h3>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </Carousel>
      </div>
    </section>
  )
}
