import { defineField, defineType } from "sanity"

export default defineType({
  name: "landingPage",
  title: "Landing Page",
  type: "document",
  fields: [
    // HEADER
    defineField({
      name: "header",
      title: "Header",
      type: "object",
      fields: [
        defineField({
          name: "logoText",
          title: "Logo Text",
          type: "string",
          initialValue: "mernin'",
        }),
        defineField({
          name: "navLinks",
          title: "Navigation Links",
          type: "array",
          of: [{ type: "navLink" }],
          initialValue: [
            { label: "Shop", href: "/#products" },
            { label: "For Roasters", href: "/instant-processing" },
            { label: "About", href: "/#about" },
          ],
          validation: (r) => r.min(0).max(10),
        }),
        defineField({
          name: "loginLabel",
          title: "Login Button Label",
          type: "string",
          initialValue: "Login",
        }),
      ],
    }),

    // HERO
    defineField({
      name: "hero",
      title: "Hero",
      type: "object",
      fields: [
        defineField({
          name: "backgroundType",
          title: "Background Type",
          type: "string",
          initialValue: "video",
          options: { list: ["video", "image"] },
        }),

        // Video sources (either URL or uploaded asset)
        defineField({
          name: "videoMp4Url",
          title: "MP4 URL",
          type: "url",
          hidden: ({ parent }) => parent?.backgroundType !== "video",
        }),
        defineField({
          name: "videoWebmUrl",
          title: "WebM URL",
          type: "url",
          hidden: ({ parent }) => parent?.backgroundType !== "video",
        }),
        defineField({
          name: "videoMp4File",
          title: "MP4 File",
          type: "file",
          options: { accept: "video/mp4" },
          hidden: ({ parent }) => parent?.backgroundType !== "video",
        }),
        defineField({
          name: "videoWebmFile",
          title: "WebM File",
          type: "file",
          options: { accept: "video/webm" },
          hidden: ({ parent }) => parent?.backgroundType !== "video",
        }),
        defineField({
          name: "posterImage",
          title: "Poster Image",
          type: "image",
          options: { hotspot: true },
          hidden: ({ parent }) => parent?.backgroundType !== "video",
        }),

        // Background image
        defineField({
          name: "backgroundImage",
          title: "Background Image",
          type: "image",
          options: { hotspot: true },
          hidden: ({ parent }) => parent?.backgroundType !== "image",
        }),

        // Overlay (keep opacity, but no color controls; assume black in CSS)
        defineField({
          name: "overlayOpacity",
          title: "Overlay Opacity",
          type: "number",
          initialValue: 0.6,
          validation: (r) => r.min(0).max(1),
        }),

        // Headline can be text or an image
        defineField({
          name: "headlineMode",
          title: "Headline Mode",
          type: "string",
          initialValue: "text",
          options: { list: ["text", "image"] },
        }),
        defineField({
          name: "headline",
          title: "Headline Text",
          type: "string",
          hidden: ({ parent }) => parent?.headlineMode !== "text",
        }),
        defineField({
          name: "headlineImage",
          title: "Headline Image",
          type: "image",
          options: { hotspot: true },
          hidden: ({ parent }) => parent?.headlineMode !== "image",
        }),

        defineField({
          name: "subheadline",
          title: "Subheadline",
          type: "text",
        }),

        defineField({
          name: "ctas",
          title: "CTAs",
          type: "array",
          of: [{ type: "cta" }],
          initialValue: [
            { label: "Shop Coffee", href: "/#products", variant: "primary" },
            { label: "For Roasters", href: "/instant-processing", variant: "outline" },
          ],
          validation: (r) => r.min(0).max(4),
        }),
       
      ],
    }),

    // PRODUCTS SECTION
    defineField({
      name: "productsSection",
      title: "Products Section",
      type: "object",
      fields: [
        defineField({ name: "anchorId", title: "Anchor ID", type: "string", initialValue: "products" }),
        defineField({ name: "title", title: "Title", type: "string", initialValue: "Our Coffee" }),
        defineField({ name: "collection", title: "Collection Handle", type: "string", initialValue: "all" }),
        defineField({
          name: "subtitle",
          title: "Subtitle",
          type: "string",
          initialValue: "Freeze-dried perfection in every packet",
        }),
        defineField({
          name: "limit",
          title: "Number of products to show",
          type: "number",
          initialValue: 8,
          validation: (r) => r.min(1).max(24),
        }),
      ],
    }),

    // PRODUCT OF THE MONTH
    defineField({
      name: "productOfTheMonth",
      title: "Product of the Month",
      type: "object",
      fields: [
        defineField({ name: "enabled", title: "Enabled", type: "boolean", initialValue: true }),
        defineField({ name: "badgeText", title: "Badge Text", type: "string", initialValue: "Featured" }),
        defineField({ name: "title", title: "Section Title", type: "string", initialValue: "Product of the Month" }),
        defineField({
          name: "productHandle",
          title: "Shopify Product Handle (optional)",
          type: "string",
          description: "If blank, falls back to the first product returned.",
        }),
        defineField({
          name: "descriptionOverride",
          title: "Description Override (optional)",
          type: "text",
          description: "If blank, uses Shopify product description.",
        }),
        defineField({ name: "buttonText", title: "Button Text", type: "string", initialValue: "Shop Now" }),
      ],
    }),

    // TESTIMONIALS
    defineField({
      name: "testimonialsSection",
      title: "Testimonials",
      type: "object",
      fields: [
        defineField({ name: "enabled", title: "Enabled", type: "boolean", initialValue: true }),
        defineField({ name: "title", title: "Title", type: "string", initialValue: "What Our Customers Say" }),
        defineField({
          name: "subtitle",
          title: "Subtitle",
          type: "string",
          initialValue: "Don’t just take our word for it",
        }),
        defineField({
          name: "testimonials",
          title: "Testimonials",
          type: "array",
          of: [{ type: "testimonial" }],
          validation: (r) => r.min(0).max(24),
        }),
      ],
    }),

    //CTA BOX

    defineField({
      name: "ctaBox",
      title: "CTA Box",
      type: "ctaBox",
    }),

    // FOOTER
    defineField({
      name: "footer",
      title: "Footer",
      type: "object",
      fields: [
        defineField({ name: "logoText", title: "Logo Text", type: "string", initialValue: "mernin'" }),
        defineField({
          name: "tagline",
          title: "Tagline",
          type: "string",
          initialValue: "Premium instant coffee, freeze-dried to perfection.",
        }),

        defineField({
          name: "columns",
          title: "Footer Columns",
          type: "array",
          of: [
            {
              type: "object",
              name: "footerColumn",
              fields: [
                defineField({ name: "title", title: "Title", type: "string", validation: (r) => r.required() }),
                defineField({
                  name: "links",
                  title: "Links",
                  type: "array",
                  of: [{ type: "navLink" }],
                  validation: (r) => r.min(0).max(12),
                }),
              ],
              preview: { select: { title: "title" } },
            },
          ],
          validation: (r) => r.min(0).max(6),
        }),

        defineField({
          name: "copyrightText",
          title: "Copyright Text",
          type: "string",
          initialValue: "© 2025 mernin'. All rights reserved.",
        }),
      ],
    }),
  ],
  preview: {
    prepare() {
      return { title: "Landing Page" }
    },
  },
})
