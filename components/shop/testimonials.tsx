import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"

type TestimonialData = {
  _id: string
  name: string
  role: string
  content: string
  rating: number
}

const testimonials: TestimonialData[] = [
  {
    _id: "1",
    name: "Sarah Johnson",
    role: "Coffee Enthusiast",
    content:
      "The best instant coffee I've ever tried. It actually tastes like real coffee, not the usual instant blend. Perfect for my morning hikes!",
    rating: 5,
  },
  {
    _id: "2",
    name: "Michael Chen",
    role: "Remote Worker",
    content:
      "As someone who works remotely and travels often, this has been a game-changer. The quality is incredible and it's so convenient.",
    rating: 5,
  },
  {
    _id: "3",
    name: "Emma Davis",
    role: "Outdoor Adventurer",
    content:
      "I take these packets on every camping trip. They're lightweight, don't take up space, and the coffee is actually delicious!",
    rating: 5,
  },
]

export function Testimonials() {
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

      <div className="relative container mx-auto max-w-7xl py-8 sm:py-56">
        <div className="mb-10 text-center">
          <h2 className="font-calsans text-4xl font-bold uppercase tracking-tight text-secondary sm:text-5xl">
            Word on the street
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <Card key={testimonial._id} className="backdrop-blur">
              <CardContent className="p-6">
                <div className="mb-4 flex gap-1">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                  ))}
                </div>

                <p className="mb-4">&ldquo;{testimonial.content}&rdquo;</p>

                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}