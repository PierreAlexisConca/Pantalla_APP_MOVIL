import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useDetalle } from '@/hooks/use-detalle';

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
const RED               = '#D63B3B';

export default function DetalleScreen() {
  const { movimientoActivo, cerrarDetalle } = useDetalle();

  if (!movimientoActivo) return null;

  const m = movimientoActivo;
  const esRecibido = m.tipo === 'recibido';
  const colorMonto = esRecibido ? GREEN : RED;
  const bgMonto    = esRecibido ? '#E8F5E9' : '#FFEBEE';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor={YAPE_PURPLE_DARK} barStyle="light-content" />

      {/* ── CABECERA ── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={cerrarDetalle}
          accessibilityRole="button"
          accessibilityLabel="Volver al inicio"
        >
          <Text style={styles.backIcon}>‹</Text>
          <Text style={styles.backText}>Inicio</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Información Específica</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── AVATAR + MONTO ── */}
        <View style={styles.heroCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarEmoji}>{m.emoji}</Text>
          </View>
          <Text style={styles.heroNombre}>{m.nombre}</Text>

          <View style={[styles.montoPill, { backgroundColor: bgMonto }]}>
            <Text style={[styles.heroMonto, { color: colorMonto }]}>{m.monto}</Text>
          </View>

          <View style={[styles.estadoBadge, styles.estadoCompletado]}>
            <Text style={styles.estadoBadgeText}>✓ {m.estado}</Text>
          </View>
        </View>

        {/* ── DETALLES DE LA TRANSACCIÓN ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detalles de la transacción</Text>
          <View style={styles.detailCard}>
            <DetalleRow icon="📋" label="Descripción"   value={m.descripcion} />
            <DetalleRow icon="🏷️" label="Categoría"    value={m.categoria} />
            <DetalleRow icon="🔖" label="Referencia"    value={m.referencia} last />
          </View>
        </View>

        {/* ── INFORMACIÓN DEL CONTACTO ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información del contacto</Text>
          <View style={styles.detailCard}>
            <DetalleRow icon="👤" label="Nombre"   value={m.nombre} />
            <DetalleRow icon="🕐" label="Fecha"    value={m.hora} />
            <DetalleRow
              icon={esRecibido ? '📥' : '📤'}
              label="Tipo"
              value={esRecibido ? 'Dinero recibido' : 'Dinero enviado'}
              last
            />
          </View>
        </View>

        {/* ── ACCIONES ── */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.actionBtn}>
            <Text style={styles.actionBtnIcon}>🔁</Text>
            <Text style={styles.actionBtnText}>Repetir operación</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.actionBtnSecondary]}>
            <Text style={styles.actionBtnIcon}>📤</Text>
            <Text style={[styles.actionBtnText, styles.actionBtnTextSecondary]}>
              Compartir comprobante
            </Text>
          </TouchableOpacity>
        </View>

        {/* Flujo de navegación (indicador visual) */}
        <View style={styles.flujoBar}>
          <View style={styles.flujoStep}>
            <Text style={styles.flujoStepText}>Login</Text>
          </View>
          <Text style={styles.flujoArrow}>›</Text>
          <View style={styles.flujoStep}>
            <Text style={styles.flujoStepText}>Inicio</Text>
          </View>
          <Text style={styles.flujoArrow}>›</Text>
          <View style={[styles.flujoStep, styles.flujoStepActive]}>
            <Text style={[styles.flujoStepText, styles.flujoStepTextActive]}>Detalle</Text>
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Componente fila de detalle ─────────────────────────────────────────────
type DetalleRowProps = {
  icon: string;
  label: string;
  value: string;
  last?: boolean;
};

function DetalleRow({ icon, label, value, last }: DetalleRowProps) {
  return (
    <View style={[styles.row, last && styles.rowLast]}>
      <View style={styles.rowLeft}>
        <Text style={styles.rowIcon}>{icon}</Text>
        <Text style={styles.rowLabel}>{label}</Text>
      </View>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
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
  backIcon: {
    color: WHITE,
    fontSize: 28,
    lineHeight: 30,
    marginRight: 2,
  },
  backText: {
    color: WHITE,
    fontSize: 15,
    fontWeight: '600',
  },
  headerTitle: {
    color: WHITE,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },

  // Hero card
  heroCard: {
    backgroundColor: YAPE_PURPLE_DARK,
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 32,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: YAPE_PURPLE_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarEmoji: { fontSize: 36 },
  heroNombre: {
    color: WHITE,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  montoPill: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 10,
  },
  heroMonto: {
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  estadoBadge: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 12,
  },
  estadoCompletado: {
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  estadoBadgeText: {
    color: WHITE,
    fontSize: 12,
    fontWeight: '600',
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

  // Detail card
  detailCard: {
    backgroundColor: WHITE,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: GRAY_LIGHT,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  rowIcon: { fontSize: 18 },
  rowLabel: {
    fontSize: 14,
    color: GRAY_TEXT,
    fontWeight: '500',
  },
  rowValue: {
    fontSize: 14,
    color: GRAY_DARK,
    fontWeight: '600',
    textAlign: 'right',
    flexShrink: 1,
    marginLeft: 12,
  },

  // Botones de acción
  actionBtn: {
    backgroundColor: YAPE_PURPLE,
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
    shadowColor: YAPE_PURPLE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  actionBtnSecondary: {
    backgroundColor: WHITE,
    borderWidth: 1.5,
    borderColor: YAPE_PURPLE,
    shadowOpacity: 0,
    elevation: 0,
  },
  actionBtnIcon: { fontSize: 18 },
  actionBtnText: {
    color: WHITE,
    fontSize: 15,
    fontWeight: 'bold',
  },
  actionBtnTextSecondary: {
    color: YAPE_PURPLE,
  },

  // Barra de flujo
  flujoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    marginHorizontal: 16,
    gap: 8,
  },
  flujoStep: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#D4EDDA',
  },
  flujoStepActive: {
    backgroundColor: YAPE_PURPLE,
  },
  flujoStepText: {
    fontSize: 12,
    fontWeight: '600',
    color: GRAY_TEXT,
  },
  flujoStepTextActive: {
    color: WHITE,
  },
  flujoArrow: {
    fontSize: 16,
    color: GRAY_TEXT,
  },
});
