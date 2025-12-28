"use client"

type TextMarqueeProps = {
  text: string
  speed?: number
}

export function TextMarquee({ text, speed = 30 }: TextMarqueeProps) {
  return (
    <div className="relative overflow-hidden bg-primary py-4">
      <div
        className="flex whitespace-nowrap"
        style={{
          animation: `marquee ${speed}s linear infinite`,
        }}
      >
        {/* Repeat text multiple times for seamless loop */}
        {Array.from({ length: 10 }).map((_, i) => (
          <span key={i} className="mx-8 text-lg font-bold uppercase tracking-wide text-primary-foreground md:text-2xl">
            {text}
          </span>
        ))}
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  )
}
