import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"

type TestimonialData = {
  name: string
  role?: string
  content: string
  rating: number
}

type TestimonialsConfig = {
  enabled?: boolean
  title?: string
  subtitle?: string
  testimonials?: TestimonialData[]
}

type TestimonialsProps = {
  config?: TestimonialsConfig
}

export function Testimonials({ config }: TestimonialsProps) {
  // Use Sanity data if available, otherwise use defaults
  const testimonials = config?.testimonials || []
  const title = config?.title || "Word on the street"

  // Don't render if no testimonials
  if (!testimonials || testimonials.length === 0) {
    console.log("[v0] No testimonials to display")
    return null
  }

  return (
    <section className="relative isolate overflow-hidden px-4">
      {/* Red diagonal band (intentionally NOT full height) */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute left-1/2 top-1/2
          h-[120%] md:h-[70%] w-[140%]
          -translate-x-1/2 -translate-y-1/2
          -rotate-2
          bg-primary
        "
      />

      <div className="relative container mx-auto max-w-7xl py-12 sm:py-56">
        <div className="mb-8 text-center md:mb-10">
          <h3 className="font-calsans text-3xl font-bold uppercase tracking-tight text-secondary sm:text-5xl">
            {title}
          </h3>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="backdrop-blur">
              <CardContent className="p-6">
                <div className="mb-4 flex gap-1">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                  ))}
                </div>

                <p className="mb-4">&ldquo;{testimonial.content}&rdquo;</p>

                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  {testimonial.role && <p className="text-sm text-muted-foreground">{testimonial.role}</p>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
