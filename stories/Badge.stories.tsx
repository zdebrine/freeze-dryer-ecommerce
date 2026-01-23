import type { Meta, StoryObj } from "@storybook/nextjs"
import { Badge } from "@/components/ui/badge"
import { Check, X, AlertTriangle, Info } from "lucide-react"

const meta: Meta<typeof Badge> = {
  title: "UI/Badge",
  component: Badge,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "secondary", "destructive", "outline"],
      description: "The visual style of the badge",
    },
  },
  parameters: {
    docs: {
      description: {
        component: "A badge component for displaying status, labels, or counts.",
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof Badge>

export const Default: Story = {
  args: {
    children: "Badge",
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

// With icons
export const WithIcon: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge>
        <Check className="mr-1" /> Success
      </Badge>
      <Badge variant="destructive">
        <X className="mr-1" /> Error
      </Badge>
      <Badge variant="secondary">
        <AlertTriangle className="mr-1" /> Warning
      </Badge>
      <Badge variant="outline">
        <Info className="mr-1" /> Info
      </Badge>
    </div>
  ),
}

// Order status badges
export const OrderStatuses: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="outline">Pending</Badge>
      <Badge variant="secondary">Processing</Badge>
      <Badge>Shipped</Badge>
      <Badge variant="default">Delivered</Badge>
      <Badge variant="destructive">Cancelled</Badge>
    </div>
  ),
}

// All variants showcase
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="default">Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
    </div>
  ),
}
