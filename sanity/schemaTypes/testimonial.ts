import { defineField, defineType } from "sanity"

export default defineType({
  name: "testimonial",
  title: "Testimonial",
  type: "object",
  fields: [
    defineField({ name: "name", type: "string", validation: (r) => r.required() }),
    defineField({ name: "role", type: "string" }),
    defineField({ name: "content", type: "text", validation: (r) => r.required() }),
    defineField({
      name: "rating",
      type: "number",
      initialValue: 5,
      validation: (r) => r.min(1).max(5),
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "role" },
  },
})
