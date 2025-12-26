import { defineField, defineType } from "sanity"

export default defineType({
  name: "instantProcessing",
  title: "Instant Processing Page",
  type: "document",
  fields: [
    // HERO VIDEO SECTION
    defineField({
      name: "hero",
      title: "Hero Video Section",
      type: "object",
      fields: [
        defineField({
          name: "videoMp4Url",
          title: "MP4 URL",
          type: "url",
        }),
        defineField({
          name: "videoWebmUrl",
          title: "WebM URL",
          type: "url",
        }),
        defineField({
          name: "posterImage",
          title: "Poster Image",
          type: "image",
          options: { hotspot: true },
        }),
        defineField({
          name: "overlayOpacity",
          title: "Overlay Opacity",
          type: "number",
          initialValue: 0.6,
          validation: (r) => r.min(0).max(1),
        }),
        defineField({
          name: "headline",
          title: "Headline",
          type: "string",
          initialValue: "Launch your own Instant Coffee line",
        }),
        defineField({
          name: "subheadline",
          title: "Subheadline",
          type: "text",
          initialValue:
            "We turn your coffee into shelf-stable instant packets, so you can sell online, in-shop, and wholesale without buying new equipment.",
        }),
        defineField({
          name: "ctaLabel",
          title: "CTA Button Label",
          type: "string",
          initialValue: "Start a Batch",
        }),
        defineField({
          name: "ctaLink",
          title: "CTA Button Link",
          type: "string",
          initialValue: "/auth/signup",
        }),
      ],
    }),

    // WHAT WE'RE ABOUT SECTION
    defineField({
      name: "aboutSection",
      title: "What We're About Section",
      type: "object",
      fields: [
        defineField({
          name: "title",
          title: "Title",
          type: "string",
          initialValue: "What We're About",
        }),
        defineField({
          name: "description",
          title: "Description",
          type: "text",
          initialValue:
            "We're here to help coffee roasters expand their product lines with premium freeze-dried instant coffee. No equipment needed, just your great coffee and our expertise.",
        }),
      ],
    }),

    // LOGO MARQUEE SECTION
    defineField({
      name: "logoMarquee",
      title: "Logo Marquee",
      type: "object",
      fields: [
        defineField({
          name: "logos",
          title: "Partner Logos",
          type: "array",
          of: [
            {
              type: "image",
              options: { hotspot: true },
              fields: [
                defineField({
                  name: "alt",
                  title: "Alt Text",
                  type: "string",
                }),
              ],
            },
          ],
          validation: (r) => r.min(0).max(20),
        }),
      ],
    }),

    // IMAGE BANNER SECTION
    defineField({
      name: "imageBanner",
      title: "Image Banner",
      type: "object",
      fields: [
        defineField({
          name: "image",
          title: "Banner Image",
          type: "image",
          options: { hotspot: true },
        }),
        defineField({
          name: "overlayText",
          title: "Overlay Text",
          type: "string",
          initialValue: "Crafted with precision, delivered with care",
        }),
        defineField({
          name: "textPosition",
          title: "Text Position",
          type: "string",
          options: {
            list: [
              { title: "Top Left", value: "top-left" },
              { title: "Top Center", value: "top-center" },
              { title: "Top Right", value: "top-right" },
              { title: "Center Left", value: "center-left" },
              { title: "Center", value: "center" },
              { title: "Center Right", value: "center-right" },
              { title: "Bottom Left", value: "bottom-left" },
              { title: "Bottom Center", value: "bottom-center" },
              { title: "Bottom Right", value: "bottom-right" },
            ],
          },
          initialValue: "center",
        }),
      ],
    }),

    // HOW IT WORKS SECTION
    defineField({
      name: "howItWorks",
      title: "How It Works Section",
      type: "object",
      fields: [
        defineField({
          name: "title",
          title: "Title",
          type: "string",
          initialValue: "How It Works",
        }),
        defineField({
          name: "subtitle",
          title: "Subtitle",
          type: "string",
          initialValue: "A simple process from roast to packet",
        }),
        defineField({
          name: "steps",
          title: "Steps",
          type: "array",
          of: [
            {
              type: "object",
              name: "step",
              fields: [
                defineField({
                  name: "stepNumber",
                  title: "Step Number",
                  type: "number",
                  validation: (r) => r.required().min(1),
                }),
                defineField({
                  name: "title",
                  title: "Step Title",
                  type: "string",
                  validation: (r) => r.required(),
                }),
                defineField({
                  name: "description",
                  title: "Step Description",
                  type: "text",
                  validation: (r) => r.required(),
                }),
                defineField({
                  name: "icon",
                  title: "Icon Name (lucide-react)",
                  type: "string",
                  description: "e.g., Package, Droplet, Box, Truck",
                }),
              ],
              preview: {
                select: {
                  stepNumber: "stepNumber",
                  title: "title",
                },
                prepare({ stepNumber, title }) {
                  return {
                    title: `${stepNumber}. ${title}`,
                  }
                },
              },
            },
          ],
          validation: (r) => r.min(0).max(10),
        }),
      ],
    }),

    // CTA SECTION
    defineField({
      name: "ctaSection",
      title: "CTA Section",
      type: "ctaBox",
    }),
  ],
  preview: {
    prepare() {
      return { title: "Instant Processing Page" }
    },
  },
})
