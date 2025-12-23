// sanity/schemas/featuredProducts.ts
import { defineField, defineType } from 'sanity'

export const featuredProducts = defineType({
    name: 'featuredProducts',
    title: 'Featured Products',
    type: 'document',
    fields: [
        defineField({ name: 'title', type: 'string' }),
        defineField({
            name: 'productHandles',
            type: 'array',
            of: [{ type: 'string' }],
            description: 'Shopify product handles to feature',
        }),
    ],
})
