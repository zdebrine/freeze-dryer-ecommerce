"use client"

import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import type { ProductOption, ProductVariant } from "@/lib/shopify/storefront"

type VariantSelectorProps = {
  options: ProductOption[]
  variants: ProductVariant[]
  onVariantChange: (variant: ProductVariant | null) => void
}

export function VariantSelector({ options, variants, onVariantChange }: VariantSelectorProps) {
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})

  // Initialize with first available variant's options
  useEffect(() => {
    if (variants.length === 1) {
      // Auto-select if only one variant
      const variant = variants[0]
      const initialOptions: Record<string, string> = {}
      variant.selectedOptions.forEach((option) => {
        initialOptions[option.name] = option.value
      })
      setSelectedOptions(initialOptions)
      onVariantChange(variant)
    } else if (options.length > 0) {
      // Initialize with first value of each option
      const initialOptions: Record<string, string> = {}
      options.forEach((option) => {
        if (option.values.length > 0) {
          initialOptions[option.name] = option.values[0]
        }
      })
      setSelectedOptions(initialOptions)
    }
  }, [options, variants])

  // Find matching variant when options change
  useEffect(() => {
    const matchingVariant = variants.find((variant) => {
      return variant.selectedOptions.every((option) => {
        return selectedOptions[option.name] === option.value
      })
    })
    onVariantChange(matchingVariant || null)
  }, [selectedOptions, variants, onVariantChange])

  const handleOptionChange = (optionName: string, value: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [optionName]: value,
    }))
  }

  if (options.length === 0 || variants.length === 1) {
    return null // No options to select or only one variant
  }

  return (
    <div className="space-y-4">
      {options.map((option) => (
        <div key={option.id} className="space-y-2">
          <Label className="text-base font-semibold">{option.name}</Label>
          <div className="flex flex-wrap gap-2">
            {option.values.map((value) => {
              const isSelected = selectedOptions[option.name] === value

              // Check if this option combination is available
              const isAvailable = variants.some((variant) => {
                const matchesThisOption = variant.selectedOptions.some(
                  (opt) => opt.name === option.name && opt.value === value,
                )
                const matchesOtherOptions = variant.selectedOptions
                  .filter((opt) => opt.name !== option.name)
                  .every((opt) => selectedOptions[opt.name] === opt.value)
                return matchesThisOption && matchesOtherOptions && variant.availableForSale
              })

              return (
                <Button
                  key={value}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleOptionChange(option.name, value)}
                  disabled={!isAvailable}
                  className="min-w-[60px]"
                >
                  {value}
                </Button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
