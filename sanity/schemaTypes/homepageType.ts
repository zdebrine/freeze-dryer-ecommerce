import { defineField, defineType } from "sanity"

export const homepageType = defineType({
  name: "homepage",
  title: "Homepage Settings",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Page Title",
      type: "string",
      description: "For SEO and browser tab",
    }),
    defineField({
      name: "heroTitle",
      title: "Hero Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "heroSubtitle",
      title: "Hero Subtitle",
      type: "text",
    }),
    defineField({
      name: "productSectionTitle",
      title: "Product Section Title",
      type: "string",
      initialValue: "Our Coffee",
    }),
    defineField({
      name: "productSectionSubtitle",
      title: "Product Section Subtitle",
      type: "string",
      initialValue: "Freeze-dried perfection in every packet",
    }),
    defineField({
      name: "testimonialSectionTitle",
      title: "Testimonial Section Title",
      type: "string",
      initialValue: "What Our Customers Say",
    }),
    defineField({
      name: "testimonialSectionSubtitle",
      title: "Testimonial Section Subtitle",
      type: "string",
      initialValue: "Don't just take our word for it",
    }),
    defineField({
      name: "featuredProductHandle",
      title: "Featured Product Handle",
      type: "string",
      description: 'The Shopify product handle for the "Product of the Month"',
    }),
  ],
  preview: {
    select: {
      title: "heroTitle",
    },
  },
})
