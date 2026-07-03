import Image from 'next/image';
import { Container } from './container';

export function Header() {
  return (
    <header className="py-3 border-b">
      <Container>
        <div className="flex justify-between items-center">
          <Image
            src="/icons/bustokelogocompleto.svg"
            alt="Bustoke"
            width={120}
            height={20}
            priority
          />
        </div>
      </Container>
    </header>
  );
}
