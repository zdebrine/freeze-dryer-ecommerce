import { type SchemaTypeDefinition } from 'sanity'
import landingPage from "./landingPage"
import navLink from './navLink'
import cta from './cta'
import testimonial from './testimonial'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [landingPage, navLink, cta, testimonial],
}
