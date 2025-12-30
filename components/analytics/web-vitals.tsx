"use client"

import { useReportWebVitals } from "next/web-vitals"

export function WebVitals() {
  useReportWebVitals((metric) => {
    console.log("Web Vital:", {
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      id: metric.id,
    })

    // Send to analytics endpoint
    const body = JSON.stringify({
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      id: metric.id,
      label: metric.label,
    })

    // You can send this to your analytics service
    // For now, we're using Vercel Analytics which automatically captures these
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/analytics/vitals", body)
    } else {
      fetch("/api/analytics/vitals", {
        body,
        method: "POST",
        keepalive: true,
      })
    }
  })

  return null
}
