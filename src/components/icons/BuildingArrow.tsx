interface IconProps {
  className?: string;
  size?: number;
}

export function BuildingArrow({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="4" y="2" width="10" height="20" rx="1" />
      <line x1="7" y1="6" x2="7" y2="6.01" />
      <line x1="11" y1="6" x2="11" y2="6.01" />
      <line x1="7" y1="10" x2="7" y2="10.01" />
      <line x1="11" y1="10" x2="11" y2="10.01" />
      <line x1="7" y1="14" x2="7" y2="14.01" />
      <line x1="11" y1="14" x2="11" y2="14.01" />
      <path d="M14 18h4m0 0l-2-2m2 2l-2 2" />
    </svg>
  );
}
