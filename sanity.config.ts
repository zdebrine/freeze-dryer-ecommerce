/**
 * Sanity Studio config mounted at /app/studio/[[...tool]]/page.tsx
 */

import { defineConfig } from "sanity"
import { visionTool } from "@sanity/vision"
import { structureTool } from "sanity/structure"

import { apiVersion, dataset, projectId } from "./cms/env"
import { schema } from "./cms/schemaTypes/schema"
import { structure } from "./cms/structure"

const config = defineConfig({
  basePath: "/studio",
  projectId,
  dataset,
  schema,
  plugins: [structureTool({ structure }), visionTool({ defaultApiVersion: apiVersion })],
})

export { config }
export default config
