export function Logo() {
  return (
    <span className="logo" aria-label="SeLava">
      <svg className="logo-mark" width="30" height="30" viewBox="0 0 32 32" aria-hidden="true">
        <rect width="32" height="32" rx="6" fill="#05AFF2" />
        <path fill="#008FC9" d="M0 6a6 6 0 0 1 6-6h20a6 6 0 0 1 6 6v2H0z" />
        <circle cx="24" cy="4" r="1" fill="white" /><circle cx="28" cy="4" r="1" fill="white" />
        <circle cx="16" cy="20" r="8" fill="#05DBF2" />
        <path fill="#F2CB05" d="m12 15-4 3 3 3 2-1v7h6v-7l2 1 3-3-4-3-2 2h-4z" />
      </svg>
      <span><span className="logo-accent">SE</span>LAVA</span>
    </span>
  )
}
