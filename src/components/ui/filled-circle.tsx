import React from "react"

export const FilledCircle = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className}>
    <circle cx="12" cy="12" r="9" />
  </svg>
)