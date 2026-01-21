import type { Meta, StoryObj } from "@storybook/nextjs"
import { Cta } from "@/components/shop/cta"

type CtaStoryArgs = {
  ctaText?: string
  ctaSubText?: string
  ctaImage?: string
  ctaLink?: string
  ctaButtonLabel?: string
  ctaImageAlt?: string
}

const meta: Meta<typeof Cta> = {
  title: "UI/Cta",
  component: Cta,
  tags: ["autodocs"],
  argTypes: {
    ctaText: { control: "text", description: "Title of the CTA" },
    ctaSubText: { control: "text", description: "Subheading of the CTA" },
    ctaImage: { control: "text", description: "Image url of CTA" },
    ctaLink: { control: "text", description: "Link to CTA button" },
    ctaButtonLabel: { control: "text", description: "Label for CTA button" },
    ctaImageAlt: { control: "text", description: "Alt text for CTA image" },
  },
  render: (args: any) => <Cta config={args} />,
}

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  args: {
    ctaText: "CTA CALLOUT",
    ctaSubText: "CTA SUBTEXT",
    ctaImage: "/imageurlblah",
    ctaLink: "/ctaroute",
    ctaButtonLabel: "Shop now",
    ctaImageAlt: "CTA image",
  } satisfies CtaStoryArgs,
}
