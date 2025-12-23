import { defineField, defineType } from "sanity"

export const hero = defineType({
  name: "hero",
  title: "Hero",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string" }),
    defineField({ name: "subtitle", type: "text" }),
    defineField({
      name: "buttonText",
      type: "string",
    }),
    defineField({
      name: "buttonLink",
      type: "string",
      description: "Example: /products or https://...",
    }),
    defineField({
      name: "image",
      type: "image",
      options: { hotspot: true },
    }),
  ],
})
