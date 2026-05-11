export default function DodoBanner() {
  return (
    <a
      href="https://dodopayments.com"
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center gap-1.5 w-full py-0.5 text-[10px] font-medium tracking-wide text-black hover:opacity-90 transition-opacity"
      style={{ backgroundColor: '#C6FC1E' }}
    >
      <span>Payments by Dodo</span>
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 17L17 7" />
        <path d="M7 7h10v10" />
      </svg>
    </a>
  );
}
