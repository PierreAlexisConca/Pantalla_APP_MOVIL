import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import * as Notifications from 'expo-notifications';

// ── Colores ────────────────────────────────────────────────────────────────
const YAPE_PURPLE       = '#6C2D91';
const YAPE_PURPLE_DARK  = '#4A1E6B';
const YAPE_PURPLE_LIGHT = '#8B4DB5';
const YAPE_BG           = '#F5F0FA';
const WHITE             = '#FFFFFF';
const GRAY_LIGHT        = '#E8E0F0';
const GRAY_TEXT         = '#7A6B8A';
const GRAY_DARK         = '#2D1F3D';
const GREEN             = '#2E7D32';
const GREEN_BG          = '#E8F5E9';
const ERROR_RED         = '#D63B3B';

// ── Configurar el handler de notificaciones ───────────────────────────────
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// ── Componente Toast ───────────────────────────────────────────────────────
function Toast({ visible, mensaje, tipo = 'success' }: { visible: boolean; mensaje: string; tipo?: 'success' | 'error' }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(opacity, { toValue: 1, useNativeDriver: true }),
        Animated.spring(translateY, { toValue: 0, friction: 8, tension: 40, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: -100, duration: 300, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  return (
    <Animated.View
      style={[
        styles.toast,
        { opacity, transform: [{ translateY }] },
        tipo === 'error' && styles.toastError,
      ]}
      pointerEvents="none"
    >
      <Text style={styles.toastIcon}>{tipo === 'success' ? '✅' : '⚠️'}</Text>
      <Text style={styles.toastText}>{mensaje}</Text>
    </Animated.View>
  );
}

// ── Componente Notificación Visual (simulación realista) ───────────────────
function NotificacionModal({ 
  visible, 
  titulo, 
  mensaje, 
  onClose 
}: { 
  visible: boolean; 
  titulo: string; 
  mensaje: string; 
  onClose: () => void;
}) {
  const scale = useRef(new Animated.Value(0.3)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
      
      // Auto cerrar después de 4 segundos
      setTimeout(onClose, 4000);
    } else {
      Animated.parallel([
        Animated.timing(scale, { toValue: 0.3, duration: 200, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  const ahora = new Date();
  const hora = `${ahora.getHours()}:${ahora.getMinutes().toString().padStart(2, '0')}`;

  return (
    <View style={styles.notifModalOverlay}>
      <Animated.View style={[styles.notifModalCard, { opacity, transform: [{ scale }] }]}>
        <View style={styles.notifModalHeader}>
          <View style={styles.notifModalIconBox}>
            <Text style={styles.notifModalAppIcon}>💜</Text>
          </View>
          <View style={styles.notifModalHeaderText}>
            <Text style={styles.notifModalAppName}>Yape</Text>
            <Text style={styles.notifModalTime}>ahora • {hora}</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.notifModalClose}>
            <Text style={styles.notifModalCloseText}>✕</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.notifModalBody}>
          <Text style={styles.notifModalTitle}>{titulo}</Text>
          <Text style={styles.notifModalMessage}>{mensaje}</Text>
        </View>
        <View style={styles.notifModalFooter}>
          <TouchableOpacity style={styles.notifModalBtn} onPress={onClose}>
            <Text style={styles.notifModalBtnText}>Ver</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.notifModalBtnSecondary} onPress={onClose}>
            <Text style={styles.notifModalBtnSecondaryText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

// ── Pantalla principal ─────────────────────────────────────────────────────
export default function NotificacionesScreen() {
  const [permisoConcedido, setPermisoConcedido] = useState(false);
  const [cargandoPermiso, setCargandoPermiso] = useState(true);
  
  // Estado del formulario
  const [titulo, setTitulo] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [segundos, setSegundos] = useState('60');
  const [repetir, setRepetir] = useState(false);
  
  // Notificaciones programadas
  const [notificacionesProgramadas, setNotificacionesProgramadas] = useState<Notifications.NotificationRequest[]>([]);
  
  // Toast
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMensaje, setToastMensaje] = useState('');
  const [toastTipo, setToastTipo] = useState<'success' | 'error'>('success');
  
  // Modal de notificación visual
  const [notifModalVisible, setNotifModalVisible] = useState(false);
  const [notifModalTitulo, setNotifModalTitulo] = useState('');
  const [notifModalMensaje, setNotifModalMensaje] = useState('');
  
  // Listener de notificaciones
  const notificationListener = useRef<Notifications.EventSubscription | undefined>(undefined);
  const responseListener = useRef<Notifications.EventSubscription | undefined>(undefined);

  useEffect(() => {
    verificarPermisos();
    cargarNotificacionesProgramadas();

    // Listener para notificaciones recibidas
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('📬 Notificación recibida:', notification);
    });

    // Listener para respuestas a notificaciones
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('👆 Usuario interactuó con notificación:', response);
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  const verificarPermisos = async () => {
    setCargandoPermiso(true);
    try {
      // En web, simular permisos concedidos
      if (Platform.OS === 'web') {
        setPermisoConcedido(true);
        setCargandoPermiso(false);
        return;
      }
      
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      setPermisoConcedido(existingStatus === 'granted');
    } catch (error) {
      console.error('Error al verificar permisos:', error);
    } finally {
      setCargandoPermiso(false);
    }
  };

  const solicitarPermisos = async () => {
    try {
      // En web, simular permisos concedidos
      if (Platform.OS === 'web') {
        setPermisoConcedido(true);
        mostrarToast('✅ Permisos concedidos (simulación web)', 'success');
        return;
      }
      
      // En Android, crear un canal primero
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Notificaciones predeterminadas',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: YAPE_PURPLE,
        });
      }

      const { status } = await Notifications.requestPermissionsAsync();
      const concedido = status === 'granted';
      setPermisoConcedido(concedido);

      if (concedido) {
        mostrarToast('¡Permisos concedidos! 🎉', 'success');
      } else {
        mostrarToast('Permisos denegados. Actívalos desde Ajustes.', 'error');
      }
    } catch (error) {
      console.error('Error al solicitar permisos:', error);
      mostrarToast('Error al solicitar permisos', 'error');
    }
  };

  const cargarNotificacionesProgramadas = async () => {
    try {
      // En web no funciona getAllScheduledNotificationsAsync
      if (Platform.OS === 'web') {
        setNotificacionesProgramadas([]);
        return;
      }
      
      const notificaciones = await Notifications.getAllScheduledNotificationsAsync();
      setNotificacionesProgramadas(notificaciones);
    } catch (error) {
      console.error('Error al cargar notificaciones:', error);
    }
  };

  const programarNotificacionInmediata = async () => {
    if (!permisoConcedido) {
      mostrarToast('Debes conceder permisos primero', 'error');
      return;
    }

    if (Platform.OS === 'web') {
      // Simulación para web - mostrar notificación visual inmediata
      mostrarToast('✅ Notificación enviada', 'success');
      setTimeout(() => {
        mostrarNotificacion(
          '🔔 ¡Notificación inmediata!',
          'Esta es una notificación de prueba'
        );
      }, 500);
      return;
    }

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '¡Notificación inmediata! 🔔',
          body: 'Esta es una notificación de prueba',
          data: { screen: 'notificaciones' },
        },
        trigger: null, // Inmediata
      });

      mostrarToast('Notificación enviada inmediatamente', 'success');
    } catch (error) {
      console.error('Error:', error);
      mostrarToast('Error al enviar notificación', 'error');
    }
  };

  const programarNotificacion10s = async () => {
    if (!permisoConcedido) {
      mostrarToast('Debes conceder permisos primero', 'error');
      return;
    }

    if (Platform.OS === 'web') {
      // Simulación para web - programar notificación visual después de 10 segundos
      mostrarToast('⏱️ Notificación programada para 10 segundos', 'success');
      setTimeout(() => {
        mostrarNotificacion(
          '⏰ Han pasado 10 segundos',
          'Esta notificación se programó hace 10 segundos'
        );
      }, 10000);
      return;
    }

    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: '⏰ Han pasado 10 segundos',
          body: 'Esta notificación se programó hace 10 segundos',
        },
        trigger: {
          seconds: 10,
        },
      });

      console.log('✅ Notificación programada:', id);
      mostrarToast('Notificación programada para 10 segundos', 'success');
      await cargarNotificacionesProgramadas();
    } catch (error: any) {
      console.error('❌ Error completo:', error);
      console.error('❌ Mensaje:', error.message);
      mostrarToast(`Error: ${error.message || 'Desconocido'}`, 'error');
    }
  };

  const programarNotificacionDiaria = async () => {
    if (!permisoConcedido) {
      mostrarToast('Debes conceder permisos primero', 'error');
      return;
    }

    if (Platform.OS === 'web') {
      // Simulación para web
      mostrarToast('✅ Notificación diaria programada', 'success');
      setTimeout(() => {
        mostrarNotificacion(
          '🌅 Buenos días!',
          'Tu recordatorio diario a las 9:00 AM'
        );
      }, 1000);
      return;
    }

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🌅 Buenos días!',
          body: 'Tu recordatorio diario a las 9:00 AM',
          data: { tipo: 'diario' },
        },
        trigger: {
          hour: 9,
          minute: 0,
          repeats: true,
        },
      });

      mostrarToast('Notificación diaria programada a las 9:00 AM', 'success');
      await cargarNotificacionesProgramadas();
    } catch (error) {
      console.error('Error:', error);
      mostrarToast('Error al programar notificación diaria', 'error');
    }
  };

  const programarNotificacionPersonalizada = async () => {
    if (!permisoConcedido) {
      mostrarToast('Debes conceder permisos primero', 'error');
      return;
    }

    if (!titulo.trim() || !mensaje.trim()) {
      mostrarToast('Completa el título y mensaje', 'error');
      return;
    }

    const seg = parseInt(segundos);
    if (isNaN(seg) || seg < 1) {
      mostrarToast('Ingresa un tiempo válido (mínimo 1 segundo)', 'error');
      return;
    }

    // Validación: si es repetitiva, debe ser mínimo 60 segundos
    if (repetir && seg < 60) {
      mostrarToast('Las notificaciones repetitivas requieren mínimo 60 segundos', 'error');
      return;
    }

    if (Platform.OS === 'web') {
      // Simulación para web - programar notificación visual con mensaje personalizado
      const mensajeExito = repetir 
        ? `⏰ Notificación repetitiva cada ${seg}s programada` 
        : `⏰ Notificación programada para ${seg}s`;
      
      mostrarToast(mensajeExito, 'success');
      
      // Guardar los valores antes de limpiar
      const tituloGuardado = titulo;
      const mensajeGuardado = mensaje;
      
      // Programar la notificación visual con el mensaje del usuario
      setTimeout(() => {
        mostrarNotificacion(tituloGuardado, mensajeGuardado);
      }, seg * 1000);
      
      // Limpiar formulario
      setTitulo('');
      setMensaje('');
      setSegundos('60');
      setRepetir(false);
      return;
    }

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: titulo,
          body: mensaje,
          data: { tipo: 'personalizada' },
        },
        trigger: repetir 
          ? {
              seconds: seg,
              repeats: true,
            }
          : {
              seconds: seg,
            },
      });

      mostrarToast(
        repetir 
          ? `Notificación repetitiva programada cada ${seg}s` 
          : `Notificación programada para ${seg} segundos`,
        'success'
      );
      
      // Limpiar formulario
      setTitulo('');
      setMensaje('');
      setSegundos('60');
      setRepetir(false);
      
      await cargarNotificacionesProgramadas();
    } catch (error) {
      console.error('Error:', error);
      mostrarToast('Error al programar notificación', 'error');
    }
  };

  const cancelarNotificacion = async (identifier: string) => {
    try {
      await Notifications.cancelScheduledNotificationAsync(identifier);
      mostrarToast('Notificación cancelada', 'success');
      await cargarNotificacionesProgramadas();
    } catch (error) {
      console.error('Error:', error);
      mostrarToast('Error al cancelar notificación', 'error');
    }
  };

  const cancelarTodas = async () => {
    if (notificacionesProgramadas.length === 0) {
      mostrarToast('No hay notificaciones programadas', 'error');
      return;
    }

    Alert.alert(
      '¿Cancelar todas?',
      `Se cancelarán ${notificacionesProgramadas.length} notificación(es) programada(s)`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: async () => {
            try {
              await Notifications.cancelAllScheduledNotificationsAsync();
              mostrarToast('Todas las notificaciones canceladas', 'success');
              await cargarNotificacionesProgramadas();
            } catch (error) {
              console.error('Error:', error);
              mostrarToast('Error al cancelar notificaciones', 'error');
            }
          },
        },
      ]
    );
  };

  const mostrarToast = (msg: string, tipo: 'success' | 'error' = 'success') => {
    setToastMensaje(msg);
    setToastTipo(tipo);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 5000);  // 5 segundos para que sea más visible
  };

  const mostrarNotificacion = (titulo: string, mensaje: string) => {
    setNotifModalTitulo(titulo);
    setNotifModalMensaje(mensaje);
    setNotifModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor={YAPE_PURPLE_DARK} barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backIcon}>‹</Text>
          <Text style={styles.backText}>Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notificaciones 🔔</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView 
        style={styles.scroll} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Estado de permisos */}
        <View style={[styles.permisoCard, permisoConcedido ? styles.permisoCardSuccess : styles.permisoCardWarning]}>
          <View style={styles.permisoIconBox}>
            <Text style={styles.permisoIcon}>{permisoConcedido ? '✅' : '🔒'}</Text>
          </View>
          <View style={styles.permisoInfo}>
            <Text style={styles.permisoTitle}>
              {cargandoPermiso ? 'Verificando...' : permisoConcedido ? 'Permisos concedidos' : 'Permisos requeridos'}
            </Text>
            <Text style={styles.permisoSubtitle}>
              {permisoConcedido 
                ? 'Puedes recibir notificaciones locales' 
                : 'Se necesitan permisos para mostrar notificaciones'}
            </Text>
          </View>
          {!permisoConcedido && !cargandoPermiso && (
            <TouchableOpacity style={styles.permisoBtn} onPress={solicitarPermisos}>
              <Text style={styles.permisoBtnText}>Activar</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Acciones rápidas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Acciones rápidas</Text>
          <View style={styles.accionesGrid}>
            <TouchableOpacity 
              style={styles.accionBtn}
              onPress={programarNotificacionInmediata}
              disabled={!permisoConcedido}
            >
              <Text style={styles.accionBtnIcon}>🔔</Text>
              <Text style={styles.accionBtnText}>Inmediata</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.accionBtn}
              onPress={programarNotificacion10s}
              disabled={!permisoConcedido}
            >
              <Text style={styles.accionBtnIcon}>⏱️</Text>
              <Text style={styles.accionBtnText}>En 10s</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.accionBtn}
              onPress={programarNotificacionDiaria}
              disabled={!permisoConcedido}
            >
              <Text style={styles.accionBtnIcon}>🌅</Text>
              <Text style={styles.accionBtnText}>Diaria 9AM</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Formulario personalizado */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✏️ Notificación personalizada</Text>
          <View style={styles.formCard}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Título</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Ej: Recordatorio importante"
                placeholderTextColor={GRAY_TEXT}
                value={titulo}
                onChangeText={setTitulo}
                maxLength={50}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Mensaje</Text>
              <TextInput
                style={[styles.formInput, styles.formInputMulti]}
                placeholder="Ej: No olvides revisar tus tareas"
                placeholderTextColor={GRAY_TEXT}
                value={mensaje}
                onChangeText={setMensaje}
                multiline
                maxLength={100}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Tiempo (segundos)</Text>
              <TextInput
                style={styles.formInput}
                placeholder="60"
                placeholderTextColor={GRAY_TEXT}
                value={segundos}
                onChangeText={setSegundos}
                keyboardType="number-pad"
                maxLength={6}
              />
            </View>

            <View style={styles.formGroupRow}>
              <Text style={styles.formLabel}>Repetir notificación</Text>
              <Switch
                value={repetir}
                onValueChange={setRepetir}
                trackColor={{ false: GRAY_LIGHT, true: YAPE_PURPLE_LIGHT }}
                thumbColor={repetir ? YAPE_PURPLE : GRAY_TEXT}
              />
            </View>
            
            {repetir && (
              <View style={styles.warningBox}>
                <Text style={styles.warningIcon}>ℹ️</Text>
                <Text style={styles.warningText}>
                  Las notificaciones repetitivas requieren mínimo 60 segundos de intervalo.
                </Text>
              </View>
            )}

            <TouchableOpacity 
              style={[styles.btnPrimary, !permisoConcedido && styles.btnDisabled]}
              onPress={programarNotificacionPersonalizada}
              disabled={!permisoConcedido}
            >
              <Text style={styles.btnPrimaryIcon}>📅</Text>
              <Text style={styles.btnPrimaryText}>Programar notificación</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Lista de notificaciones programadas */}
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>
              📋 Programadas ({notificacionesProgramadas.length})
            </Text>
            {notificacionesProgramadas.length > 0 && (
              <TouchableOpacity onPress={cancelarTodas}>
                <Text style={styles.cancelarTodas}>Cancelar todas</Text>
              </TouchableOpacity>
            )}
          </View>

          {notificacionesProgramadas.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>📭</Text>
              <Text style={styles.emptyText}>No hay notificaciones programadas</Text>
              <Text style={styles.emptySubtext}>Programa una notificación usando las opciones arriba</Text>
            </View>
          ) : (
            <View style={styles.notificacionesList}>
              {notificacionesProgramadas.map((notif, index) => (
                <View 
                  key={notif.identifier} 
                  style={[
                    styles.notifItem,
                    index === notificacionesProgramadas.length - 1 && styles.notifItemLast
                  ]}
                >
                  <View style={styles.notifIcon}>
                    <Text style={styles.notifIconText}>🔔</Text>
                  </View>
                  <View style={styles.notifInfo}>
                    <Text style={styles.notifTitle} numberOfLines={1}>
                      {notif.content.title || 'Sin título'}
                    </Text>
                    <Text style={styles.notifBody} numberOfLines={2}>
                      {notif.content.body || 'Sin mensaje'}
                    </Text>
                    <Text style={styles.notifId}>ID: {notif.identifier.slice(0, 8)}...</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.notifCancelar}
                    onPress={() => cancelarNotificacion(notif.identifier)}
                  >
                    <Text style={styles.notifCancelarText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Info adicional */}
        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>💡</Text>
          <Text style={styles.infoText}>
            Las notificaciones locales funcionan incluso sin conexión a internet.
            Para notificaciones repetitivas en iOS, el intervalo debe ser de 60 segundos o más.
          </Text>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Modal de Notificación Visual */}
      <NotificacionModal
        visible={notifModalVisible}
        titulo={notifModalTitulo}
        mensaje={notifModalMensaje}
        onClose={() => setNotifModalVisible(false)}
      />

      {/* Toast */}
      <Toast visible={toastVisible} mensaje={toastMensaje} tipo={toastTipo} />
    </SafeAreaView>
  );
}

// ── Estilos ────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: YAPE_PURPLE_DARK },
  scroll: { flex: 1, backgroundColor: YAPE_BG },
  scrollContent: { paddingBottom: 16 },

  // Header
  header: {
    backgroundColor: YAPE_PURPLE_DARK,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', minWidth: 70 },
  backIcon: { color: WHITE, fontSize: 28, lineHeight: 30, marginRight: 2 },
  backText: { color: WHITE, fontSize: 15, fontWeight: '600' },
  headerTitle: { color: WHITE, fontSize: 18, fontWeight: 'bold', textAlign: 'center', flex: 1 },

  // Card de permisos
  permisoCard: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  permisoCardSuccess: { backgroundColor: GREEN_BG },
  permisoCardWarning: { backgroundColor: '#FFF3E0' },
  permisoIconBox: { 
    width: 48, 
    height: 48, 
    borderRadius: 24, 
    backgroundColor: WHITE, 
    alignItems: 'center', 
    justifyContent: 'center',
    marginRight: 12,
  },
  permisoIcon: { fontSize: 24 },
  permisoInfo: { flex: 1 },
  permisoTitle: { fontSize: 15, fontWeight: '700', color: GRAY_DARK, marginBottom: 2 },
  permisoSubtitle: { fontSize: 12, color: GRAY_TEXT, lineHeight: 16 },
  permisoBtn: {
    backgroundColor: YAPE_PURPLE,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  permisoBtnText: { color: WHITE, fontSize: 13, fontWeight: '600' },

  // Secciones
  section: { marginTop: 20, marginHorizontal: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: GRAY_DARK, marginBottom: 12 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },

  // Acciones rápidas
  accionesGrid: { flexDirection: 'row', gap: 12 },
  accionBtn: {
    flex: 1,
    backgroundColor: WHITE,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  accionBtnIcon: { fontSize: 32, marginBottom: 8 },
  accionBtnText: { fontSize: 12, fontWeight: '600', color: GRAY_DARK, textAlign: 'center' },

  // Formulario
  formCard: {
    backgroundColor: WHITE,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  formGroup: { marginBottom: 16 },
  formGroupRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  formLabel: { fontSize: 13, fontWeight: '600', color: GRAY_DARK, marginBottom: 8 },
  formInput: {
    backgroundColor: YAPE_BG,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: GRAY_DARK,
    borderWidth: 1,
    borderColor: GRAY_LIGHT,
  },
  formInputMulti: { minHeight: 72, textAlignVertical: 'top' },

  // Botones
  btnPrimary: {
    backgroundColor: YAPE_PURPLE,
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  btnDisabled: { backgroundColor: GRAY_LIGHT },
  btnPrimaryIcon: { fontSize: 18 },
  btnPrimaryText: { color: WHITE, fontSize: 15, fontWeight: 'bold' },

  // Lista de notificaciones
  notificacionesList: {
    backgroundColor: WHITE,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  notifItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: GRAY_LIGHT,
  },
  notifItemLast: { borderBottomWidth: 0 },
  notifIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: YAPE_BG,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notifIconText: { fontSize: 20 },
  notifInfo: { flex: 1 },
  notifTitle: { fontSize: 14, fontWeight: '600', color: GRAY_DARK, marginBottom: 2 },
  notifBody: { fontSize: 12, color: GRAY_TEXT, marginBottom: 4, lineHeight: 16 },
  notifId: { fontSize: 10, color: GRAY_TEXT },
  notifCancelar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: ERROR_RED,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifCancelarText: { color: WHITE, fontSize: 16, fontWeight: 'bold' },

  // Empty state
  emptyCard: {
    backgroundColor: WHITE,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 15, fontWeight: '600', color: GRAY_DARK, marginBottom: 4 },
  emptySubtext: { fontSize: 12, color: GRAY_TEXT, textAlign: 'center', lineHeight: 18 },

  // Info card
  infoCard: {
    marginHorizontal: 16,
    marginTop: 20,
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
  },
  infoIcon: { fontSize: 20 },
  infoText: { flex: 1, fontSize: 12, color: '#1565C0', lineHeight: 18 },

  // Warning box
  warningBox: {
    backgroundColor: '#FFF3E0',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  warningIcon: { fontSize: 18 },
  warningText: { flex: 1, fontSize: 12, color: '#E65100', lineHeight: 16 },

  // Cancelar todas
  cancelarTodas: { fontSize: 13, color: ERROR_RED, fontWeight: '600' },

  // Toast
  toast: {
    position: 'absolute',
    top: 60,  // CAMBIADO: Arriba en lugar de abajo
    left: 24,
    right: 24,
    backgroundColor: GREEN,
    borderRadius: 16,
    paddingVertical: 16,  // MÁS GRANDE
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,  // MÁS SOMBRA
    shadowRadius: 12,
    elevation: 12,
    zIndex: 9999,  // SIEMPRE ENCIMA
  },
  toastError: { backgroundColor: ERROR_RED },
  toastIcon: { fontSize: 24 },  // ICONO MÁS GRANDE
  toastText: { color: WHITE, fontSize: 15, fontWeight: '600', flex: 1, lineHeight: 22 },  // TEXTO MÁS GRANDE

  // Modal de Notificación Visual
  notifModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10000,
    paddingHorizontal: 24,
  },
  notifModalCard: {
    backgroundColor: WHITE,
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 20,
  },
  notifModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: GRAY_LIGHT,
  },
  notifModalIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: YAPE_BG,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notifModalAppIcon: { fontSize: 24 },
  notifModalHeaderText: { flex: 1 },
  notifModalAppName: { fontSize: 14, fontWeight: '700', color: GRAY_DARK },
  notifModalTime: { fontSize: 11, color: GRAY_TEXT, marginTop: 2 },
  notifModalClose: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: GRAY_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifModalCloseText: { fontSize: 16, color: GRAY_DARK, fontWeight: 'bold' },
  notifModalBody: {
    padding: 20,
  },
  notifModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: GRAY_DARK,
    marginBottom: 8,
  },
  notifModalMessage: {
    fontSize: 15,
    color: GRAY_TEXT,
    lineHeight: 22,
  },
  notifModalFooter: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: GRAY_LIGHT,
  },
  notifModalBtn: {
    flex: 1,
    backgroundColor: YAPE_PURPLE,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  notifModalBtnText: {
    color: WHITE,
    fontSize: 15,
    fontWeight: '600',
  },
  notifModalBtnSecondary: {
    flex: 1,
    backgroundColor: GRAY_LIGHT,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  notifModalBtnSecondaryText: {
    color: GRAY_DARK,
    fontSize: 15,
    fontWeight: '600',
  },
});
