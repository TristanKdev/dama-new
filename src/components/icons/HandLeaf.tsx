interface IconProps {
  className?: string;
  size?: number;
}

export function HandLeaf({ className, size = 24 }: IconProps) {
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
      <path d="M12 21c-3-3-7-5.5-7-10a5 5 0 0 1 7-4.5" />
      <path d="M12 21c3-3 7-5.5 7-10a5 5 0 0 0-7-4.5" />
      <path d="M12 21V11" />
      <path d="M9 7c1.5 1 3 1.5 4.5.5" />
      <path d="M7 3.5C9 4.5 11 5 12 6" />
      <path d="M17 3.5C15 4.5 13 5 12 6" />
    </svg>
  );
}
