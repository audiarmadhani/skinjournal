export function HeroScreenshot() {
  return (
    <div className="relative flex justify-center lg:justify-end">
      <div
        className="pointer-events-none absolute inset-0 -z-10 m-auto h-64 w-64 rounded-full bg-pink-light blur-3xl opacity-80 lg:h-80 lg:w-80"
        aria-hidden
      />
      <img
        src="/app-screenshot.png"
        alt="SkinJournal app home screen showing daily photo, routine log, streak, and insights"
        className="h-auto w-full max-h-[min(85vh,720px)] max-w-[min(100%,380px)] object-contain drop-shadow-[0_24px_48px_rgba(26,26,26,0.12)] lg:max-w-none"
        width={390}
        height={844}
        loading="eager"
      />
    </div>
  );
}
