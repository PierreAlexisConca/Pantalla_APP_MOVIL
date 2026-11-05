import * as SplashScreen from 'expo-splash-screen';
import { useState, useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { AuthContext } from '@/hooks/use-auth';
import { DetalleContext } from '@/hooks/use-detalle';
import { YapearContext } from '@/hooks/use-yapear';
import type { Movimiento } from '@/app/index';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // Auth
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [usuario, setUsuario]       = useState('');

  // Detalle
  const [movimientoActivo, setMovimientoActivo] = useState<Movimiento | null>(null);

  // Yapear
  const [yapearActivo, setYapearActivo] = useState(false);

  const router = useRouter();
  const segments = useSegments();

  const login = (user: string) => {
    setUsuario(user);
    setIsLoggedIn(true);
  };

  const logout = () => {
    setUsuario('');
    setIsLoggedIn(false);
    setMovimientoActivo(null);
    setYapearActivo(false);
  };

  useEffect(() => {
    if (!isLoggedIn && segments[0] !== 'login') {
      router.replace('/login');
    } else if (isLoggedIn && segments[0] === 'login') {
      router.replace('/');
    }
  }, [isLoggedIn, segments]);

  return (
    <AuthContext.Provider value={{ isLoggedIn, usuario, login, logout }}>
      <DetalleContext.Provider
        value={{
          movimientoActivo,
          abrirDetalle: (m) => { setYapearActivo(false); setMovimientoActivo(m); },
          cerrarDetalle: () => setMovimientoActivo(null),
        }}
      >
        <YapearContext.Provider
          value={{
            yapearActivo,
            abrirYapear:  () => { setMovimientoActivo(null); setYapearActivo(true); },
            cerrarYapear: () => setYapearActivo(false),
          }}
        >
          <AnimatedSplashOverlay />
          <Slot />
        </YapearContext.Provider>
      </DetalleContext.Provider>
    </AuthContext.Provider>
  );
}
