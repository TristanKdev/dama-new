interface IconProps {
  className?: string;
  size?: number;
}

export function JarZero({ className, size = 24 }: IconProps) {
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
      <path d="M8 4h8" />
      <path d="M9 4v1a2 2 0 0 1-2 2H6a1 1 0 0 0-1 1v11a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3V8a1 1 0 0 0-1-1h-1a2 2 0 0 1-2-2V4" />
      <circle cx="12" cy="14" r="2.5" />
      <path d="M12 12.5v-1" />
      <path d="M12 16.5v-1" />
    </svg>
  );
}
