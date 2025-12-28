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
    <section className="border-t bg-background px-4 py-10 md:py-20">
      <div className="container mx-auto max-w-7xl">
        {title && <h2 className="mb-8 text-3xl font-bold font-calsans uppercase underline md:text-4xl">{title}</h2>}

        <Carousel visibleItems={visibleItems} gap={16}>
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
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-lg font-bold text-white">{collection.title}</h3>
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
