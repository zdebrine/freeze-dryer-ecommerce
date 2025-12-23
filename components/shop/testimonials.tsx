import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"

type TestimonialData = {
  _id: string
  name: string
  role: string
  content: string
  rating: number
}

const testimonials = [
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
    <section className="bg-muted/30 px-4 py-20">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">What Our Customers Say</h2>
          <p className="mt-4 text-lg text-muted-foreground">Don&apos;t just take our word for it</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <Card key={testimonial._id}>
              <CardContent className="p-6">
                <div className="mb-4 flex gap-1">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="mb-4 text-muted-foreground">&ldquo;{testimonial.content}&rdquo;</p>
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
