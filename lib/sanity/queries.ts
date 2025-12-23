import { client } from "@/sanity/lib/client"
import { HOMEPAGE_QUERY, TESTIMONIALS_QUERY } from "@/sanity/lib/queries"

export type HomepageData = {
  title?: string
  heroTitle?: string
  heroSubtitle?: string
  productSectionTitle?: string
  productSectionSubtitle?: string
  testimonialSectionTitle?: string
  testimonialSectionSubtitle?: string
  featuredProductHandle?: string
}

export type TestimonialData = {
  _id: string
  name: string
  role: string
  content: string
  rating: number
}

export async function getHomepageData(): Promise<HomepageData | null> {
  try {
    const data = await client.fetch(HOMEPAGE_QUERY)
    return data
  } catch (error) {
    console.error("Failed to fetch homepage data from Sanity:", error)
    return null
  }
}

export async function getTestimonials(): Promise<TestimonialData[]> {
  try {
    const data = await client.fetch(TESTIMONIALS_QUERY)
    return data || []
  } catch (error) {
    console.error("Failed to fetch testimonials from Sanity:", error)
    return []
  }
}
