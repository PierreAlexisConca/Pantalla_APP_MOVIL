import { useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

// ─── Colores de marca Yape ────────────────────────────────────────────────────
const YAPE_PURPLE = '#6C2D91';
const YAPE_PURPLE_DARK = '#4A1E6B';
const YAPE_PURPLE_LIGHT = '#8B4DB5';
const YAPE_ACCENT = '#FF6B35';
const YAPE_BG = '#F5F0FA';
const WHITE = '#FFFFFF';
const GRAY_LIGHT = '#E8E0F0';
const GRAY_TEXT = '#7A6B8A';
const GRAY_DARK = '#2D1F3D';

// ─── Datos de ejemplo ─────────────────────────────────────────────────────────
const MOVIMIENTOS = [
  { id: '1', nombre: 'Carlos Quispe',   monto: '-S/ 25.00', hora: '10:32 AM', tipo: 'enviado',  emoji: '👤' },
  { id: '2', nombre: 'Supermercado Wong', monto: '-S/ 87.50', hora: 'Ayer',     tipo: 'enviado',  emoji: '🛒' },
  { id: '3', nombre: 'María Rodríguez', monto: '+S/ 50.00', hora: 'Ayer',     tipo: 'recibido', emoji: '👤' },
  { id: '4', nombre: 'Rappi',           monto: '-S/ 32.90', hora: 'Lun',      tipo: 'enviado',  emoji: '🛵' },
  { id: '5', nombre: 'Ana Torres',      monto: '+S/ 120.00',hora: 'Dom',      tipo: 'recibido', emoji: '👤' },
];

const ACCIONES = [
  { id: '1', icono: '📱', label: 'Recargas' },
  { id: '2', icono: '💡', label: 'Servicios' },
  { id: '3', icono: '🎟️', label: 'Entretenimiento' },
  { id: '4', icono: '🏦', label: 'Bancos' },
  { id: '5', icono: '🛡️', label: 'Seguros' },
  { id: '6', icono: '➕', label: 'Ver más' },
];

// ─── Componente principal ─────────────────────────────────────────────────────
export default function YapeHomeScreen() {
  const [saldoVisible, setSaldoVisible] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor={YAPE_PURPLE_DARK} barStyle="light-content" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── HEADER ── */}
        <View style={styles.header}>
          {/* Fila superior: saludo + notificación */}
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerGreeting}>¡Hola, Pierre! 👋</Text>
              <Text style={styles.headerSub}>BCP · **** 4821</Text>
            </View>
            <TouchableOpacity style={styles.notifBtn}>
              <Text style={styles.notifIcon}>🔔</Text>
              <View style={styles.notifBadge}>
                <Text style={styles.notifBadgeText}>3</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Tarjeta de saldo */}
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Saldo disponible</Text>
            <View style={styles.balanceRow}>
              <Text style={styles.balanceAmount}>
                {saldoVisible ? 'S/ 1,250.80' : 'S/ ••••••'}
              </Text>
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setSaldoVisible(!saldoVisible)}
              >
                <Text style={styles.eyeIcon}>{saldoVisible ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>

            {/* Botones principales */}
            <View style={styles.mainActions}>
              <TouchableOpacity style={styles.actionBtnPrimary}>
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

        {/* ── ACCIONES RÁPIDAS ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acciones rápidas</Text>
          <View style={styles.actionsGrid}>
            {ACCIONES.map((a) => (
              <TouchableOpacity key={a.id} style={styles.accionItem}>
                <View style={styles.accionIconBox}>
                  <Text style={styles.accionEmoji}>{a.icono}</Text>
                </View>
                <Text style={styles.accionLabel}>{a.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── BANNER PROMO ── */}
        <View style={styles.promoBanner}>
          <View style={styles.promoText}>
            <Text style={styles.promoTitle}>¡Gana hasta S/ 50!</Text>
            <Text style={styles.promoSubtitle}>
              Invita amigos y gana beneficios exclusivos
            </Text>
            <TouchableOpacity style={styles.promoBtn}>
              <Text style={styles.promoBtnText}>Invitar ahora</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.promoEmoji}>🎁</Text>
        </View>

        {/* ── ÚLTIMOS MOVIMIENTOS ── */}
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Últimos movimientos</Text>
            <TouchableOpacity>
              <Text style={styles.verTodos}>Ver todos</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.movimientosList}>
            {MOVIMIENTOS.map((m) => (
              <View key={m.id} style={styles.movimientoItem}>
                {/* Avatar */}
                <View style={styles.movAvatar}>
                  <Text style={styles.movAvatarText}>{m.emoji}</Text>
                </View>
                {/* Info */}
                <View style={styles.movInfo}>
                  <Text style={styles.movNombre}>{m.nombre}</Text>
                  <Text style={styles.movHora}>{m.hora}</Text>
                </View>
                {/* Monto */}
                <Text
                  style={[
                    styles.movMonto,
                    m.tipo === 'recibido' ? styles.montoRecibido : styles.montoEnviado,
                  ]}
                >
                  {m.monto}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Espacio al fondo para el tab bar */}
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Estilos ─────────────────────────────────────────────────────────────────
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
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 28,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerGreeting: {
    fontSize: 20,
    fontWeight: 'bold',
    color: WHITE,
  },
  headerSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.65)',
    marginTop: 2,
  },
  notifBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifIcon: { fontSize: 20 },
  notifBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: YAPE_ACCENT,
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifBadgeText: { color: WHITE, fontSize: 9, fontWeight: 'bold' },

  // Balance card
  balanceCard: {
    backgroundColor: YAPE_PURPLE,
    borderRadius: 20,
    padding: 20,
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    marginBottom: 6,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  balanceAmount: {
    color: WHITE,
    fontSize: 30,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  eyeBtn: {
    padding: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
  },
  eyeIcon: { fontSize: 18 },

  // Main action buttons
  mainActions: {
    flexDirection: 'row',
    backgroundColor: YAPE_PURPLE_LIGHT,
    borderRadius: 14,
    overflow: 'hidden',
  },
  actionBtnPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    gap: 8,
  },
  actionBtnIcon: { fontSize: 18 },
  actionBtnLabelPrimary: {
    color: WHITE,
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.25)',
    marginVertical: 10,
  },

  // Sections
  section: {
    marginTop: 20,
    marginHorizontal: 16,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: GRAY_DARK,
    marginBottom: 12,
  },
  verTodos: {
    fontSize: 14,
    color: YAPE_PURPLE,
    fontWeight: '600',
  },

  // Acciones rápidas grid
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  accionItem: {
    width: '30%',
    alignItems: 'center',
    gap: 6,
  },
  accionIconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: WHITE,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: YAPE_PURPLE,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  accionEmoji: { fontSize: 26 },
  accionLabel: {
    fontSize: 11,
    color: GRAY_TEXT,
    fontWeight: '500',
    textAlign: 'center',
  },

  // Banner promo
  promoBanner: {
    marginHorizontal: 16,
    marginTop: 20,
    backgroundColor: YAPE_PURPLE,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  promoText: { flex: 1, marginRight: 12 },
  promoTitle: {
    color: WHITE,
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  promoSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginBottom: 12,
    lineHeight: 17,
  },
  promoBtn: {
    backgroundColor: WHITE,
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  promoBtnText: {
    color: YAPE_PURPLE,
    fontWeight: 'bold',
    fontSize: 13,
  },
  promoEmoji: { fontSize: 52 },

  // Movimientos
  movimientosList: {
    backgroundColor: WHITE,
    borderRadius: 16,
    overflow: 'hidden',
  },
  movimientoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: GRAY_LIGHT,
  },
  movAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: GRAY_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  movAvatarText: { fontSize: 20 },
  movInfo: { flex: 1 },
  movNombre: {
    fontSize: 14,
    fontWeight: '600',
    color: GRAY_DARK,
    marginBottom: 2,
  },
  movHora: { fontSize: 12, color: GRAY_TEXT },
  movMonto: { fontSize: 15, fontWeight: 'bold' },
  montoEnviado: { color: '#D63B3B' },
  montoRecibido: { color: '#2E7D32' },
});
