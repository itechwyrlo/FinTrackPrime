// The one recurring visual signature from the original site, ported
// as-is rather than reinvented: a banknote-engraving rosette, drawn
// from concentric rotated ellipses. Used as a quiet watermark behind
// dark panels (auth screens, the app header), never as foreground
// content, since its only job is texture.
export function GuillocheMotif({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 600 600"
      aria-hidden="true"
      focusable="false"
    >
      <g fill="none" stroke="#C5A059" strokeWidth={1} strokeOpacity={0.18}>
        {[0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165].map((angle) => (
          <ellipse
            key={angle}
            cx={300}
            cy={300}
            rx={270}
            ry={80}
            transform={`rotate(${angle} 300 300)`}
          />
        ))}
      </g>
      <g fill="none" stroke="#C5A059" strokeWidth={1} strokeOpacity={0.1}>
        {[8, 53, 98, 143].map((angle) => (
          <ellipse
            key={angle}
            cx={300}
            cy={300}
            rx={180}
            ry={52}
            transform={`rotate(${angle} 300 300)`}
          />
        ))}
      </g>
    </svg>
  )
}
