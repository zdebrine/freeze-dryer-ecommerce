import { defineField, defineType } from "sanity"

export default defineType({
  name: "navLink",
  title: "Nav Link",
  type: "object",
  fields: [
    defineField({ name: "label", type: "string", validation: (r) => r.required() }),
    defineField({ name: "href", type: "string", validation: (r) => r.required() }),
  ],
  preview: {
    select: { title: "label", subtitle: "href" },
  },
})
