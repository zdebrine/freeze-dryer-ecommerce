// TextMarquee.stories.tsx
import type { Meta, StoryObj } from "@storybook/nextjs"
import { TextMarquee } from "@/components/shop/text-marquee"

const meta: Meta<typeof TextMarquee> = {
  title: "UI/TextMarquee",
  component: TextMarquee,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    nextjs: { appDirectory: true },
  },
  argTypes: {
    text: {
      control: "text",
      description: "Text to repeat across the marquee",
    },
    speed: {
      control: { type: "number", min: 5, max: 120, step: 5 },
      description: "Seconds per loop (lower = faster)",
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    text: "Mernin’ Coffee",
    speed: 30,
  },
}

export const Fast: Story = {
  args: {
    text: "Better mornings",
    speed: 12,
  },
}

export const Slow: Story = {
  args: {
    text: "Leisure-enhancing coffee",
    speed: 60,
  },
}

export const LongText: Story = {
  args: {
    text: "Coffee that tastes like you tried (but you didn’t)",
    speed: 30,
  },
}
