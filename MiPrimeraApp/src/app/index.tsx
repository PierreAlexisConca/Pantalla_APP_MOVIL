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

import { useAuth } from '@/hooks/use-auth';
import { router } from 'expo-router';

// ─── Colores ──────────────────────────────────────────────────────────────────
const YAPE_PURPLE       = '#6C2D91';
const YAPE_PURPLE_DARK  = '#4A1E6B';
const YAPE_PURPLE_LIGHT = '#8B4DB5';
const YAPE_BG           = '#F5F0FA';
const WHITE             = '#FFFFFF';
const GRAY_LIGHT        = '#E8E0F0';
const GRAY_TEXT         = '#7A6B8A';
const GRAY_DARK         = '#2D1F3D';
const GREEN             = '#2E7D32';
const ERROR_RED         = '#D63B3B';

// ─── Tipos ────────────────────────────────────────────────────────────────────
type Pantalla = 'inicio' | 'yapear' | 'detalle';

export type Movimiento = {
  id: string;
  nombre: string;
  monto: string;
  hora: string;
  tipo: 'enviado' | 'recibido';
  emoji: string;
  descripcion: string;
  categoria: string;
  referencia: string;
  estado: string;
};

// ─── Datos ────────────────────────────────────────────────────────────────────
const MOVIMIENTOS: Movimiento[] = [
  { id: '1', nombre: 'Carlos Quispe',     monto: '-S/ 25.00',  hora: '10:32 AM', tipo: 'enviado',  emoji: '👤', descripcion: 'Pago de almuerzo compartido',   categoria: 'Alimentación',  referencia: 'YPE-2024-001', estado: 'Completado' },
  { id: '2', nombre: 'Supermercado Wong', monto: '-S/ 87.50',  hora: 'Ayer',     tipo: 'enviado',  emoji: '🛒', descripcion: 'Compras de la semana',          categoria: 'Supermercado',  referencia: 'YPE-2024-002', estado: 'Completado' },
  { id: '3', nombre: 'María Rodríguez',   monto: '+S/ 50.00',  hora: 'Ayer',     tipo: 'recibido', emoji: '👤', descripcion: 'Pago de deuda pendiente',       categoria: 'Transferencia', referencia: 'YPE-2024-003', estado: 'Completado' },
  { id: '4', nombre: 'Rappi',             monto: '-S/ 32.90',  hora: 'Lun',      tipo: 'enviado',  emoji: '🛵', descripcion: 'Pedido de comida a domicilio',  categoria: 'Delivery',      referencia: 'YPE-2024-004', estado: 'Completado' },
  { id: '5', nombre: 'Ana Torres',        monto: '+S/ 120.00', hora: 'Dom',      tipo: 'recibido', emoji: '👤', descripcion: 'Reembolso de pasajes',          categoria: 'Transferencia', referencia: 'YPE-2024-005', estado: 'Completado' },
];

const CONTACTOS = [
  { id: '1', nombre: 'Carlos Quispe',   emoji: '👤', telefono: '987-654-321' },
  { id: '2', nombre: 'María Rodríguez', emoji: '👩', telefono: '912-345-678' },
  { id: '3', nombre: 'Ana Torres',      emoji: '👧', telefono: '945-123-456' },
  { id: '4', nombre: 'Luis Mamani',     emoji: '👦', telefono: '978-000-111' },
  { id: '5', nombre: 'Rosa Huanca',     emoji: '🧑', telefono: '933-222-333' },
];

const ACCIONES = [
  { id: '1', icono: '📱', label: 'Recargas', accion: null },
  { id: '2', icono: '💡', label: 'Servicios', accion: null },
  { id: '3', icono: '🔔', label: 'Notificaciones', accion: 'notificaciones' },
  { id: '4', icono: '🏦', label: 'Bancos', accion: null },
  { id: '5', icono: '🛡️', label: 'Seguros', accion: null },
  { id: '6', icono: '➕', label: 'Ver más', accion: null },
];

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ visible, mensaje }: { visible: boolean; mensaje: string }) {
  const opacity    = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity,    { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacity,    { toValue: 0, duration: 400, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 40, duration: 400, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  return (
    <Animated.View style={[styles.toast, { opacity, transform: [{ translateY }] }]} pointerEvents="none">
      <Text style={styles.toastIcon}>✅</Text>
      <Text style={styles.toastText}>{mensaje}</Text>
    </Animated.View>
  );
}

// ─── Pantalla principal ───────────────────────────────────────────────────────
export default function YapeHomeScreen() {
  const { usuario, logout } = useAuth();

  // ── Navegación interna ──
  const [pantalla, setPantalla]               = useState<Pantalla>('inicio');
  const [movActivo, setMovActivo]             = useState<Movimiento | null>(null);

  // ── Inicio ──
  const [saldoVisible, setSaldoVisible]       = useState(false);

  // ── Yapear ──
  const [contactoSel, setContactoSel]         = useState<string | null>(null);
  const [monto, setMonto]                     = useState('');
  const [mensajeYape, setMensajeYape]         = useState('');
  const [errorYape, setErrorYape]             = useState('');
  const [toastVisible, setToastVisible]       = useState(false);
  const [toastMsg, setToastMsg]               = useState('');

  const irA = (p: Pantalla, mov?: Movimiento) => {
    setMovActivo(mov ?? null);
    setPantalla(p);
  };

  const mostrarToast = (msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => {
      setToastVisible(false);
      setTimeout(() => {
        // Resetear estado yapear y volver al inicio
        setContactoSel(null);
        setMonto('');
        setMensajeYape('');
        setErrorYape('');
        irA('inicio');
      }, 500);
    }, 2500);
  };

  const handleYapear = () => {
    setErrorYape('');
    if (!contactoSel) { setErrorYape('Selecciona un contacto para yapear.'); return; }
    const num = parseFloat(monto.replace(',', '.'));
    if (!monto || isNaN(num) || num <= 0) { setErrorYape('Ingresa un monto válido mayor a S/ 0.'); return; }
    if (num > 500) { setErrorYape('El monto máximo por operación es S/ 500.'); return; }
    const contacto = CONTACTOS.find((c) => c.id === contactoSel);
    mostrarToast(`¡Yapeo exitoso! S/ ${num.toFixed(2)} enviado a ${contacto?.nombre}`);
  };

  // ════════════════════════════════════════════════════════
  //  PANTALLA: YAPEAR
  // ════════════════════════════════════════════════════════
  if (pantalla === 'yapear') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar backgroundColor={YAPE_PURPLE_DARK} barStyle="light-content" />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => irA('inicio')}>
            <Text style={styles.backIcon}>‹</Text>
            <Text style={styles.backText}>Inicio</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Yapear 💜</Text>
          <View style={styles.backBtn} />
        </View>

        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

            {/* Monto */}
            <View style={styles.montoHero}>
              <Text style={styles.montoLabel}>¿Cuánto quieres yapear?</Text>
              <View style={styles.montoInputRow}>
                <Text style={styles.montoPrefix}>S/</Text>
                <TextInput
                  style={styles.montoInput}
                  placeholder="0.00"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={monto}
                  onChangeText={(t) => { setMonto(t.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1')); setErrorYape(''); }}
                  keyboardType="decimal-pad"
                  maxLength={7}
                  accessibilityLabel="Monto a yapear"
                />
              </View>
              <View style={styles.montoAtajos}>
                {['10', '20', '50', '100'].map((v) => (
                  <TouchableOpacity key={v} style={[styles.atajoBtn, monto === v && styles.atajoBtnActive]} onPress={() => { setMonto(v); setErrorYape(''); }}>
                    <Text style={[styles.atajoText, monto === v && styles.atajoTextActive]}>S/{v}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Contactos */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Selecciona un contacto</Text>
              <View style={styles.contactosList}>
                {CONTACTOS.map((c, i) => {
                  const activo = contactoSel === c.id;
                  return (
                    <TouchableOpacity
                      key={c.id}
                      style={[styles.contactoItem, activo && styles.contactoItemActive, i === CONTACTOS.length - 1 && styles.contactoItemLast]}
                      onPress={() => { setContactoSel(c.id); setErrorYape(''); }}
                    >
                      <View style={[styles.contactoAvatar, activo && styles.contactoAvatarActive]}>
                        <Text style={styles.contactoEmoji}>{c.emoji}</Text>
                      </View>
                      <View style={styles.contactoInfo}>
                        <Text style={[styles.contactoNombre, activo && styles.contactoNombreActive]}>{c.nombre}</Text>
                        <Text style={styles.contactoTel}>{c.telefono}</Text>
                      </View>
                      {activo && <View style={styles.checkBadge}><Text style={styles.checkIcon}>✓</Text></View>}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Mensaje */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Mensaje (opcional)</Text>
              <TextInput
                style={styles.mensajeInput}
                placeholder="Ej: Para el almuerzo 🍱"
                placeholderTextColor={GRAY_TEXT}
                value={mensajeYape}
                onChangeText={setMensajeYape}
                multiline
                maxLength={60}
                accessibilityLabel="Mensaje opcional"
              />
              <Text style={styles.charCount}>{mensajeYape.length}/60</Text>
            </View>

            {/* Error */}
            {errorYape ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorIcon}>⚠️</Text>
                <Text style={styles.errorText}>{errorYape}</Text>
              </View>
            ) : null}

            {/* Resumen */}
            {contactoSel && monto && !errorYape ? (
              <View style={styles.resumenCard}>
                <Text style={styles.resumenTitle}>Resumen</Text>
                <View style={styles.resumenRow}>
                  <Text style={styles.resumenLabel}>Para</Text>
                  <Text style={styles.resumenValue}>{CONTACTOS.find((c) => c.id === contactoSel)?.nombre}</Text>
                </View>
                <View style={styles.resumenRow}>
                  <Text style={styles.resumenLabel}>Monto</Text>
                  <Text style={[styles.resumenValue, styles.resumenMonto]}>S/ {monto}</Text>
                </View>
                {mensajeYape ? (
                  <View style={styles.resumenRow}>
                    <Text style={styles.resumenLabel}>Mensaje</Text>
                    <Text style={styles.resumenValue}>{mensajeYape}</Text>
                  </View>
                ) : null}
              </View>
            ) : null}

            {/* Botón */}
            <TouchableOpacity style={styles.yapearBtn} onPress={handleYapear} activeOpacity={0.85} accessibilityRole="button">
              <Text style={styles.yapearBtnIcon}>💜</Text>
              <Text style={styles.yapearBtnText}>Yapear ahora</Text>
            </TouchableOpacity>

            {/* Flujo */}
            <View style={styles.flujoBar}>
              <View style={styles.flujoStep}><Text style={styles.flujoStepText}>Login</Text></View>
              <Text style={styles.flujoArrow}>›</Text>
              <View style={[styles.flujoStep, styles.flujoStepDone]}><Text style={styles.flujoStepText}>Inicio</Text></View>
              <Text style={styles.flujoArrow}>›</Text>
              <View style={[styles.flujoStep, styles.flujoStepActive]}><Text style={[styles.flujoStepText, styles.flujoStepTextActive]}>Yapear</Text></View>
            </View>
            <View style={{ height: 32 }} />
          </ScrollView>
        </KeyboardAvoidingView>

        <Toast visible={toastVisible} mensaje={toastMsg} />
      </SafeAreaView>
    );
  }

  // ════════════════════════════════════════════════════════
  //  PANTALLA: DETALLE
  // ════════════════════════════════════════════════════════
  if (pantalla === 'detalle' && movActivo) {
    const m = movActivo;
    const esRecibido = m.tipo === 'recibido';
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar backgroundColor={YAPE_PURPLE_DARK} barStyle="light-content" />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => irA('inicio')}>
            <Text style={styles.backIcon}>‹</Text>
            <Text style={styles.backText}>Inicio</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Información Específica</Text>
          <View style={styles.backBtn} />
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Hero */}
          <View style={styles.detalleHero}>
            <View style={styles.detalleAvatarCircle}>
              <Text style={{ fontSize: 36 }}>{m.emoji}</Text>
            </View>
            <Text style={styles.detalleNombre}>{m.nombre}</Text>
            <View style={[styles.montoPill, { backgroundColor: esRecibido ? '#E8F5E9' : '#FFEBEE' }]}>
              <Text style={[styles.detalleMonto, { color: esRecibido ? GREEN : ERROR_RED }]}>{m.monto}</Text>
            </View>
            <View style={styles.estadoBadge}>
              <Text style={styles.estadoBadgeText}>✓ {m.estado}</Text>
            </View>
          </View>

          {/* Detalles transacción */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Detalles de la transacción</Text>
            <View style={styles.detailCard}>
              {[
                { icon: '📋', label: 'Descripción', value: m.descripcion },
                { icon: '🏷️', label: 'Categoría',  value: m.categoria },
                { icon: '🔖', label: 'Referencia',  value: m.referencia },
              ].map((row, i, arr) => (
                <View key={row.label} style={[styles.row, i === arr.length - 1 && styles.rowLast]}>
                  <View style={styles.rowLeft}>
                    <Text style={styles.rowIcon}>{row.icon}</Text>
                    <Text style={styles.rowLabel}>{row.label}</Text>
                  </View>
                  <Text style={styles.rowValue}>{row.value}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Información contacto */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información del contacto</Text>
            <View style={styles.detailCard}>
              {[
                { icon: '👤', label: 'Nombre', value: m.nombre },
                { icon: '🕐', label: 'Fecha',  value: m.hora },
                { icon: esRecibido ? '📥' : '📤', label: 'Tipo', value: esRecibido ? 'Dinero recibido' : 'Dinero enviado' },
              ].map((row, i, arr) => (
                <View key={row.label} style={[styles.row, i === arr.length - 1 && styles.rowLast]}>
                  <View style={styles.rowLeft}>
                    <Text style={styles.rowIcon}>{row.icon}</Text>
                    <Text style={styles.rowLabel}>{row.label}</Text>
                  </View>
                  <Text style={styles.rowValue}>{row.value}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Acciones */}
          <View style={styles.section}>
            <TouchableOpacity style={styles.yapearBtn}>
              <Text style={styles.yapearBtnIcon}>🔁</Text>
              <Text style={styles.yapearBtnText}>Repetir operación</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.yapearBtn, styles.btnSecundario]}>
              <Text style={styles.yapearBtnIcon}>📤</Text>
              <Text style={[styles.yapearBtnText, { color: YAPE_PURPLE }]}>Compartir comprobante</Text>
            </TouchableOpacity>
          </View>

          {/* Flujo */}
          <View style={styles.flujoBar}>
            <View style={styles.flujoStep}><Text style={styles.flujoStepText}>Login</Text></View>
            <Text style={styles.flujoArrow}>›</Text>
            <View style={[styles.flujoStep, styles.flujoStepDone]}><Text style={styles.flujoStepText}>Inicio</Text></View>
            <Text style={styles.flujoArrow}>›</Text>
            <View style={[styles.flujoStep, styles.flujoStepActive]}><Text style={[styles.flujoStepText, styles.flujoStepTextActive]}>Detalle</Text></View>
          </View>
          <View style={{ height: 32 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ════════════════════════════════════════════════════════
  //  PANTALLA: INICIO (Dashboard)
  // ════════════════════════════════════════════════════════
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor={YAPE_PURPLE_DARK} barStyle="light-content" />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.headerDashboard}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerGreeting}>¡Hola, {usuario}! 👋</Text>
              <Text style={styles.headerSub}>BCP · **** 4821</Text>
            </View>
            <TouchableOpacity style={styles.logoutBtn} onPress={logout} accessibilityLabel="Cerrar sesión">
              <Text style={styles.logoutIcon}>🚪</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Saldo disponible</Text>
            <View style={styles.balanceRow}>
              <Text style={styles.balanceAmount}>{saldoVisible ? 'S/ 1,250.80' : 'S/ ••••••'}</Text>
              <TouchableOpacity style={styles.eyeBtn} onPress={() => setSaldoVisible(!saldoVisible)}>
                <Text style={styles.eyeIcon}>{saldoVisible ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.mainActions}>
              <TouchableOpacity style={styles.actionBtnPrimary} onPress={() => irA('yapear')} accessibilityRole="button" accessibilityLabel="Yapear">
                <Text style={styles.actionBtnIcon}>💜</Text>
                <Text style={styles.actionBtnLabelPrimary}>Yapear</Text>
              </TouchableOpacity>
              <View style={styles.actionDivider} />
              <TouchableOpacity style={styles.actionBtnPrimary}>
                <Text style={styles.actionBtnIcon}>📲</Text>
                <Text style={styles.actionBtnLabelPrimary}>Cobrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Acciones rápidas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acciones rápidas</Text>
          <View style={styles.actionsGrid}>
            {ACCIONES.map((a) => (
              <TouchableOpacity 
                key={a.id} 
                style={styles.accionItem}
                onPress={() => {
                  if (a.accion === 'notificaciones') {
                    router.push('/notificaciones');
                  }
                }}
              >
                <View style={styles.accionIconBox}><Text style={styles.accionEmoji}>{a.icono}</Text></View>
                <Text style={styles.accionLabel}>{a.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Banner promo */}
        <View style={styles.promoBanner}>
          <View style={styles.promoText}>
            <Text style={styles.promoTitle}>¡Gana hasta S/ 50!</Text>
            <Text style={styles.promoSubtitle}>Invita amigos y gana beneficios exclusivos</Text>
            <TouchableOpacity style={styles.promoBtn}><Text style={styles.promoBtnText}>Invitar ahora</Text></TouchableOpacity>
          </View>
          <Text style={styles.promoEmoji}>🎁</Text>
        </View>

        {/* Movimientos */}
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Últimos movimientos</Text>
            <TouchableOpacity><Text style={styles.verTodos}>Ver todos</Text></TouchableOpacity>
          </View>
          <View style={styles.movimientosList}>
            {MOVIMIENTOS.map((m, index) => (
              <TouchableOpacity
                key={m.id}
                style={[styles.movimientoItem, index === MOVIMIENTOS.length - 1 && styles.movimientoItemLast]}
                onPress={() => irA('detalle', m)}
                accessibilityRole="button"
                accessibilityLabel={`Ver detalle de ${m.nombre}`}
              >
                <View style={styles.movAvatar}><Text style={styles.movAvatarText}>{m.emoji}</Text></View>
                <View style={styles.movInfo}>
                  <Text style={styles.movNombre}>{m.nombre}</Text>
                  <Text style={styles.movHora}>{m.hora}</Text>
                </View>
                <View style={styles.movRight}>
                  <Text style={[styles.movMonto, m.tipo === 'recibido' ? styles.montoRecibido : styles.montoEnviado]}>{m.monto}</Text>
                  <Text style={styles.chevron}>›</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Flujo */}
        <View style={styles.flujoBar}>
          <View style={styles.flujoStep}><Text style={styles.flujoStepText}>Login</Text></View>
          <Text style={styles.flujoArrow}>›</Text>
          <View style={[styles.flujoStep, styles.flujoStepActive]}><Text style={[styles.flujoStepText, styles.flujoStepTextActive]}>Inicio</Text></View>
          <Text style={styles.flujoArrow}>›</Text>
          <View style={styles.flujoStep}><Text style={styles.flujoStepText}>Detalle</Text></View>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea:       { flex: 1, backgroundColor: YAPE_PURPLE_DARK },
  scroll:         { flex: 1, backgroundColor: YAPE_BG },
  scrollContent:  { paddingBottom: 16 },

  // Header genérico (Yapear / Detalle)
  header: {
    backgroundColor: YAPE_PURPLE_DARK,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backBtn:   { flexDirection: 'row', alignItems: 'center', minWidth: 70 },
  backIcon:  { color: WHITE, fontSize: 28, lineHeight: 30, marginRight: 2 },
  backText:  { color: WHITE, fontSize: 15, fontWeight: '600' },
  headerTitle: { color: WHITE, fontSize: 16, fontWeight: 'bold', textAlign: 'center', flex: 1 },

  // Header Dashboard
  headerDashboard: {
    backgroundColor: YAPE_PURPLE_DARK,
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 28,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerGreeting: { fontSize: 20, fontWeight: 'bold', color: WHITE },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 2 },
  logoutBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  logoutIcon: { fontSize: 20 },

  // Balance
  balanceCard:   { backgroundColor: YAPE_PURPLE, borderRadius: 20, padding: 20 },
  balanceLabel:  { color: 'rgba(255,255,255,0.75)', fontSize: 13, marginBottom: 6 },
  balanceRow:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  balanceAmount: { color: WHITE, fontSize: 30, fontWeight: 'bold', letterSpacing: 0.5 },
  eyeBtn:        { padding: 6, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20 },
  eyeIcon:       { fontSize: 18 },

  // Botones principales
  mainActions:         { flexDirection: 'row', backgroundColor: YAPE_PURPLE_LIGHT, borderRadius: 14, overflow: 'hidden' },
  actionBtnPrimary:    { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 13, gap: 8 },
  actionBtnIcon:       { fontSize: 18 },
  actionBtnLabelPrimary: { color: WHITE, fontSize: 16, fontWeight: 'bold' },
  actionDivider:       { width: 1, backgroundColor: 'rgba(255,255,255,0.25)', marginVertical: 10 },

  // Sections
  section:    { marginTop: 20, marginHorizontal: 16 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: GRAY_DARK, marginBottom: 12 },
  verTodos:   { fontSize: 14, color: YAPE_PURPLE, fontWeight: '600' },

  // Acciones rápidas
  actionsGrid:  { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  accionItem:   { width: '30%', alignItems: 'center', gap: 6 },
  accionIconBox: { width: 56, height: 56, borderRadius: 16, backgroundColor: WHITE, alignItems: 'center', justifyContent: 'center', elevation: 3 },
  accionEmoji:  { fontSize: 26 },
  accionLabel:  { fontSize: 11, color: GRAY_TEXT, fontWeight: '500', textAlign: 'center' },

  // Banner
  promoBanner:  { marginHorizontal: 16, marginTop: 20, backgroundColor: YAPE_PURPLE, borderRadius: 20, padding: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  promoText:    { flex: 1, marginRight: 12 },
  promoTitle:   { color: WHITE, fontSize: 17, fontWeight: 'bold', marginBottom: 4 },
  promoSubtitle:{ color: 'rgba(255,255,255,0.8)', fontSize: 12, marginBottom: 12, lineHeight: 17 },
  promoBtn:     { backgroundColor: WHITE, borderRadius: 20, paddingVertical: 7, paddingHorizontal: 16, alignSelf: 'flex-start' },
  promoBtnText: { color: YAPE_PURPLE, fontWeight: 'bold', fontSize: 13 },
  promoEmoji:   { fontSize: 52 },

  // Movimientos
  movimientosList:    { backgroundColor: WHITE, borderRadius: 16, overflow: 'hidden', elevation: 2 },
  movimientoItem:     { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: GRAY_LIGHT },
  movimientoItemLast: { borderBottomWidth: 0 },
  movAvatar:          { width: 44, height: 44, borderRadius: 22, backgroundColor: GRAY_LIGHT, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  movAvatarText:      { fontSize: 20 },
  movInfo:            { flex: 1 },
  movNombre:          { fontSize: 14, fontWeight: '600', color: GRAY_DARK, marginBottom: 2 },
  movHora:            { fontSize: 12, color: GRAY_TEXT },
  movRight:           { flexDirection: 'row', alignItems: 'center', gap: 4 },
  movMonto:           { fontSize: 15, fontWeight: 'bold' },
  montoEnviado:       { color: ERROR_RED },
  montoRecibido:      { color: GREEN },
  chevron:            { fontSize: 20, color: GRAY_TEXT },

  // Flujo
  flujoBar:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 24, marginHorizontal: 16, gap: 8 },
  flujoStep:          { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: GRAY_LIGHT },
  flujoStepDone:      { backgroundColor: '#D4EDDA' },
  flujoStepActive:    { backgroundColor: YAPE_PURPLE },
  flujoStepText:      { fontSize: 12, fontWeight: '600', color: GRAY_TEXT },
  flujoStepTextActive:{ color: WHITE },
  flujoArrow:         { fontSize: 16, color: GRAY_TEXT },

  // Yapear - monto hero
  montoHero:     { backgroundColor: YAPE_PURPLE_DARK, alignItems: 'center', paddingVertical: 28, paddingHorizontal: 24, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  montoLabel:    { color: 'rgba(255,255,255,0.7)', fontSize: 14, marginBottom: 12 },
  montoInputRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 },
  montoPrefix:   { color: 'rgba(255,255,255,0.6)', fontSize: 28, fontWeight: '300' },
  montoInput:    { color: WHITE, fontSize: 48, fontWeight: 'bold', minWidth: 120, textAlign: 'center', borderBottomWidth: 2, borderBottomColor: 'rgba(255,255,255,0.4)', paddingBottom: 4 },
  montoAtajos:   { flexDirection: 'row', gap: 10 },
  atajoBtn:      { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' },
  atajoBtnActive:{ backgroundColor: WHITE },
  atajoText:     { color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: '600' },
  atajoTextActive:{ color: YAPE_PURPLE },

  // Contactos
  contactosList:       { backgroundColor: WHITE, borderRadius: 16, overflow: 'hidden', elevation: 2 },
  contactoItem:        { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: GRAY_LIGHT },
  contactoItemLast:    { borderBottomWidth: 0 },
  contactoItemActive:  { backgroundColor: '#FAF0FF' },
  contactoAvatar:      { width: 44, height: 44, borderRadius: 22, backgroundColor: GRAY_LIGHT, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  contactoAvatarActive:{ backgroundColor: YAPE_PURPLE_LIGHT },
  contactoEmoji:       { fontSize: 22 },
  contactoInfo:        { flex: 1 },
  contactoNombre:      { fontSize: 14, fontWeight: '600', color: GRAY_DARK },
  contactoNombreActive:{ color: YAPE_PURPLE },
  contactoTel:         { fontSize: 12, color: GRAY_TEXT, marginTop: 2 },
  checkBadge:          { width: 26, height: 26, borderRadius: 13, backgroundColor: YAPE_PURPLE, alignItems: 'center', justifyContent: 'center' },
  checkIcon:           { color: WHITE, fontSize: 14, fontWeight: 'bold' },

  // Mensaje
  mensajeInput: { backgroundColor: WHITE, borderRadius: 12, borderWidth: 1.5, borderColor: GRAY_LIGHT, padding: 14, fontSize: 14, color: GRAY_DARK, minHeight: 72, textAlignVertical: 'top' },
  charCount:    { textAlign: 'right', fontSize: 11, color: GRAY_TEXT, marginTop: 4 },

  // Error
  errorBox:  { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF0F0', borderRadius: 10, padding: 12, marginHorizontal: 16, marginTop: 12, gap: 8 },
  errorIcon: { fontSize: 16 },
  errorText: { color: ERROR_RED, fontSize: 13, flex: 1 },

  // Resumen
  resumenCard:  { marginHorizontal: 16, marginTop: 16, backgroundColor: WHITE, borderRadius: 14, padding: 16, borderLeftWidth: 4, borderLeftColor: YAPE_PURPLE, elevation: 2 },
  resumenTitle: { fontSize: 13, fontWeight: '700', color: YAPE_PURPLE, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  resumenRow:   { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  resumenLabel: { fontSize: 13, color: GRAY_TEXT },
  resumenValue: { fontSize: 13, color: GRAY_DARK, fontWeight: '600' },
  resumenMonto: { color: YAPE_PURPLE, fontSize: 15 },

  // Botón yapear / acción
  yapearBtn: { backgroundColor: YAPE_PURPLE, borderRadius: 16, paddingVertical: 16, marginHorizontal: 16, marginTop: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, elevation: 6 },
  btnSecundario: { backgroundColor: WHITE, borderWidth: 1.5, borderColor: YAPE_PURPLE, elevation: 0, marginTop: 12 },
  yapearBtnIcon: { fontSize: 22 },
  yapearBtnText: { color: WHITE, fontSize: 17, fontWeight: 'bold' },

  // Detalle hero
  detalleHero:        { backgroundColor: YAPE_PURPLE_DARK, alignItems: 'center', paddingTop: 8, paddingBottom: 32, paddingHorizontal: 24, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  detalleAvatarCircle:{ width: 80, height: 80, borderRadius: 40, backgroundColor: YAPE_PURPLE_LIGHT, alignItems: 'center', justifyContent: 'center', marginBottom: 12, borderWidth: 3, borderColor: 'rgba(255,255,255,0.3)' },
  detalleNombre:      { color: WHITE, fontSize: 20, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' },
  montoPill:          { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, marginBottom: 10 },
  detalleMonto:       { fontSize: 28, fontWeight: 'bold', letterSpacing: 0.5 },
  estadoBadge:        { paddingHorizontal: 14, paddingVertical: 5, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)' },
  estadoBadgeText:    { color: WHITE, fontSize: 12, fontWeight: '600' },

  // Detalle card
  detailCard: { backgroundColor: WHITE, borderRadius: 16, overflow: 'hidden', elevation: 2 },
  row:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: GRAY_LIGHT },
  rowLast:    { borderBottomWidth: 0 },
  rowLeft:    { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  rowIcon:    { fontSize: 18 },
  rowLabel:   { fontSize: 14, color: GRAY_TEXT, fontWeight: '500' },
  rowValue:   { fontSize: 14, color: GRAY_DARK, fontWeight: '600', textAlign: 'right', flexShrink: 1, marginLeft: 12 },

  // Toast
  toast: { position: 'absolute', bottom: 40, left: 24, right: 24, backgroundColor: GREEN, borderRadius: 16, paddingVertical: 14, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 12, elevation: 12 },
  toastIcon: { fontSize: 22 },
  toastText: { color: WHITE, fontSize: 14, fontWeight: '600', flex: 1, lineHeight: 20 },
});
