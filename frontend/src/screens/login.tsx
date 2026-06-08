import {
    View, Text, StyleSheet, TouchableOpacity, Alert,
    ScrollView, KeyboardAvoidingView, Platform,
} from "react-native";
import { useAuth } from '../auth/AuthContext';
import { useState } from "react";
import { TextField } from "../components/TextField";
import { loginApi } from "../auth/auth.api";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { COLORS, SHADOW } from "../theme";

type AuthStackParamList = { Login: undefined; Register: undefined };

export function LoginScreen() {
    const { login } = useAuth();
    const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    async function onSubmit() {
        if (!email.includes('@') || !email.includes('.'))
            return Alert.alert('Erro', 'Email inválido');
        if (password.length < 6)
            return Alert.alert('Erro', 'Senha deve ter pelo menos 6 caracteres');

        setLoading(true);
        try {
            const data = await loginApi(email, password);
            login(data.user.id, data.token);
        } catch {
            Alert.alert('Erro', 'Email ou senha incorretos');
        } finally {
            setLoading(false);
        }
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: COLORS.bg }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                <View style={styles.header}>
                    <View style={styles.logoBox}>
                        <Text style={styles.logoLetter}>F</Text>
                    </View>
                    <Text style={styles.appName}>FitPlan</Text>
                    <Text style={styles.tagline}>Dieta e Treino Personalizado</Text>
                </View>

                <View style={[styles.card, SHADOW]}>
                    <Text style={styles.cardTitle}>Entrar na conta</Text>

                    <TextField
                        label="Email"
                        value={email}
                        onChangeText={setEmail}
                        placeholder="voce@exemplo.com"
                        keyboardType="email-address"
                    />
                    <TextField
                        label="Senha"
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Mínimo 6 caracteres"
                        secureTextEntry
                    />

                    <TouchableOpacity
                        style={[styles.btn, loading && styles.btnDisabled]}
                        onPress={onSubmit}
                        disabled={loading}
                    >
                        <Text style={styles.btnText}>{loading ? 'Entrando...' : 'Entrar'}</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Não tem conta? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                        <Text style={styles.link}>Cadastrar-se</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: COLORS.bg,
        padding: 24,
        justifyContent: 'center',
    },
    header: { alignItems: 'center', marginBottom: 36 },
    logoBox: {
        width: 72,
        height: 72,
        borderRadius: 20,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 14,
    },
    logoLetter: { fontSize: 34, fontWeight: '800', color: '#fff' },
    appName: { fontSize: 30, fontWeight: '800', color: COLORS.text, marginBottom: 6 },
    tagline: { fontSize: 14, color: COLORS.textMuted },
    card: {
        backgroundColor: COLORS.card,
        borderRadius: 16,
        padding: 24,
        marginBottom: 24,
    },
    cardTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 20 },
    btn: {
        backgroundColor: COLORS.primary,
        borderRadius: 10,
        padding: 15,
        alignItems: 'center',
        marginTop: 4,
    },
    btnDisabled: { opacity: 0.6 },
    btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
    footer: { flexDirection: 'row', justifyContent: 'center' },
    footerText: { color: COLORS.textSecondary, fontSize: 14 },
    link: { color: COLORS.primary, fontSize: 14, fontWeight: '700' },
});
