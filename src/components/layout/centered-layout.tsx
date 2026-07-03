import { Container } from './container';

export function CenteredLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-dvh md:min-h-[calc(100dvh-57px)]">
      <Container className="flex h-full flex-col items-center justify-center max-md:h-auto max-md:py-6">
        <div className="w-full max-w-90 py-12 max-md:py-0 xl:py-24">
          {children}
        </div>
      </Container>
    </main>
  );
}
