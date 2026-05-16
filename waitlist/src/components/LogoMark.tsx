interface LogoMarkProps {
  className?: string;
}

export function LogoMark({ className = '' }: LogoMarkProps) {
  return (
    <div
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pink ${className}`}
      aria-hidden
    >
      <span className="text-lg leading-none">✨</span>
    </div>
  );
}
