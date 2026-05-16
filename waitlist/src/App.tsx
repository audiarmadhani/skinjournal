import { useState } from 'react';
import { BrandHeader } from './components/BrandHeader';
import { HeroScreenshot } from './components/HeroScreenshot';
import { InlineWaitlistForm } from './components/InlineWaitlistForm';

export default function App() {
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusVariant, setStatusVariant] = useState<'success' | 'error' | null>(null);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-12 lg:py-0">
      <main className="mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-16 xl:gap-20">
        <section className="flex flex-col">
          <BrandHeader />

          <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-ink sm:text-5xl lg:text-[3.25rem]">
            See your skin progress over time.
          </h1>

          <p className="mt-4 max-w-md text-lg leading-relaxed text-muted">
            Daily photos, routines, and insights — so you always know what&apos;s working.
          </p>

          <InlineWaitlistForm
            onStatusChange={(message, variant) => {
              setStatusMessage(message);
              setStatusVariant(variant);
            }}
          />

          {statusMessage ? (
            <p
              role="status"
              className={`mt-4 text-sm ${
                statusVariant === 'success' ? 'text-muted' : 'text-pink-dark'
              }`}
            >
              {statusMessage}
            </p>
          ) : null}
        </section>

        <section>
          <HeroScreenshot />
        </section>
      </main>
    </div>
  );
}
