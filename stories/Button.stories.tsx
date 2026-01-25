import type { Meta, StoryObj } from "@storybook/react"
import { Button } from "@/components/ui/button"
import { Mail, Loader2, ChevronRight, Plus } from "lucide-react"

const meta: Meta<typeof Button> = {
  title: "UI/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "destructive", "outline", "secondary", "ghost", "link"],
      description: "The visual style of the button",
    },
    size: {
      control: "select",
      options: ["default", "sm", "lg", "icon", "icon-sm", "icon-lg"],
      description: "The size of the button",
    },
    disabled: {
      control: "boolean",
      description: "Whether the button is disabled",
    },
    asChild: {
      control: "boolean",
      description: "Whether to render as a child component",
    },
  },
  parameters: {
    docs: {
      description: {
        component: "A versatile button component with multiple variants and sizes.",
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof Button>

// Basic variants
export const Default: Story = {
  args: {
    children: "Button",
    variant: "default",
  },
}

export const Secondary: Story = {
  args: {
    children: "Secondary",
    variant: "secondary",
  },
}

export const Destructive: Story = {
  args: {
    children: "Destructive",
    variant: "destructive",
  },
}

export const Outline: Story = {
  args: {
    children: "Outline",
    variant: "outline",
  },
}

export const Ghost: Story = {
  args: {
    children: "Ghost",
    variant: "ghost",
  },
}

export const Link: Story = {
  args: {
    children: "Link",
    variant: "link",
  },
}

// Sizes
export const Small: Story = {
  args: {
    children: "Small",
    size: "sm",
  },
}

export const Large: Story = {
  args: {
    children: "Large",
    size: "lg",
  },
}

export const Icon: Story = {
  args: {
    children: <Plus className="h-4 w-4" />,
    size: "icon",
    "aria-label": "Add item",
  },
}

// With icons
export const WithIcon: Story = {
  args: {
    children: (
      <>
        <Mail className="mr-2 h-4 w-4" /> Login with Email
      </>
    ),
  },
}

export const IconRight: Story = {
  args: {
    children: (
      <>
        Next <ChevronRight className="ml-2 h-4 w-4" />
      </>
    ),
  },
}

// States
export const Disabled: Story = {
  args: {
    children: "Disabled",
    disabled: true,
  },
}

export const Loading: Story = {
  args: {
    children: (
      <>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait
      </>
    ),
    disabled: true,
  },
}

// All variants showcase
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button variant="default">Default</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
}

// All sizes showcase
export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
      <Button size="icon">
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  ),
}
