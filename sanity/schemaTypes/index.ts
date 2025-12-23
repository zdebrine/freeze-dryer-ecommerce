import type { SchemaTypeDefinition } from "sanity"

import { blockContentType } from "./blockContentType"
import { categoryType } from "./categoryType"
import { postType } from "./postType"
import { authorType } from "./authorType"
import { featuredProducts } from "./featuredProducts"
import { hero } from "./hero"
import { testimonialType } from "./testimonialType"
import { homepageType } from "./homepageType"

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [blockContentType, categoryType, postType, authorType, featuredProducts, hero, testimonialType, homepageType],
}
