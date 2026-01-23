// Cta.stories.tsx
import type { Meta, StoryObj } from "@storybook/nextjs"
import { Cta } from "@/components/shop/cta"

const meta: Meta<typeof Cta> = {
  title: "Shop/Cta",
  component: Cta,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    nextjs: { appDirectory: true },
  },
  argTypes: {
    config: {
      control: "object",
      description: "CTA configuration object",
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    config: {
      ctaText: "Leisure-Enhancing Coffee",
      ctaSubText:
        "A wildly good daily drinker for people who want a better morning without the fuss.",
      ctaLink: "/#products",
      ctaButtonLabel: "Shop the collection",
      ctaImageAlt: "CTA image",
      // Leave ctaImage undefined to show the fallback panel
    },
  },
}

export const WithImage: Story = {
  args: {
    config: {
      ctaText: "Coffee that behaves",
      ctaSubText: "Smooth, reliable, and makes your 9am feel less illegal.",
      ctaLink: "/#products",
      ctaButtonLabel: "Shop now",
      ctaImage: "/placeholder.svg", 
      ctaImageAlt: "A bag of coffee on a table",
    },
  },
}

export const ExternalLink: Story = {
  args: {
    config: {
      ctaText: "Try the sampler",
      ctaSubText: "If you’re picky, this is the fastest way to find “your” coffee.",
      ctaLink: "https://example.com",
      ctaButtonLabel: "See details",
      ctaImage: "/placeholder.svg",
      ctaImageAlt: "Sampler CTA image",
    },
  },
}
