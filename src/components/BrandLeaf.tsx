export function BrandLeaf({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      style={style}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
    >
      <path d="M32 13 C 42 21, 46 30, 32 51 C 18 30, 22 21, 32 13 Z" />
      <path d="M32 17 L32 47" />
    </svg>
  );
}
