import type { Agencia, Bus, Ruta, Viaje } from '@/infrastructure/domain/types';

export type EntityType = 'agencia' | 'bus' | 'ruta' | 'viaje';

// The drilldown uses canonical types directly
export type AgenciaApi = Agencia;
export type BusApi = Bus;
export type RutaApi = Ruta;
export type ViajeApi = Viaje;
