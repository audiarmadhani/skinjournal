import { LogoMark } from './LogoMark';

export function BrandHeader() {
  return (
    <div className="mb-10 flex items-center gap-2.5">
      <LogoMark />
      <span className="text-lg font-semibold text-ink">SkinJournal</span>
    </div>
  );
}
