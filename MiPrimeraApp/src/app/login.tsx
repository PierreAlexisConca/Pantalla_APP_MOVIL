import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useAuth } from '@/hooks/use-auth';

// ── Credenciales válidas ───────────────────────────────────────────────────
const USUARIO_VALIDO  = 'Pierre';
const PASSWORD_VALIDA = 'Alexis123';

// ── Colores ────────────────────────────────────────────────────────────────
const YAPE_PURPLE       = '#6C2D91';
const YAPE_PURPLE_DARK  = '#4A1E6B';
const YAPE_PURPLE_LIGHT = '#8B4DB5';
const WHITE             = '#FFFFFF';
const GRAY_LIGHT        = '#E8E0F0';
const GRAY_TEXT         = '#7A6B8A';
const ERROR_RED         = '#D63B3B';

export default function LoginScreen() {
  const { login } = useAuth();

  const [usuario, setUsuario]         = useState('');
  const [password, setPassword]       = useState('');
  const [mostrarPass, setMostrarPass] = useState(false);
  const [error, setError]             = useState('');
  const [cargando, setCargando]       = useState(false);

  const handleLogin = () => {
    setError('');

    if (!usuario.trim() || !password.trim()) {
      setError('Por favor completa todos los campos.');
      return;
    }

    setCargando(true);
    setTimeout(() => {
      setCargando(false);
      if (usuario === USUARIO_VALIDO && password === PASSWORD_VALIDA) {
        login(usuario);
      } else {
        setError('Usuario o contraseña incorrectos.');
      }
    }, 800);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor={YAPE_PURPLE_DARK} barStyle="light-content" />

      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* ── CABECERA ── */}
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoEmoji}>💜</Text>
          </View>
          <Text style={styles.appName}>Yape</Text>
          <Text style={styles.tagline}>Tu billetera digital</Text>
        </View>

        {/* ── FORMULARIO ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Pantalla de Acceso</Text>
          <Text style={styles.cardSubtitle}>Ingresa tus credenciales para continuar</Text>

          {/* Campo usuario */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Usuario</Text>
            <View style={[styles.inputRow, error ? styles.inputRowError : null]}>
              <Text style={styles.inputIcon}>👤</Text>
              <TextInput
                style={styles.input}
                placeholder="Ingresa tu usuario"
                placeholderTextColor={GRAY_TEXT}
                value={usuario}
                onChangeText={(t) => { setUsuario(t); setError(''); }}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
                accessibilityLabel="Campo de usuario"
              />
            </View>
          </View>

          {/* Campo contraseña */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contraseña</Text>
            <View style={[styles.inputRow, error ? styles.inputRowError : null]}>
              <Text style={styles.inputIcon}>🔒</Text>
              <TextInput
                style={styles.input}
                placeholder="Ingresa tu contraseña"
                placeholderTextColor={GRAY_TEXT}
                value={password}
                onChangeText={(t) => { setPassword(t); setError(''); }}
                secureTextEntry={!mostrarPass}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
                accessibilityLabel="Campo de contraseña"
              />
              <TouchableOpacity
                onPress={() => setMostrarPass(!mostrarPass)}
                accessibilityLabel={mostrarPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                <Text style={styles.eyeIcon}>{mostrarPass ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Mensaje de error */}
          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorIcon}>⚠️</Text>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Botón ingresar */}
          <TouchableOpacity
            style={[styles.loginBtn, cargando && styles.loginBtnDisabled]}
            onPress={handleLogin}
            disabled={cargando}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Botón ingresar"
          >
            {cargando ? (
              <ActivityIndicator color={WHITE} />
            ) : (
              <Text style={styles.loginBtnText}>Ingresar</Text>
            )}
          </TouchableOpacity>

          {/* Hint de credenciales */}
          <View style={styles.hintBox}>
            <Text style={styles.hintTitle}>📋 Credenciales de prueba</Text>
            <Text style={styles.hintText}>
              Usuario: <Text style={styles.hintBold}>Pierre</Text>
            </Text>
            <Text style={styles.hintText}>
              Contraseña: <Text style={styles.hintBold}>Alexis123</Text>
            </Text>
          </View>
        </View>

        {/* ── PIE ── */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Flujo:{' '}
            <Text style={styles.footerBold}>Login</Text>
            {'  ›  '}
            <Text style={styles.footerMuted}>Inicio</Text>
            {'  ›  '}
            <Text style={styles.footerMuted}>Detalle</Text>
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── Estilos ────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: YAPE_PURPLE_DARK,
  },
  kav: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: YAPE_PURPLE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoEmoji: { fontSize: 40 },
  appName: {
    fontSize: 34,
    fontWeight: 'bold',
    color: WHITE,
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.65)',
    marginTop: 4,
  },
  card: {
    backgroundColor: WHITE,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: YAPE_PURPLE_DARK,
    textAlign: 'center',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: GRAY_TEXT,
    textAlign: 'center',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: YAPE_PURPLE_DARK,
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: GRAY_LIGHT,
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: '#FAF7FD',
  },
  inputRowError: {
    borderColor: ERROR_RED,
  },
  inputIcon: { fontSize: 18, marginRight: 8 },
  input: {
    flex: 1,
    height: 48,
    fontSize: 15,
    color: YAPE_PURPLE_DARK,
  },
  eyeIcon: { fontSize: 20, padding: 4 },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0F0',
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
    gap: 8,
  },
  errorIcon: { fontSize: 16 },
  errorText: { color: ERROR_RED, fontSize: 13, flex: 1 },
  loginBtn: {
    backgroundColor: YAPE_PURPLE,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 4,
    shadowColor: YAPE_PURPLE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  loginBtnDisabled: { opacity: 0.7 },
  loginBtnText: {
    color: WHITE,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  hintBox: {
    marginTop: 18,
    backgroundColor: '#F5F0FA',
    borderRadius: 10,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: YAPE_PURPLE_LIGHT,
  },
  hintTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: YAPE_PURPLE,
    marginBottom: 4,
  },
  hintText: { fontSize: 12, color: GRAY_TEXT },
  hintBold: { fontWeight: '700', color: YAPE_PURPLE_DARK },
  footer: { alignItems: 'center', marginTop: 24 },
  footerText: { fontSize: 13, color: 'rgba(255,255,255,0.5)' },
  footerBold: { color: WHITE, fontWeight: 'bold' },
  footerMuted: { color: 'rgba(255,255,255,0.4)' },
});
