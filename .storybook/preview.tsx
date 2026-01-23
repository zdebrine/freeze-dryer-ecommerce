import type { Preview } from "@storybook/nextjs"
import "../app/globals.css"

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      options: {
        light: { name: "light", value: "#ffffff" },
        dark: { name: "dark", value: "#0a0a0a" },
        gray: { name: "gray", value: "#f5f5f5" }
      }
    },
    layout: "centered",
  },

  decorators: [
    (Story) => (
      <div className="font-sans">
        <Story />
      </div>
    ),
  ],

  initialGlobals: {
    backgrounds: {
      value: "light"
    }
  }
}

export default preview
