export const HERO_QUERY = `*[_type == "hero"][0]{
    title,
    subtitle,
    buttonText,
    buttonLink,
    "imageUrl": image.asset->url
  }`

export const FEATURED_PRODUCTS_QUERY = `*[_type == "featuredProducts"][0]{
    title,
    productHandles
  }`

export const HOMEPAGE_QUERY = `*[_type == "homepage"][0]{
  title,
  heroTitle,
  heroSubtitle,
  productSectionTitle,
  productSectionSubtitle,
  testimonialSectionTitle,
  testimonialSectionSubtitle,
  featuredProductHandle
}`

export const TESTIMONIALS_QUERY = `*[_type == "testimonial"] | order(order asc) {
  _id,
  name,
  role,
  content,
  rating
}`
