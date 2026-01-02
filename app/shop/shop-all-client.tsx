"use client"

import { useEffect, useMemo, useRef, useState, useTransition, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ProductGrid } from "@/components/shop/product-grid"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { SlidersHorizontal, Search, X } from "lucide-react"
import type { ShopifyProduct } from "@/lib/shopify/storefront"

type ShopAllClientProps = {
  initialProducts: ShopifyProduct[]
  initialHasNextPage: boolean
  initialEndCursor: string | null
  filters: {
    productTypes: string[]
    vendors: string[]
    priceRange: { min: number; max: number }
  }
  searchParams: {
    search?: string
    type?: string
    vendor?: string
    minPrice?: string
    maxPrice?: string
    sort?: string
  }
}

export function ShopAllClient({
  initialProducts,
  initialHasNextPage,
  initialEndCursor,
  filters,
  searchParams,
}: ShopAllClientProps) {
  const router = useRouter()
  const urlParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // URL-driven UI state
  const [searchQuery, setSearchQuery] = useState(searchParams.search || "")
  const [selectedType, setSelectedType] = useState(searchParams.type || "All types")
  const [selectedVendor, setSelectedVendor] = useState(searchParams.vendor || "All brands")
  const [priceRange, setPriceRange] = useState([
    Number.parseFloat(searchParams.minPrice || String(filters.priceRange.min)),
    Number.parseFloat(searchParams.maxPrice || String(filters.priceRange.max)),
  ])
  const [sortBy, setSortBy] = useState(searchParams.sort || "featured")

  // The actual product list we render (grows with infinite scroll)
  const [products, setProducts] = useState<ShopifyProduct[]>(initialProducts)
  const [hasNextPage, setHasNextPage] = useState(initialHasNextPage)
  const [endCursor, setEndCursor] = useState<string | null>(initialEndCursor)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  // When the server sends new initial results (filters changed), reset the list
  useEffect(() => {
    setProducts(initialProducts)
    setHasNextPage(initialHasNextPage)
    setEndCursor(initialEndCursor)
  }, [initialProducts, initialHasNextPage, initialEndCursor])

  // Keep UI controls in sync after navigation
  useEffect(() => {
    setSearchQuery(searchParams.search || "")
    setSelectedType(searchParams.type || "All types")
    setSelectedVendor(searchParams.vendor || "All brands")
    setPriceRange([
      Number.parseFloat(searchParams.minPrice || String(filters.priceRange.min)),
      Number.parseFloat(searchParams.maxPrice || String(filters.priceRange.max)),
    ])
    setSortBy(searchParams.sort || "featured")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.search, searchParams.type, searchParams.vendor, searchParams.minPrice, searchParams.maxPrice, searchParams.sort])

  const activeFilterCount =
    (searchQuery ? 1 : 0) +
    (selectedType !== "All types" ? 1 : 0) +
    (selectedVendor !== "All brands" ? 1 : 0) +
    (priceRange[0] > filters.priceRange.min || priceRange[1] < filters.priceRange.max ? 1 : 0) +
    (sortBy !== "featured" ? 1 : 0)

  const updateURL = () => {
    const newParams = new URLSearchParams()

    if (searchQuery) newParams.set("search", searchQuery)
    if (selectedType !== "All types") newParams.set("type", selectedType)
    if (selectedVendor !== "All brands") newParams.set("vendor", selectedVendor)
    if (priceRange[0] > filters.priceRange.min) newParams.set("minPrice", priceRange[0].toString())
    if (priceRange[1] < filters.priceRange.max) newParams.set("maxPrice", priceRange[1].toString())
    if (sortBy !== "featured") newParams.set("sort", sortBy)

    const queryString = newParams.toString()
    startTransition(() => {
      router.push(queryString ? `/shop?${queryString}` : "/shop", { scroll: false })
    })
    setIsFilterOpen(false)
  }

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedType("All types")
    setSelectedVendor("All brands")
    setPriceRange([filters.priceRange.min, filters.priceRange.max])
    setSortBy("featured")
    startTransition(() => {
      router.push("/shop", { scroll: false })
    })
  }

  const currentQueryString = useMemo(() => urlParams.toString(), [urlParams])

  const loadMore = useCallback(async () => {
    if (!hasNextPage || !endCursor || isLoadingMore) return
    setIsLoadingMore(true)

    try {
      const sp = new URLSearchParams(currentQueryString)
      sp.set("cursor", endCursor)
      sp.set("limit", "24")

      const res = await fetch(`/api/shop/products?${sp.toString()}`)
      if (!res.ok) throw new Error(`Failed to load more: ${res.status}`)

      const data: {
        products: ShopifyProduct[]
        hasNextPage: boolean
        endCursor: string | null
      } = await res.json()

      setProducts((prev) => [...prev, ...(data.products || [])])
      setHasNextPage(Boolean(data.hasNextPage))
      setEndCursor(data.endCursor)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoadingMore(false)
    }
  }, [hasNextPage, endCursor, isLoadingMore, currentQueryString])

  // Infinite scroll via IntersectionObserver
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore()
      },
      { rootMargin: "800px" },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [loadMore])

  return (
    <>
      {/* Page Header */}
      <section className="border-t bg-background px-4 pt-30 pb-0 md:pt-40 md:pb-12">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-8 text-center md:mb-0">
            <h1 className="font-calsans text-5xl font-extrabold uppercase md:text-8xl">Shop All</h1>
          </div>
        </div>
      </section>

      <div className="container mx-auto max-w-7xl px-4 py-8">
        {/* Filter Bar */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1 md:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") updateURL()
              }}
              className="pl-9"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="title-asc">Name: A to Z</SelectItem>
                <SelectItem value="title-desc">Name: Z to A</SelectItem>
              </SelectContent>
            </Select>

            {/* Mobile Filters */}
            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="default" className="gap-2 bg-transparent">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                      {activeFilterCount}
                    </span>
                  )}
                </Button>
              </SheetTrigger>

              <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto px-8">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>

                <div className="mt-6 space-y-6">
                  {filters.productTypes.length > 0 && (
                    <div className="space-y-2">
                      <Label>Product Type</Label>
                      <Select value={selectedType} onValueChange={setSelectedType}>
                        <SelectTrigger>
                          <SelectValue placeholder="All types" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="All types">All types</SelectItem>
                          {filters.productTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {filters.vendors.length > 0 && (
                    <div className="space-y-2">
                      <Label>Brand</Label>
                      <Select value={selectedVendor} onValueChange={setSelectedVendor}>
                        <SelectTrigger>
                          <SelectValue placeholder="All brands" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="All brands">All brands</SelectItem>
                          {filters.vendors.map((vendor) => (
                            <SelectItem key={vendor} value={vendor}>
                              {vendor}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-4">
                    <Label>
                      Price Range: ${priceRange[0].toFixed(2)} - ${priceRange[1].toFixed(2)}
                    </Label>
                    <Slider
                      min={filters.priceRange.min}
                      max={filters.priceRange.max}
                      step={1}
                      value={priceRange}
                      onValueChange={setPriceRange}
                      className="w-full"
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button onClick={updateURL} className="flex-1">
                      Apply Filters
                    </Button>
                    {activeFilterCount > 0 && (
                      <Button variant="outline" onClick={clearFilters}>
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            {/* Desktop Apply */}
            <Button onClick={updateURL} className="hidden md:flex">
              Apply
            </Button>

            {activeFilterCount > 0 && (
              <Button variant="outline" onClick={clearFilters} className="hidden md:flex bg-transparent">
                Clear All
              </Button>
            )}
          </div>
        </div>

        {/* Products */}
        {isPending ? (
          <div className="py-12 text-center text-muted-foreground">Loading...</div>
        ) : products.length > 0 ? (
          <>
            <ProductGrid products={products} />

            {/* Infinite scroll sentinel */}
            <div ref={sentinelRef} className="h-12" />

            <div className="py-8 text-center text-sm text-muted-foreground">
              {isLoadingMore
                ? "Loading more..."
                : hasNextPage
                  ? "Scroll to load more"
                  : "That’s everything."}
            </div>
          </>
        ) : (
          <div className="py-12 text-center">
            <p className="text-lg text-muted-foreground">No products found matching your filters.</p>
            <Button onClick={clearFilters} variant="outline" className="mt-4 bg-transparent">
              Clear filters
            </Button>
          </div>
        )}
      </div>
    </>
  )
}
