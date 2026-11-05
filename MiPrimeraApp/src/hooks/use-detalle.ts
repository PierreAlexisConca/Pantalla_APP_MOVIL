import { createContext, useContext } from 'react';
import type { Movimiento } from '@/app/index';

// ── Contexto compartido para la pantalla Detalle ──────────────────────────
type DetalleContextType = {
  movimientoActivo: Movimiento | null;
  abrirDetalle: (m: Movimiento) => void;
  cerrarDetalle: () => void;
};

export const DetalleContext = createContext<DetalleContextType>({
  movimientoActivo: null,
  abrirDetalle: () => {},
  cerrarDetalle: () => {},
});

export function useDetalle() {
  return useContext(DetalleContext);
}
