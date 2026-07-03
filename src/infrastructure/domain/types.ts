// ============================================================
// TIPOS CANÓNICOS DEL DOMINIO - BUSTOKE ADMIN PANEL
// Alineados con la BD (nuevadb/scriptbd.sql)
// ============================================================

// --- Ubigeo ---

export type Departamento = {
  id: string;
  nombre: string;
};

export type Provincia = {
  id: string;
  idDepartamento: string;
  nombre: string;
};

export type Distrito = {
  id: string;
  idProvincia: string;
  nombre: string;
};

// --- Catálogos ---

export type TipoDocumento = {
  id: string;
  nombre: string;
  longitudExacta: number | null;
};

export type Plan = {
  id: string;
  nombre: string;
  precio: number;
  limiteBuses: number;
};

export type MetodoPago = 'yape' | 'plin' | 'tarjeta';
export type EstadoPago = 'pendiente' | 'completado' | 'fallido' | 'reembolsado';
export type EstadoAgencia = 'activa' | 'suspendida';
export type TipoServicio = 'vip' | 'normal';
export type EstadoViaje = 'programado' | 'en_curso' | 'finalizado' | 'cancelado';
export type EstadoBoleto = 'activo' | 'cancelado';
export type CanalVenta = 'app_bustoke' | 'ventanilla_fisica';
export type EstadoReclamo = 'abierto' | 'en_proceso' | 'resuelto';
export type EstadoTicketSoporte = 'abierto' | 'en_revision' | 'resuelto';
export type RolUsuario = 'cliente' | 'admin_agencia' | 'superadmin';

// --- Terminales ---

export type Terminal = {
  id: string;
  idDistrito: string;
  nombre: string;
  direccion: string;
};

// --- Agencias ---

export type Agencia = {
  id: string;
  ruc: string;
  razonSocial: string;
  estado: EstadoAgencia;
  bancoNombre: string | null;
  numeroCuenta: string | null;
  cuentaCci: string | null;
};

// --- Pivot Agencia-Terminal ---

export type AgenciaTerminal = {
  id: string;
  idAgencia: string;
  idTerminal: string;
  nroCounterOficina: string;
};

// --- Buses ---

export type Bus = {
  id: string;
  idAgencia: string;
  placa: string;
  cantidadPisos: number;
};

// --- Choferes ---

export type Chofer = {
  id: string;
  idAgencia: string;
  idTipoDocumento: string;
  numeroDocumento: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  activo: boolean;
  fechaRegistro: string;
};

// --- Asientos ---

export type Asiento = {
  id: string;
  idBus: string;
  numeroAsiento: string;
  fila: string;
  piso: number;
  tipoServicio: TipoServicio;
  coordX: number;
  coordY: number;
  bloqueadoManual: boolean;
};

// --- Rutas ---

export type Ruta = {
  id: string;
  idAgencia: string;
  idTerminalOrigen: string;
  idTerminalDestino: string;
  tarifaBase: number;
  terminalOrigenNombre?: string;
  terminalDestinoNombre?: string;
};

// --- Tarifas por Ruta ---

export type TarifaRuta = {
  id: string;
  idRuta: string;
  tipoServicio: TipoServicio;
  precio: number;
};

// --- Viajes ---

export type Viaje = {
  id: string;
  idRuta: string;
  idBus: string;
  idChofer: string | null;
  fechaHoraSalida: string;
  fechaHoraLlegada: string;
  estado: EstadoViaje;
  rampaEmbarque: string;
};

// --- Usuarios (admin/operador) ---

export type Usuario = {
  id: string;
  email: string;
  telefono: string | null;
  rol: RolUsuario;
  idAgencia: string | null;
  activo: boolean;
  fechaCreacion: string;
};

// --- Pasajeros ---

export type Pasajero = {
  id: string;
  idUsuario: string | null;
  idTipoDocumento: string;
  numeroDocumento: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  fechaNacimiento: string;
};

// --- Boletos ---

export type Boleto = {
  id: string;
  idViaje: string;
  idUsuario: string | null;
  idPasajero: string;
  idAsiento: string;
  emailContacto: string;
  canal: CanalVenta;
  codigoQr: string;
  usado: boolean;
  fechaValidacion: string | null;
  precioFinal: number;
  fechaEmision: string;
  estado: EstadoBoleto;
  estadoCheckin: string;
};

// --- Pagos ---

export type Pago = {
  id: string;
  idBoleto: string;
  metodo: MetodoPago;
  montoTotal: number;
  referenciaTransaccion: string;
  estado: EstadoPago;
};

// --- Reembolsos ---

export type Reembolso = {
  id: string;
  idPago: string;
  idUsuarioResponsable: string | null;
  montoReembolsado: number;
  motivo: string;
  fechaReembolso: string;
};

// --- Reclamos ---

export type Reclamo = {
  id: string;
  idUsuario: string;
  idAgencia: string;
  motivo: string;
  detalle: string;
  estado: EstadoReclamo;
  fechaCreacion: string;
};

export type MensajeReclamo = {
  id: string;
  idReclamo: string;
  idUsuario: string;
  textMensaje: string;
  fecha: string;
};

// --- Comisiones ---

export type ConfiguracionComision = {
  id: string;
  idAgencia: string | null;
  porcentajeComision: number;
  montoFijoComision: number;
  fechaInicio: string;
  fechaFin: string | null;
};

// --- Suscripciones ---

export type Suscripcion = {
  id: string;
  idAgencia: string;
  idPlan: string;
  montoMensual: number;
  fechaFacturacion: string;
  estadoCobro: EstadoPago;
};

// --- Liquidaciones ---

export type Liquidacion = {
  id: string;
  idAgencia: string;
  periodo: string;
  montoVentas: number;
  comisionPlataforma: number;
  montoATransferir: number;
  estadoPago: EstadoPago;
};

// --- API Keys ---

export type ApiKey = {
  id: string;
  idAgencia: string;
  token: string;
  fechaCreacion: string;
  fechaExpiracion: string;
  ultimoUso: string | null;
  activo: boolean;
};

// --- Notificaciones ---

export type Notificacion = {
  id: string;
  idUsuario: string;
  tipo: string;
  titulo: string;
  mensaje: string;
  referenciaTipo: string | null;
  referenciaId: string | null;
  leida: boolean;
  fechaCreacion: string;
};

// --- Tickets de Soporte ---

export type TicketSoporte = {
  id: string;
  idAgencia: string;
  asunto: string;
  descripcion: string;
  estado: EstadoTicketSoporte;
  fechaCreacion: string;
};

export type HistorialCambioSoporte = {
  id: string;
  idTicket: string;
  campo: string;
  valorAnterior: string | null;
  valorNuevo: string;
  idUsuarioModifica: string | null;
  fechaCambio: string;
};

// --- Manifiestos SUTRAN ---

export type ManifiestoSutran = {
  id: string;
  idViaje: string;
  fechaGeneracion: string;
  estadoEnvio: string;
  respuestaApi: string;
};

// --- Historial de Estados de Viaje ---

export type HistorialEstadoViaje = {
  id: string;
  idViaje: string;
  estadoAnterior: EstadoViaje;
  estadoNuevo: EstadoViaje;
  motivo: string;
  idUsuarioResponsable: string | null;
  fechaCambio: string;
};

// --- Auditoría ---

export type AuditLog = {
  id: string;
  tablaAfectada: string;
  accion: string;
  datosAnteriores: Record<string, unknown> | null;
  datosNuevos: Record<string, unknown> | null;
  fecha: string;
  idUsuarioResponsable: string | null;
};
