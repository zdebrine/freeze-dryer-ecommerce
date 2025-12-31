import { defineField, defineType } from "sanity"

export default defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  fields: [
    defineField({
      name: "siteName",
      title: "Site Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "siteDescription",
      title: "Site Description",
      type: "text",
    }),
    defineField({
      name: "favicon",
      title: "Favicon",
      type: "image",
      description: "Upload a square image (32x32 or 64x64 recommended) for the site favicon",
      options: {
        hotspot: false,
      },
    }),
    defineField({
      name: "appleTouchIcon",
      title: "Apple Touch Icon",
      type: "image",
      description: "Upload a square image (180x180 recommended) for Apple devices",
      options: {
        hotspot: false,
      },
    }),
  ],
  preview: {
    prepare() {
      return {
        title: "Site Settings",
      }
    },
  },
})
