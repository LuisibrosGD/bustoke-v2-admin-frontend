import { SliderLayout } from '@/components/layout';

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SliderLayout>{children}</SliderLayout>;
}
