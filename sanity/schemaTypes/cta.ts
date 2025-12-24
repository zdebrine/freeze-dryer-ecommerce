import { defineField, defineType } from "sanity"

export default defineType({
  name: "cta",
  title: "CTA",
  type: "object",
  fields: [
    defineField({ name: "label", type: "string", validation: (r) => r.required() }),
    defineField({ name: "href", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "variant",
      type: "string",
      initialValue: "primary",
      options: { list: ["primary", "secondary", "outline", "ghost"] },
    }),
  ],
  preview: {
    select: { title: "label", subtitle: "href" },
  },
})
