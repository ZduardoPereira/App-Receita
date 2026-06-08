import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    ActivityIndicator, Alert, TextInput, Image,
} from "react-native";
import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { getLatestPlan, PlanResponse } from "../plan/plan.api";
import { getProfile, updateProfile, UserProfile } from "../services/profile.api";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/AppStack";
import { COLORS, SHADOW } from "../theme";
import * as ImagePicker from "expo-image-picker";

const GOAL_LABEL: Record<string, string>      = { gain: "Ganhar peso", lose: "Perder peso", maintain: "Manter peso" };
const TRAINING_LABEL: Record<string, string>  = { hypertrophy: "Hipertrofia", strength: "Força" };
const INTENSITY_LABEL: Record<string, string> = { light: "Leve", moderate: "Moderado", intense: "Intenso" };

export function ProfileScreen() {
    const { userId } = useAuth();
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

    const [plan, setPlan]       = useState<PlanResponse | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    // Edição de nome
    const [editingName, setEditingName] = useState(false);
    const [nameInput, setNameInput]     = useState('');
    const [savingName, setSavingName]   = useState(false);

    useEffect(() => {
        if (!userId) return;
        Promise.all([
            getLatestPlan(userId),
            getProfile(userId),
        ]).then(([planData, profileData]) => {
            setPlan(planData);
            setProfile(profileData);
            setNameInput(profileData.display_name ?? '');
        }).finally(() => setLoading(false));
    }, [userId]);

    async function pickAvatar() {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert("Permissão negada", "Precisamos de acesso à galeria para trocar a foto.");
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.6,
        });
        if (!result.canceled && userId) {
            const uri = result.assets[0].uri;
            const updated = await updateProfile(userId, { avatarUri: uri });
            setProfile(updated);
        }
    }

    async function saveName() {
        if (!userId) return;
        setSavingName(true);
        try {
            const updated = await updateProfile(userId, { displayName: nameInput.trim() || undefined });
            setProfile(updated);
            setEditingName(false);
        } catch {
            Alert.alert("Erro", "Não foi possível salvar o nome");
        } finally {
            setSavingName(false);
        }
    }

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    const displayName = profile?.display_name ?? profile?.email ?? 'Usuário';
    const initials    = displayName.substring(0, 2).toUpperCase();

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

            {/* ── Avatar + nome ──────────────────────────────────────────── */}
            <View style={[styles.profileCard, SHADOW]}>
                <TouchableOpacity style={styles.avatarBox} onPress={pickAvatar} activeOpacity={0.8}>
                    {profile?.avatar_uri ? (
                        <Image source={{ uri: profile.avatar_uri }} style={styles.avatar} />
                    ) : (
                        <View style={[styles.avatar, styles.avatarPlaceholder]}>
                            <Text style={styles.avatarInitials}>{initials}</Text>
                        </View>
                    )}
                    <View style={styles.cameraBtn}>
                        <Text style={{ fontSize: 12 }}>+</Text>
                    </View>
                </TouchableOpacity>

                {editingName ? (
                    <View style={styles.nameEdit}>
                        <TextInput
                            value={nameInput}
                            onChangeText={setNameInput}
                            placeholder="Seu nome"
                            placeholderTextColor={COLORS.textMuted}
                            style={styles.nameInput}
                            autoFocus
                        />
                        <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                            <TouchableOpacity
                                style={[styles.nameBtn, { backgroundColor: COLORS.primary }]}
                                onPress={saveName}
                                disabled={savingName}
                            >
                                <Text style={{ color: '#fff', fontWeight: '700' }}>
                                    {savingName ? '...' : 'Salvar'}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.nameBtn, { backgroundColor: COLORS.border }]}
                                onPress={() => { setEditingName(false); setNameInput(profile?.display_name ?? ''); }}
                            >
                                <Text style={{ color: COLORS.text, fontWeight: '600' }}>Cancelar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    <View style={styles.nameRow}>
                        <Text style={styles.displayName}>{displayName}</Text>
                        <TouchableOpacity style={styles.editNameBtn} onPress={() => setEditingName(true)}>
                            <Text style={styles.editNameText}>Editar</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <Text style={styles.email}>{profile?.email}</Text>
            </View>

            {/* ── Plano alimentar ───────────────────────────────────────── */}
            {plan ? (
                <>
                    <Text style={styles.sectionLabel}>Plano Alimentar</Text>
                    <View style={styles.macroGrid}>
                        {[
                            { label: 'Calorias',    value: `${plan.calories}`, unit: 'kcal', color: COLORS.orange,  bg: COLORS.orangeLight },
                            { label: 'Proteína',    value: `${plan.protein}`,  unit: 'g',    color: COLORS.primary, bg: COLORS.primaryLight },
                            { label: 'Carboidrato', value: `${plan.carbs}`,    unit: 'g',    color: COLORS.blue,    bg: COLORS.blueLight },
                            { label: 'Gordura',     value: `${plan.fat}`,      unit: 'g',    color: COLORS.purple,  bg: COLORS.purpleLight },
                        ].map(m => (
                            <View key={m.label} style={[styles.macroCard, { backgroundColor: m.bg }, SHADOW]}>
                                <Text style={[styles.macroValue, { color: m.color }]}>{m.value}</Text>
                                <Text style={[styles.macroUnit,  { color: m.color }]}>{m.unit}</Text>
                                <Text style={styles.macroLabel}>{m.label}</Text>
                            </View>
                        ))}
                    </View>

                    <View style={[styles.waterCard, SHADOW]}>
                        <Text style={styles.waterValue}>{plan.water_ml} ml</Text>
                        <Text style={styles.waterLabel}>Água diária recomendada</Text>
                    </View>

                    <Text style={styles.sectionLabel}>Configurações do Plano</Text>
                    <View style={[styles.detailCard, SHADOW]}>
                        {([
                            plan.goal_weight   && { label: 'Objetivo',    value: GOAL_LABEL[plan.goal_weight]       ?? plan.goal_weight },
                            plan.goal_training && { label: 'Treino',      value: TRAINING_LABEL[plan.goal_training] ?? plan.goal_training },
                            plan.intensity     && { label: 'Intensidade', value: INTENSITY_LABEL[plan.intensity]    ?? plan.intensity },
                            plan.weight        && { label: 'Peso',        value: `${plan.weight} kg` },
                            plan.height        && { label: 'Altura',      value: `${plan.height} cm` },
                        ] as any[]).filter(Boolean).map((item: any, i: number, arr: any[]) => (
                            <View key={item.label} style={[styles.detailRow, i < arr.length - 1 && styles.detailBorder]}>
                                <Text style={styles.detailLabel}>{item.label}</Text>
                                <Text style={styles.detailValue}>{item.value}</Text>
                            </View>
                        ))}
                    </View>
                </>
            ) : (
                <View style={[styles.emptyPlan, SHADOW]}>
                    <Text style={styles.emptyTitle}>Nenhum plano ainda</Text>
                    <Text style={styles.emptyDesc}>Gere seu primeiro plano alimentar para ver as informações aqui.</Text>
                </View>
            )}

            <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('GeneratePlan')}>
                <Text style={styles.btnText}>{plan ? 'Atualizar Plano' : 'Gerar Plano'}</Text>
            </TouchableOpacity>

            <View style={{ height: 32 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container:       { flex: 1, padding: 20, backgroundColor: COLORS.bg },
    center:          { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.bg },
    profileCard:     { backgroundColor: COLORS.card, borderRadius: 16, padding: 20, alignItems: 'center', marginBottom: 24 },
    avatarBox:       { position: 'relative', marginBottom: 12 },
    avatar:          { width: 84, height: 84, borderRadius: 42 },
    avatarPlaceholder: { backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
    avatarInitials:  { fontSize: 30, fontWeight: '800', color: '#fff' },
    cameraBtn:       { position: 'absolute', bottom: 0, right: 0, width: 24, height: 24, borderRadius: 12, backgroundColor: COLORS.border, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
    nameRow:         { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
    displayName:     { fontSize: 20, fontWeight: '800', color: COLORS.text },
    editNameBtn:     { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1.5, borderColor: COLORS.border },
    editNameText:    { fontSize: 12, color: COLORS.textSecondary, fontWeight: '600' },
    email:           { fontSize: 13, color: COLORS.textMuted },
    nameEdit:        { width: '100%', marginBottom: 4 },
    nameInput:       { borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 10, padding: 10, fontSize: 15, color: COLORS.text, textAlign: 'center' },
    nameBtn:         { flex: 1, borderRadius: 8, padding: 8, alignItems: 'center' },
    sectionLabel:    { fontSize: 11, fontWeight: '700', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 10 },
    macroGrid:       { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 },
    macroCard:       { width: '47%', borderRadius: 14, padding: 14, alignItems: 'center' },
    macroValue:      { fontSize: 26, fontWeight: '800' },
    macroUnit:       { fontSize: 13, fontWeight: '600', marginTop: -2 },
    macroLabel:      { fontSize: 12, color: COLORS.textSecondary, marginTop: 4 },
    waterCard:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.blueLight, borderRadius: 14, padding: 16, marginBottom: 20 },
    waterValue:      { fontSize: 22, fontWeight: '800', color: COLORS.blue },
    waterLabel:      { fontSize: 13, color: COLORS.textSecondary },
    detailCard:      { backgroundColor: COLORS.card, borderRadius: 14, overflow: 'hidden', marginBottom: 20 },
    detailRow:       { flexDirection: 'row', justifyContent: 'space-between', padding: 14 },
    detailBorder:    { borderBottomWidth: 1, borderBottomColor: COLORS.border },
    detailLabel:     { color: COLORS.textSecondary, fontSize: 14 },
    detailValue:     { fontWeight: '700', color: COLORS.text, fontSize: 14 },
    emptyPlan:       { backgroundColor: COLORS.card, borderRadius: 14, padding: 20, alignItems: 'center', marginBottom: 16, gap: 8 },
    emptyTitle:      { fontSize: 16, fontWeight: '700', color: COLORS.text },
    emptyDesc:       { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center' },
    btn:             { backgroundColor: COLORS.primary, borderRadius: 12, padding: 15, alignItems: 'center' },
    btnText:         { color: '#fff', fontWeight: '700', fontSize: 16 },
});
