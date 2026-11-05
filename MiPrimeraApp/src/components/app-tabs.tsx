import { Tabs } from 'expo-router';
import { Image, useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';
import { useDetalle } from '@/hooks/use-detalle';
import { useYapear } from '@/hooks/use-yapear';
import DetalleScreen from '@/app/detalle';
import YapearScreen from '@/app/yapear';

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const { movimientoActivo } = useDetalle();
  const { yapearActivo }     = useYapear();

  // Pantalla Detalle: reemplaza los tabs al seleccionar un movimiento
  if (movimientoActivo) {
    return <DetalleScreen />;
  }

  // Pantalla Yapear: reemplaza los tabs al pulsar el botón Yapear
  if (yapearActivo) {
    return <YapearScreen />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: { backgroundColor: colors.background },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, size }) => (
            <Image
              source={require('@/assets/images/tabIcons/home.png')}
              style={{ width: size, height: size, tintColor: color }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explorar',
          tabBarIcon: ({ color, size }) => (
            <Image
              source={require('@/assets/images/tabIcons/explore.png')}
              style={{ width: size, height: size, tintColor: color }}
            />
          ),
        }}
      />
      {/* Rutas ocultas de la barra de tabs */}
      <Tabs.Screen name="detalle" options={{ href: null }} />
      <Tabs.Screen name="yapear"  options={{ href: null }} />
      <Tabs.Screen name="login"   options={{ href: null }} />
    </Tabs>
  );
}
