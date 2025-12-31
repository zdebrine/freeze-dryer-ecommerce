import { defineField, defineType } from "sanity"

export default defineType({
  name: "ctaBox",
  title: "CTA Box",
  type: "object",
  fields: [
    defineField({
      name: "ctaText",
      title: "Headline",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "ctaSubText",
      title: "Subtext",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "ctaImage",
      title: "Image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "ctaImageAlt",
      title: "Image Alt Text",
      type: "string",
      description: "Used for accessibility and SEO",
    }),
    defineField({
      name: "ctaButtonLabel",
      title: "Button Label",
      type: "string",
      initialValue: "Shop the collection",
    }),
    defineField({
      name: "ctaLink",
      title: "Button Link",
      type: "string",
      description: "Internal path like /#products or /b2b, or full URL",
      validation: (r) => r.required(),
    }),
  ],
  preview: {
    select: {
      title: "ctaText",
      media: "ctaImage",
      subtitle: "ctaLink",
    },
    prepare({ title, media, subtitle }) {
      return {
        title: title || "CTA Box",
        media,
        subtitle,
      }
    },
  },
})
