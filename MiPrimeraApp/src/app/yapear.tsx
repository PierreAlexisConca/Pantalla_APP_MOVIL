import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useYapear } from '@/hooks/use-yapear';

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

// ── Contactos de ejemplo ───────────────────────────────────────────────────
const CONTACTOS = [
  { id: '1', nombre: 'Carlos Quispe',   emoji: '👤', telefono: '987-654-321' },
  { id: '2', nombre: 'María Rodríguez', emoji: '👩', telefono: '912-345-678' },
  { id: '3', nombre: 'Ana Torres',      emoji: '👧', telefono: '945-123-456' },
  { id: '4', nombre: 'Luis Mamani',     emoji: '👦', telefono: '978-000-111' },
  { id: '5', nombre: 'Rosa Huanca',     emoji: '🧑', telefono: '933-222-333' },
];

// ── Componente Toast ───────────────────────────────────────────────────────
function Toast({ visible, mensaje }: { visible: boolean; mensaje: string }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity,     { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(translateY,  { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacity,     { toValue: 0, duration: 400, useNativeDriver: true }),
        Animated.timing(translateY,  { toValue: 30, duration: 400, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  return (
    <Animated.View
      style={[styles.toast, { opacity, transform: [{ translateY }] }]}
      pointerEvents="none"
    >
      <Text style={styles.toastIcon}>✅</Text>
      <Text style={styles.toastText}>{mensaje}</Text>
    </Animated.View>
  );
}

// ── Pantalla principal ─────────────────────────────────────────────────────
export default function YapearScreen() {
  const { cerrarYapear } = useYapear();

  const [contactoSeleccionado, setContactoSeleccionado] = useState<string | null>(null);
  const [monto, setMonto]         = useState('');
  const [mensaje, setMensaje]     = useState('');
  const [error, setError]         = useState('');
  const [toastVisible, setToastVisible]   = useState(false);
  const [toastMensaje, setToastMensaje]   = useState('');
  const [yaVolvio, setYaVolvio]           = useState(false);

  const mostrarToast = (msg: string) => {
    setToastMensaje(msg);
    setToastVisible(true);
    setTimeout(() => {
      setToastVisible(false);
      // Volver al inicio tras cerrar el toast
      setTimeout(() => cerrarYapear(), 500);
    }, 2500);
  };

  const handleYapear = () => {
    setError('');

    if (!contactoSeleccionado) {
      setError('Selecciona un contacto para yapear.');
      return;
    }
    const montoNum = parseFloat(monto.replace(',', '.'));
    if (!monto || isNaN(montoNum) || montoNum <= 0) {
      setError('Ingresa un monto válido mayor a S/ 0.');
      return;
    }
    if (montoNum > 500) {
      setError('El monto máximo por operación es S/ 500.');
      return;
    }

    const contacto = CONTACTOS.find((c) => c.id === contactoSeleccionado);
    mostrarToast(`¡Yapeo exitoso! S/ ${montoNum.toFixed(2)} enviado a ${contacto?.nombre}`);
  };

  const montoFormateado = monto ? `S/ ${monto}` : '';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor={YAPE_PURPLE_DARK} barStyle="light-content" />

      {/* ── CABECERA ── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={cerrarYapear}
          accessibilityRole="button"
          accessibilityLabel="Volver al inicio"
        >
          <Text style={styles.backIcon}>‹</Text>
          <Text style={styles.backText}>Inicio</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Yapear 💜</Text>
        <View style={styles.backBtn} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── MONTO DESTACADO ── */}
          <View style={styles.montoHero}>
            <Text style={styles.montoLabel}>¿Cuánto quieres yapear?</Text>
            <View style={styles.montoInputRow}>
              <Text style={styles.montoPrefix}>S/</Text>
              <TextInput
                style={styles.montoInput}
                placeholder="0.00"
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={monto}
                onChangeText={(t) => {
                  // Solo números y un punto decimal
                  const limpio = t.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
                  setMonto(limpio);
                  setError('');
                }}
                keyboardType="decimal-pad"
                maxLength={7}
                accessibilityLabel="Campo de monto a yapear"
              />
            </View>
            {/* Atajos de monto */}
            <View style={styles.montoAtajos}>
              {['10', '20', '50', '100'].map((v) => (
                <TouchableOpacity
                  key={v}
                  style={[styles.atajoBtn, monto === v && styles.atajoBtnActive]}
                  onPress={() => { setMonto(v); setError(''); }}
                  accessibilityRole="button"
                  accessibilityLabel={`Seleccionar monto ${v} soles`}
                >
                  <Text style={[styles.atajoText, monto === v && styles.atajoTextActive]}>
                    S/{v}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* ── SELECCIÓN DE CONTACTO ── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Selecciona un contacto</Text>
            <View style={styles.contactosList}>
              {CONTACTOS.map((c, index) => {
                const activo = contactoSeleccionado === c.id;
                return (
                  <TouchableOpacity
                    key={c.id}
                    style={[
                      styles.contactoItem,
                      activo && styles.contactoItemActive,
                      index === CONTACTOS.length - 1 && styles.contactoItemLast,
                    ]}
                    onPress={() => { setContactoSeleccionado(c.id); setError(''); }}
                    accessibilityRole="button"
                    accessibilityLabel={`Seleccionar contacto ${c.nombre}`}
                  >
                    <View style={[styles.contactoAvatar, activo && styles.contactoAvatarActive]}>
                      <Text style={styles.contactoEmoji}>{c.emoji}</Text>
                    </View>
                    <View style={styles.contactoInfo}>
                      <Text style={[styles.contactoNombre, activo && styles.contactoNombreActive]}>
                        {c.nombre}
                      </Text>
                      <Text style={styles.contactoTel}>{c.telefono}</Text>
                    </View>
                    {activo && (
                      <View style={styles.checkBadge}>
                        <Text style={styles.checkIcon}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* ── MENSAJE OPCIONAL ── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mensaje (opcional)</Text>
            <TextInput
              style={styles.mensajeInput}
              placeholder="Ej: Para el almuerzo 🍱"
              placeholderTextColor={GRAY_TEXT}
              value={mensaje}
              onChangeText={setMensaje}
              multiline
              maxLength={60}
              accessibilityLabel="Campo de mensaje opcional"
            />
            <Text style={styles.charCount}>{mensaje.length}/60</Text>
          </View>

          {/* ── ERROR ── */}
          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorIcon}>⚠️</Text>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* ── RESUMEN ── */}
          {contactoSeleccionado && monto && !error ? (
            <View style={styles.resumenCard}>
              <Text style={styles.resumenTitle}>Resumen</Text>
              <View style={styles.resumenRow}>
                <Text style={styles.resumenLabel}>Para</Text>
                <Text style={styles.resumenValue}>
                  {CONTACTOS.find((c) => c.id === contactoSeleccionado)?.nombre}
                </Text>
              </View>
              <View style={styles.resumenRow}>
                <Text style={styles.resumenLabel}>Monto</Text>
                <Text style={[styles.resumenValue, styles.resumenMonto]}>S/ {monto}</Text>
              </View>
              {mensaje ? (
                <View style={styles.resumenRow}>
                  <Text style={styles.resumenLabel}>Mensaje</Text>
                  <Text style={styles.resumenValue}>{mensaje}</Text>
                </View>
              ) : null}
            </View>
          ) : null}

          {/* ── BOTÓN YAPEAR ── */}
          <TouchableOpacity
            style={styles.yapearBtn}
            onPress={handleYapear}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Confirmar yapeo"
          >
            <Text style={styles.yapearBtnIcon}>💜</Text>
            <Text style={styles.yapearBtnText}>Yapear ahora</Text>
          </TouchableOpacity>

          {/* Flujo visual */}
          <View style={styles.flujoBar}>
            <View style={styles.flujoStep}><Text style={styles.flujoStepText}>Login</Text></View>
            <Text style={styles.flujoArrow}>›</Text>
            <View style={[styles.flujoStep, styles.flujoStepDone]}>
              <Text style={styles.flujoStepText}>Inicio</Text>
            </View>
            <Text style={styles.flujoArrow}>›</Text>
            <View style={[styles.flujoStep, styles.flujoStepActive]}>
              <Text style={[styles.flujoStepText, styles.flujoStepTextActive]}>Yapear</Text>
            </View>
          </View>

          <View style={{ height: 32 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── TOAST ── */}
      <Toast visible={toastVisible} mensaje={toastMensaje} />
    </SafeAreaView>
  );
}

// ── Estilos ────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: YAPE_PURPLE_DARK,
  },
  scroll: {
    flex: 1,
    backgroundColor: YAPE_BG,
  },
  scrollContent: {
    paddingBottom: 16,
  },

  // Header
  header: {
    backgroundColor: YAPE_PURPLE_DARK,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 70,
  },
  backIcon: { color: WHITE, fontSize: 28, lineHeight: 30, marginRight: 2 },
  backText:  { color: WHITE, fontSize: 15, fontWeight: '600' },
  headerTitle: {
    color: WHITE,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },

  // Monto hero
  montoHero: {
    backgroundColor: YAPE_PURPLE_DARK,
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  montoLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    marginBottom: 12,
  },
  montoInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  montoPrefix: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 28,
    fontWeight: '300',
  },
  montoInput: {
    color: WHITE,
    fontSize: 48,
    fontWeight: 'bold',
    minWidth: 120,
    textAlign: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(255,255,255,0.4)',
    paddingBottom: 4,
  },
  montoAtajos: {
    flexDirection: 'row',
    gap: 10,
  },
  atajoBtn: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  atajoBtnActive: {
    backgroundColor: WHITE,
  },
  atajoText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    fontWeight: '600',
  },
  atajoTextActive: {
    color: YAPE_PURPLE,
  },

  // Sections
  section: {
    marginTop: 20,
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: GRAY_DARK,
    marginBottom: 10,
  },

  // Contactos
  contactosList: {
    backgroundColor: WHITE,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  contactoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: GRAY_LIGHT,
  },
  contactoItemLast: { borderBottomWidth: 0 },
  contactoItemActive: { backgroundColor: '#FAF0FF' },
  contactoAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: GRAY_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  contactoAvatarActive: { backgroundColor: YAPE_PURPLE_LIGHT },
  contactoEmoji: { fontSize: 22 },
  contactoInfo: { flex: 1 },
  contactoNombre: { fontSize: 14, fontWeight: '600', color: GRAY_DARK },
  contactoNombreActive: { color: YAPE_PURPLE },
  contactoTel: { fontSize: 12, color: GRAY_TEXT, marginTop: 2 },
  checkBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: YAPE_PURPLE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkIcon: { color: WHITE, fontSize: 14, fontWeight: 'bold' },

  // Mensaje
  mensajeInput: {
    backgroundColor: WHITE,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: GRAY_LIGHT,
    padding: 14,
    fontSize: 14,
    color: GRAY_DARK,
    minHeight: 72,
    textAlignVertical: 'top',
  },
  charCount: {
    textAlign: 'right',
    fontSize: 11,
    color: GRAY_TEXT,
    marginTop: 4,
  },

  // Error
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0F0',
    borderRadius: 10,
    padding: 12,
    marginHorizontal: 16,
    marginTop: 12,
    gap: 8,
  },
  errorIcon: { fontSize: 16 },
  errorText: { color: ERROR_RED, fontSize: 13, flex: 1 },

  // Resumen
  resumenCard: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: WHITE,
    borderRadius: 14,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: YAPE_PURPLE,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  resumenTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: YAPE_PURPLE,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  resumenRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  resumenLabel: { fontSize: 13, color: GRAY_TEXT },
  resumenValue: { fontSize: 13, color: GRAY_DARK, fontWeight: '600' },
  resumenMonto: { color: YAPE_PURPLE, fontSize: 15 },

  // Botón yapear
  yapearBtn: {
    backgroundColor: YAPE_PURPLE,
    borderRadius: 16,
    paddingVertical: 16,
    marginHorizontal: 16,
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: YAPE_PURPLE,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  yapearBtnIcon: { fontSize: 22 },
  yapearBtnText: {
    color: WHITE,
    fontSize: 17,
    fontWeight: 'bold',
    letterSpacing: 0.3,
  },

  // Flujo visual
  flujoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    gap: 8,
  },
  flujoStep: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: GRAY_LIGHT,
  },
  flujoStepDone: { backgroundColor: '#D4EDDA' },
  flujoStepActive: { backgroundColor: YAPE_PURPLE },
  flujoStepText: { fontSize: 12, fontWeight: '600', color: GRAY_TEXT },
  flujoStepTextActive: { color: WHITE },
  flujoArrow: { fontSize: 16, color: GRAY_TEXT },

  // Toast
  toast: {
    position: 'absolute',
    bottom: 40,
    left: 24,
    right: 24,
    backgroundColor: GREEN,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 12,
  },
  toastIcon: { fontSize: 22 },
  toastText: {
    color: WHITE,
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    lineHeight: 20,
  },
});
