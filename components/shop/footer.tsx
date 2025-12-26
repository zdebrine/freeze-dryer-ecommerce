"use client"

import Link from "next/link"

type NavLink = {
  label: string
  href: string
}

type FooterColumn = {
  title: string
  links?: NavLink[]
}

type FooterConfig = {
  logoText?: string
  tagline?: string
  columns?: FooterColumn[]
  copyrightText?: string
}

function isExternalUrl(href: string) {
  return /^https?:\/\//i.test(href)
}

export function ShopFooter({ config }: { config?: FooterConfig }) {
  const logoText = config?.logoText ?? "mernin'"
  const tagline = config?.tagline ?? "Premium instant coffee, freeze-dried to perfection."
  const columns =
    config?.columns?.length
      ? config.columns
      : [
          {
            title: "Shop",
            links: [
              { label: "All Products", href: "/#products" },
              { label: "Best Sellers", href: "/#products" },
              { label: "New Arrivals", href: "/#products" },
            ],
          },
          {
            title: "Company",
            links: [
              { label: "For Roasters", href: "/instant-processing" },
              { label: "About Us", href: "/#about" },
              { label: "Portal Login", href: "/auth/login" },
            ],
          },
          {
            title: "Support",
            links: [
              { label: "Contact Us", href: "#" },
              { label: "Shipping Info", href: "#" },
              { label: "Returns", href: "#" },
            ],
          },
        ]

  const copyrightText = config?.copyrightText ?? "© 2025 mernin'. All rights reserved."

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-4xl font-hero text-primary">{logoText}</span>
            </div>
            {tagline ? <p className="text-sm text-muted-foreground">{tagline}</p> : null}
          </div>

          {/* Link columns */}
          {columns.map((col, idx) => (
            <div key={`${col.title}-${idx}`}>
              <h4 className="mb-4 font-semibold">{col.title}</h4>

              <ul className="space-y-2 text-sm">
                {(col.links ?? []).map((l, jdx) => {
                  const linkProps = isExternalUrl(l.href)
                    ? { href: l.href, target: "_blank", rel: "noreferrer" }
                    : { href: l.href }

                  return (
                    <li key={`${l.label}-${l.href}-${jdx}`}>
                      <Link
                        {...(linkProps as any)}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {l.label}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>{copyrightText}</p>
        </div>
      </div>
    </footer>
  )
}
