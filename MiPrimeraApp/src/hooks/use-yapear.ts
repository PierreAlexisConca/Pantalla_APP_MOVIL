import { createContext, useContext } from 'react';

// ── Contexto para la pantalla Yapear ──────────────────────────────────────
type YapearContextType = {
  yapearActivo: boolean;
  abrirYapear: () => void;
  cerrarYapear: () => void;
};

export const YapearContext = createContext<YapearContextType>({
  yapearActivo: false,
  abrirYapear: () => {},
  cerrarYapear: () => {},
});

export function useYapear() {
  return useContext(YapearContext);
}
