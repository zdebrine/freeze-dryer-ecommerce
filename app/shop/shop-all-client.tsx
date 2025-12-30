"use client"

import { useState, useTransition, useEffect, useMemo } from "react"
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
    page?: string
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
  const params = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const [searchQuery, setSearchQuery] = useState(searchParams.search || "")
  const [selectedType, setSelectedType] = useState(searchParams.type || "All types")
  const [selectedVendor, setSelectedVendor] = useState(searchParams.vendor || "All brands")
  const [priceRange, setPriceRange] = useState([
    Number.parseFloat(searchParams.minPrice || String(filters.priceRange.min)),
    Number.parseFloat(searchParams.maxPrice || String(filters.priceRange.max)),
  ])
  const [sortBy, setSortBy] = useState(searchParams.sort || "featured")

  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const filteredProducts = useMemo(() => {
    return initialProducts.filter((product) => {
      // Search filter
      if (debouncedSearch && !product.title.toLowerCase().includes(debouncedSearch.toLowerCase())) {
        return false
      }

      // Type filter
      if (selectedType !== "All types" && (product as any).productType !== selectedType) {
        return false
      }

      // Vendor filter
      if (selectedVendor !== "All brands" && (product as any).vendor !== selectedVendor) {
        return false
      }

      // Price filter
      const price = Number.parseFloat(product.priceRange.minVariantPrice.amount)
      if (price < priceRange[0] || price > priceRange[1]) {
        return false
      }

      return true
    })
  }, [initialProducts, debouncedSearch, selectedType, selectedVendor, priceRange])

  const sortedProducts = useMemo(() => {
    const products = [...filteredProducts]
    console.log(products)

    switch (sortBy) {
      case "featured":
        return [...products].sort(
          (a, b) =>
            Number(b.tags ?.includes("Featured")) - Number(a.tags ?.includes("Featured"))
        )
      case "price-asc":
        return products.sort(
          (a, b) =>
            Number.parseFloat(a.priceRange.minVariantPrice.amount) -
            Number.parseFloat(b.priceRange.minVariantPrice.amount),
        )
      case "price-desc":
        return products.sort(
          (a, b) =>
            Number.parseFloat(b.priceRange.minVariantPrice.amount) -
            Number.parseFloat(a.priceRange.minVariantPrice.amount),
        )
      case "title-asc":
        return products.sort((a, b) => a.title.localeCompare(b.title))
      case "title-desc":
        return products.sort((a, b) => b.title.localeCompare(a.title))
      default:
        return products
    }
  }, [filteredProducts, sortBy])

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

  const activeFilterCount =
    (searchQuery ? 1 : 0) +
    (selectedType !== "All types" ? 1 : 0) +
    (selectedVendor !== "All brands" ? 1 : 0) +
    (priceRange[0] > filters.priceRange.min || priceRange[1] < filters.priceRange.max ? 1 : 0) +
    (sortBy !== "featured" ? 1 : 0)

  return (
    <>
      {/* Page Header */}
      <section className="border-t bg-background px-4 pt-30 pb-0 md:pt-40 md:pb-12">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-8 text-center md:mb-0">
            <h1 className="font-calsans text-5xl font-extrabold uppercase md:text-8xl">Shop All</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              {sortedProducts.length} {sortedProducts.length === 1 ? "product" : "products"}
            </p>
          </div>
        </div>
      </section>

      {/* Filters and Products */}
      <div className="container mx-auto max-w-7xl px-4 py-8">
        {/* Filter Bar */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Search */}
          <div className="relative flex-1 md:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  updateURL()
                }
              }}
              className="pl-9"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Sort */}
            <Select
              value={sortBy}
              onValueChange={(value) => {
                setSortBy(value)
              }}
            >
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
                  {/* Product Type */}
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

                  {/* Vendor */}
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

                  {/* Price Range */}
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

            {/* Desktop Apply Button */}
            <Button onClick={updateURL} className="hidden md:flex">
              Apply
            </Button>

            {/* Clear Filters */}
            {activeFilterCount > 0 && (
              <Button variant="outline" onClick={clearFilters} className="hidden md:flex bg-transparent">
                Clear All
              </Button>
            )}
          </div>
        </div>

        {/* Active Filters Display */}
        {activeFilterCount > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {searchQuery && (
              <div className="flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-sm">
                Search: {searchQuery}
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("")
                    updateURL()
                  }}
                  className="hover:text-foreground"
                  aria-label="Remove search filter"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            {selectedType !== "All types" && (
              <div className="flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-sm">
                Type: {selectedType}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedType("All types")
                    updateURL()
                  }}
                  className="hover:text-foreground"
                  aria-label="Remove type filter"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            {selectedVendor !== "All brands" && (
              <div className="flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-sm">
                Brand: {selectedVendor}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedVendor("All brands")
                    updateURL()
                  }}
                  className="hover:text-foreground"
                  aria-label="Remove brand filter"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Products Grid */}
        {isPending ? (
          <div className="py-12 text-center text-muted-foreground">Loading...</div>
        ) : sortedProducts.length > 0 ? (
          <ProductGrid products={sortedProducts} />
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
