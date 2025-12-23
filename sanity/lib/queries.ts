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
  