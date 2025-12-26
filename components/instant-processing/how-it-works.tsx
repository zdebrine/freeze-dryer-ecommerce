import { Package, Droplet, Box, Truck, Coffee, Zap } from "lucide-react"

type Step = {
  stepNumber: number
  title: string
  description: string
  icon?: string
}

type HowItWorksConfig = {
  title?: string
  subtitle?: string
  steps?: Step[]
}

function getIconComponent(iconName?: string) {
  const icons: Record<string, any> = {
    Package,
    Droplet,
    Box,
    Truck,
    Coffee,
    Zap,
  }
  return icons[iconName || "Package"] || Package
}

export function HowItWorks({ config }: { config?: HowItWorksConfig }) {
  const title = config?.title || "How It Works"
  const subtitle = config?.subtitle || "A simple process from roast to packet"
  const steps = config?.steps || []

  if (steps.length === 0) {
    return null
  }

  return (
    <section className="bg-background px-4 py-20">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">{title}</h2>
          <p className="mt-4 text-lg text-muted-foreground">{subtitle}</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {steps.map((step) => {
            const IconComponent = getIconComponent(step.icon)
            return (
              <div key={step.stepNumber} className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <IconComponent className="h-8 w-8 text-primary" />
                </div>
                <div className="mb-2 text-sm font-semibold text-primary">Step {step.stepNumber}</div>
                <h3 className="mb-2 text-xl font-semibold">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
