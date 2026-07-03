'use client';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/effect-fade';
import { Swiper as SwiperType } from 'swiper/types';

import { Swiper, SwiperSlide } from 'swiper/react';
import {
  Pagination,
  Navigation,
  EffectFade,
  Autoplay,
  Controller,
} from 'swiper/modules';
import Image from 'next/image';
import { Container } from './container';
import { ArrowLeftIcon, ArrowRightIcon } from 'lucide-react';
import { useState } from 'react';

const SLIDES = [
  {
    src: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=1920&q=80',
    alt: 'Accede a la información de tu flota en tiempo real',
    title: 'Accede a la información de tu flota en tiempo real',
    caption: 'Monitorea cada vehículo desde cualquier lugar.',
    description: 'Control total de tu operación de transporte.',
  },
  {
    src: 'https://images.unsplash.com/photo-1527736848781-72dc3b2ee00f?auto=format&fit=crop&w=1920&q=80',
    alt: 'Gestiona tus rutas de manera eficiente',
    title: 'Gestiona tus rutas de manera eficiente',
    caption: 'Optimiza recorridos y reduce costos operativos.',
    description: 'Planificación inteligente para tu flota.',
  },
  {
    src: 'https://images.unsplash.com/photo-1531968455001-5c5272a41129?auto=format&fit=crop&w=1920&q=80',
    alt: 'Monitorea el rendimiento de tus vehículos',
    title: 'Monitorea el rendimiento de tus vehículos',
    caption: 'Datos precisos para tomar mejores decisiones.',
    description: 'Maximiza la eficiencia de tu operación.',
  },
];

export function SliderLayout({ children }: { children: React.ReactNode }) {
  const [controlledSwiper, setControlledSwiper] = useState<SwiperType | null>(
    null
  );
  return (
    <main className="h-[calc(100dvh-57px)] max-md:min-h-[calc(100dvh-57px)]">
      <Container className="h-full">
        <div className="grid h-full grid-cols-1 gap-6 xl:grid-cols-12 xl:gap-12">
          <div className="hidden xl:flex items-end xl:col-span-8 h-full relative">
            <div className="absolute top-0 right-0 h-full w-[calc(100vw-50%)]">
              <Swiper
                effect="fade"
                onSwiper={setControlledSwiper}
                modules={[EffectFade, Controller]}
                loop
                className="h-full"
              >
                {SLIDES.map((slide, index) => (
                  <SwiperSlide key={index}>
                    <div className="relative size-full">
                      <Image
                        src={slide.src}
                        alt={slide.alt}
                        fill
                        sizes="(max-width: 1280px) 100vw, 75vw"
                        style={{
                          objectPosition: 'center 60%',
                          objectFit: 'cover',
                        }}
                      />
                      <div
                        className="size-full absolute top-0 right-0 z-20"
                        style={{
                          background:
                            'linear-gradient(180deg, rgba(46, 63, 64, 0) 0%, rgba(46, 43, 255, 0.132) 79.24%),linear-gradient(0deg, rgba(255, 255, 255, 0.2), rgba(0, 0, 0, 0.2))',
                        }}
                      ></div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>

            <div className="mb-12 w-full flex items-end justify-between gap-4 relative z-50">
              <div className="w-full max-w-125">
                <Swiper
                  autoplay={{
                    delay: 5000,
                    disableOnInteraction: false,
                  }}
                  effect="fade"
                  controller={{ control: controlledSwiper }}
                  modules={[
                    Controller,
                    Autoplay,
                    EffectFade,
                    Navigation,
                    Pagination,
                  ]}
                  navigation={{
                    nextEl: '.swiper-button-next-custom',
                    prevEl: '.swiper-button-prev-custom',
                  }}
                  pagination={{
                    el: '.swiper-pagination-custom',
                    clickable: true,
                  }}
                  loop
                >
                  {SLIDES.map((slide, index) => (
                    <SwiperSlide key={index}>
                      {({ isActive }) => (
                        <>
                          <h2
                            className={`text-4xl text-white font-medium mb-6 max-w-110 drop-shadow-lg ${isActive ? 'opacity-100' : 'opacity-0'}`}
                          >
                            {slide.title}
                          </h2>
                          <p
                            className={`text-lg text-white font-semibold drop-shadow-md mb-1 ${isActive ? 'opacity-100' : 'opacity-0'}`}
                          >
                            {slide.caption}
                          </p>
                          <p
                            className={`text-white drop-shadow-md ${isActive ? 'opacity-100' : 'opacity-0'}`}
                          >
                            {slide.description}
                          </p>
                        </>
                      )}
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>

              <div className="flex items-center gap-4 mr-12">
                <button
                  type="button"
                  className="cursor-pointer text-white swiper-button-prev-custom border hover:bg-white/10 rounded-full w-10 h-10 flex items-center justify-center shrink-0 transition-colors"
                >
                  <ArrowLeftIcon />
                </button>
                <div className="swiper-pagination-custom flex gap-2"></div>
                <button
                  type="button"
                  className="cursor-pointer text-white swiper-button-next-custom border hover:bg-white/10 rounded-full w-10 h-10 flex items-center justify-center shrink-0 transition-colors"
                >
                  <ArrowRightIcon />
                </button>
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-between gap-6 pb-8 xl:col-span-4 xl:pb-12 max-md:justify-start max-md:gap-4 max-md:pb-0">
            <div className="flex flex-1 items-center max-md:flex-none max-md:items-start max-md:pt-10">
              {children}
            </div>
            <span className="text-sm text-muted-foreground">
              Bustoke {new Date().getFullYear()}
            </span>
          </div>
        </div>
      </Container>

      <style>{`
        .swiper-wrapper {
          align-items: flex-end;
        }
        .swiper-pagination-custom .swiper-pagination-bullet {
          background: #efefef;
          opacity: 1;
        }
        .swiper-pagination-custom .swiper-pagination-bullet-active {
          background: #0039bf;
        }
      `}</style>
    </main>
  );
}
