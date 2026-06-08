import {
    View, Text, StyleSheet, ScrollView, Image, TouchableOpacity,
    ActivityIndicator, StatusBar,
} from "react-native";
import { useState, useCallback } from "react";
import { useAuth } from "../auth/AuthContext";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/AppStack";
import { getProfile, UserProfile } from "../services/profile.api";
import { getWeightLogs, WeightLog } from "../services/weight.api";
import { getLatestPlan, PlanResponse } from "../plan/plan.api";
import { getTodayFoodLogs, getDailyFoodLogs, FoodLog, DailyCalories } from "../services/food-logs.api";
import { getSessions, WorkoutSession } from "../services/workout-sessions.api";
import { COLORS, SHADOW } from "../theme";

function toDateKey(d: Date) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getWeekDays(): Date[] {
    const now = new Date();
    const day = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((day + 6) % 7));
    monday.setHours(0, 0, 0, 0);
    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        return d;
    });
}

function calcWorkoutStreak(sessions: WorkoutSession[]): number {
    const dates = new Set(sessions.map(s => toDateKey(new Date(s.started_at))));
    const check = new Date();
    check.setHours(0, 0, 0, 0);
    if (!dates.has(toDateKey(check))) check.setDate(check.getDate() - 1);
    let streak = 0;
    while (dates.has(toDateKey(check))) {
        streak++;
        check.setDate(check.getDate() - 1);
    }
    return streak;
}

// Só conta um dia se houver registro de alimento E estiver dentro da meta.
// Hoje só entra no streak se todayLogCount > 0.
function calcCalorieStreak(
    daily: DailyCalories[],
    goal: number,
    todayTotal: number,
    todayLogCount: number,
): number {
    if (!goal) return 0;

    const byDate: Record<string, number> = {};
    daily.forEach(d => {
        const cal = Number(d.calories);
        if (cal > 0) byDate[d.date.slice(0, 10)] = cal;
    });

    const check = new Date();
    check.setHours(0, 0, 0, 0);
    const todayKey = toDateKey(check);

    // Injeta hoje apenas se realmente há logs
    if (todayLogCount > 0) byDate[todayKey] = todayTotal;

    // Se hoje não bate a meta, começa a contar de ontem
    if (!byDate[todayKey] || byDate[todayKey] > goal) {
        check.setDate(check.getDate() - 1);
    }

    let streak = 0;
    while (byDate[toDateKey(check)] !== undefined && byDate[toDateKey(check)] <= goal) {
        streak++;
        check.setDate(check.getDate() - 1);
    }
    return streak;
}

export default function HomeScreen() {
    const { userId, logout } = useAuth();
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

    const [profile,    setProfile]    = useState<UserProfile | null>(null);
    const [weights,    setWeights]    = useState<WeightLog[]>([]);
    const [plan,       setPlan]       = useState<PlanResponse | null>(null);
    const [todayLogs,  setTodayLogs]  = useState<FoodLog[]>([]);
    const [dailyCals,  setDailyCals]  = useState<DailyCalories[]>([]);
    const [sessions,   setSessions]   = useState<WorkoutSession[]>([]);
    const [loading,    setLoading]    = useState(true);

    useFocusEffect(useCallback(() => { load(); }, [userId]));

    async function load() {
        if (!userId) return;
        try {
            const [p, w, pl, s] = await Promise.all([
                getProfile(userId),
                getWeightLogs(userId),
                getLatestPlan(userId),
                getSessions(userId),
            ]);
            setProfile(p);
            setWeights(w);
            setPlan(pl);
            setSessions(s);
        } catch { /* silent */ }

        try {
            const [tl, dc] = await Promise.all([
                getTodayFoodLogs(userId),
                getDailyFoodLogs(userId, 30),
            ]);
            setTodayLogs(tl);
            setDailyCals(dc);
        } catch { /* silent */ }

        setLoading(false);
    }

    // ── Dados derivados ────────────────────────────────────────────────────────
    const firstName     = (profile?.display_name ?? profile?.email ?? "Usuário").split(" ")[0];
    const currentWeight = weights.length ? Number(weights[weights.length - 1].weight) : null;
    const firstWeight   = weights.length ? Number(weights[0].weight) : null;
    const weightDelta   = currentWeight != null && firstWeight != null ? currentWeight - firstWeight : null;

    const dailyGoal     = plan?.calories ?? 0;
    const todayConsumed = Math.round(todayLogs.reduce((s, l) => s + Number(l.calories), 0));
    const caloriePct    = dailyGoal > 0 ? Math.min(todayConsumed / dailyGoal, 1) : 0;

    const weekDays       = getWeekDays();
    const sessionDateSet = new Set(sessions.map(s => toDateKey(new Date(s.started_at))));
    const today          = toDateKey(new Date());

    const workoutStreak  = calcWorkoutStreak(sessions);
    const calorieStreak  = calcCalorieStreak(dailyCals, dailyGoal, todayConsumed, todayLogs.length);

    const weeklyGoal   = dailyGoal * 7;
    const weekStart    = weekDays[0];
    const weekConsumed = Math.round(
        dailyCals
            .filter(d => new Date(d.date) >= weekStart)
            .reduce((s, d) => s + Number(d.calories), 0)
    );

    // Mapa de dias em que a meta calórica foi atingida (para o calendário)
    const dietDayMap: Record<string, "met" | "over"> = {};
    if (dailyGoal > 0) {
        dailyCals.forEach(d => {
            const cal = Number(d.calories);
            if (cal > 0) dietDayMap[d.date.slice(0, 10)] = cal <= dailyGoal ? "met" : "over";
        });
        if (todayLogs.length > 0) {
            dietDayMap[today] = todayConsumed <= dailyGoal ? "met" : "over";
        }
    }

    const DAY_PT = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

                {/* ── Header ───────────────────────────────────────────── */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        {profile?.avatar_uri ? (
                            <Image source={{ uri: profile.avatar_uri }} style={styles.avatar} />
                        ) : (
                            <View style={[styles.avatar, styles.avatarPlaceholder]}>
                                <Text style={styles.avatarInitial}>
                                    {firstName.charAt(0).toUpperCase()}
                                </Text>
                            </View>
                        )}
                        <View style={{ marginLeft: 12 }}>
                            <Text style={styles.greeting}>Olá, {firstName}!</Text>
                            {currentWeight != null && (
                                <Text style={styles.weightLabel}>{currentWeight.toFixed(1)} kg</Text>
                            )}
                        </View>
                    </View>
                    <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
                        <Text style={styles.logoutText}>Sair</Text>
                    </TouchableOpacity>
                </View>

                {/* ── Streaks ───────────────────────────────────────────── */}
                <View style={styles.streakRow}>
                    <View style={[styles.streakCard, { backgroundColor: COLORS.orangeLight }]}>
                        <Text style={styles.streakIcon}>💪</Text>
                        <Text style={[styles.streakNum, { color: COLORS.orange }]}>{workoutStreak}</Text>
                        <Text style={[styles.streakLabel, { color: COLORS.orange }]}>dias de treino</Text>
                    </View>
                    <View style={[styles.streakCard, { backgroundColor: COLORS.primaryLight }]}>
                        <Text style={styles.streakIcon}>🔥</Text>
                        <Text style={[styles.streakNum, { color: COLORS.primary }]}>{calorieStreak}</Text>
                        <Text style={[styles.streakLabel, { color: COLORS.primary }]}>dias na meta</Text>
                    </View>
                    {weightDelta != null && (
                        <View style={[styles.streakCard, { backgroundColor: weightDelta <= 0 ? COLORS.primaryLight : COLORS.blueLight }]}>
                            <Text style={styles.streakIcon}>⚖️</Text>
                            <Text style={[styles.streakNum, { color: weightDelta <= 0 ? COLORS.primary : COLORS.blue }]}>
                                {weightDelta > 0 ? "+" : ""}{weightDelta.toFixed(1)}
                            </Text>
                            <Text style={[styles.streakLabel, { color: weightDelta <= 0 ? COLORS.primary : COLORS.blue }]}>kg total</Text>
                        </View>
                    )}
                </View>

                {/* ── Calorias do dia — sempre visível ─────────────────── */}
                <View style={[styles.card, SHADOW]}>
                    <View style={styles.cardRow}>
                        <Text style={styles.cardTitle}>🔥 Calorias Hoje</Text>
                        <Text style={styles.cardBadge}>
                            {todayConsumed}
                            {dailyGoal > 0 ? ` / ${dailyGoal} kcal` : " kcal"}
                        </Text>
                    </View>
                    {dailyGoal > 0 ? (
                        <>
                            <View style={styles.progressBg}>
                                <View style={[styles.progressFill, {
                                    width: `${caloriePct * 100}%` as any,
                                    backgroundColor: caloriePct >= 1 ? COLORS.red : COLORS.primary,
                                }]} />
                            </View>
                            <Text style={styles.progressSub}>
                                {todayConsumed >= dailyGoal
                                    ? (todayConsumed === dailyGoal ? "Meta diária atingida! 🎯" : `${todayConsumed - dailyGoal} kcal acima da meta`)
                                    : `Restam ${dailyGoal - todayConsumed} kcal`}
                            </Text>
                        </>
                    ) : (
                        <Text style={styles.progressSub}>
                            Gere um plano para ver sua meta calórica
                        </Text>
                    )}
                </View>

                {/* ── Calorias da semana — sempre visível ──────────────── */}
                <View style={[styles.card, SHADOW]}>
                    <View style={styles.cardRow}>
                        <Text style={styles.cardTitle}>📊 Calorias da Semana</Text>
                        <Text style={styles.cardBadge}>
                            {weekConsumed}
                            {weeklyGoal > 0 ? ` / ${weeklyGoal} kcal` : " kcal"}
                        </Text>
                    </View>
                    {weeklyGoal > 0 ? (
                        <View style={styles.progressBg}>
                            <View style={[styles.progressFill, {
                                width: `${Math.min(weekConsumed / weeklyGoal, 1) * 100}%` as any,
                                backgroundColor: weekConsumed > weeklyGoal ? COLORS.red : COLORS.blue,
                            }]} />
                        </View>
                    ) : (
                        <Text style={styles.progressSub}>Gere um plano para acompanhar a semana</Text>
                    )}
                </View>

                {/* ── Calendário semanal ────────────────────────────────── */}
                <View style={[styles.card, SHADOW]}>
                    <Text style={styles.cardTitle}>📅 Esta semana</Text>

                    {/* Legenda */}
                    <View style={styles.legend}>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: COLORS.primary }]} />
                            <Text style={styles.legendText}>Treino</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: COLORS.orange }]} />
                            <Text style={styles.legendText}>Dieta ok</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: COLORS.red }]} />
                            <Text style={styles.legendText}>Acima da meta</Text>
                        </View>
                    </View>

                    <View style={styles.weekRow}>
                        {weekDays.map((day, i) => {
                            const key     = toDateKey(day);
                            const trained = sessionDateSet.has(key);
                            const isToday = key === today;
                            const diet    = dietDayMap[key];
                            return (
                                <View key={key} style={styles.dayCol}>
                                    <Text style={[styles.dayName, isToday && { color: COLORS.primary }]}>
                                        {DAY_PT[i]}
                                    </Text>
                                    <View style={[
                                        styles.dayCircle,
                                        trained && styles.dayTrained,
                                        isToday && !trained && styles.dayToday,
                                    ]}>
                                        <Text style={[styles.dayNum, trained && { color: "#fff" }]}>
                                            {day.getDate()}
                                        </Text>
                                    </View>
                                    {/* Indicador de dieta */}
                                    <View style={[
                                        styles.dietDot,
                                        diet === "met"  && { backgroundColor: COLORS.orange },
                                        diet === "over" && { backgroundColor: COLORS.red },
                                        !diet           && { backgroundColor: "transparent" },
                                    ]} />
                                </View>
                            );
                        })}
                    </View>
                </View>

                {/* ── Atalhos rápidos ───────────────────────────────────── */}
                <View style={styles.quickRow}>
                    <TouchableOpacity
                        style={[styles.quickBtn, { backgroundColor: COLORS.orangeLight }]}
                        onPress={() => navigation.navigate("GeneratePlan")}
                    >
                        <Text style={[styles.quickIcon, { color: COLORS.orange }]}>📋</Text>
                        <Text style={[styles.quickLabel, { color: COLORS.orange }]}>Gerar Plano</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.quickBtn, { backgroundColor: COLORS.blueLight }]}
                        onPress={() => navigation.navigate("WeightTracker")}
                    >
                        <Text style={[styles.quickIcon, { color: COLORS.blue }]}>⚖️</Text>
                        <Text style={[styles.quickLabel, { color: COLORS.blue }]}>Registrar Peso</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ height: 20 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    center:            { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: COLORS.bg },
    scroll:            { padding: 20, paddingTop: 16 },

    header:            { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
    headerLeft:        { flexDirection: "row", alignItems: "center" },
    avatar:            { width: 52, height: 52, borderRadius: 26 },
    avatarPlaceholder: { backgroundColor: COLORS.primary, alignItems: "center", justifyContent: "center" },
    avatarInitial:     { fontSize: 22, fontWeight: "800", color: "#fff" },
    greeting:          { fontSize: 20, fontWeight: "800", color: COLORS.text },
    weightLabel:       { fontSize: 13, color: COLORS.textMuted, marginTop: 1 },
    logoutBtn:         { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1.5, borderColor: COLORS.border },
    logoutText:        { color: COLORS.red, fontWeight: "600", fontSize: 12 },

    streakRow:         { flexDirection: "row", gap: 10, marginBottom: 14 },
    streakCard:        { flex: 1, borderRadius: 14, padding: 12, alignItems: "center" },
    streakIcon:        { fontSize: 18, marginBottom: 2 },
    streakNum:         { fontSize: 22, fontWeight: "800" },
    streakLabel:       { fontSize: 10, fontWeight: "600", marginTop: 2, textAlign: "center" },

    card:              { backgroundColor: COLORS.card, borderRadius: 14, padding: 16, marginBottom: 14 },
    cardRow:           { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
    cardTitle:         { fontSize: 14, fontWeight: "700", color: COLORS.text },
    cardBadge:         { fontSize: 13, fontWeight: "700", color: COLORS.textSecondary },
    progressBg:        { height: 10, backgroundColor: COLORS.border, borderRadius: 5, overflow: "hidden" },
    progressFill:      { height: 10, borderRadius: 5 },
    progressSub:       { fontSize: 11, color: COLORS.textMuted, marginTop: 6 },

    legend:            { flexDirection: "row", gap: 12, marginBottom: 12, marginTop: 4 },
    legendItem:        { flexDirection: "row", alignItems: "center", gap: 4 },
    legendDot:         { width: 8, height: 8, borderRadius: 4 },
    legendText:        { fontSize: 10, color: COLORS.textMuted, fontWeight: "600" },

    weekRow:           { flexDirection: "row", justifyContent: "space-between", marginTop: 4 },
    dayCol:            { alignItems: "center", gap: 3 },
    dayName:           { fontSize: 10, fontWeight: "700", color: COLORS.textMuted, textTransform: "uppercase" },
    dayCircle:         { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.bg, alignItems: "center", justifyContent: "center" },
    dayTrained:        { backgroundColor: COLORS.primary },
    dayToday:          { borderWidth: 2, borderColor: COLORS.primary },
    dayNum:            { fontSize: 13, fontWeight: "700", color: COLORS.text },
    dietDot:           { width: 6, height: 6, borderRadius: 3 },

    quickRow:          { flexDirection: "row", gap: 12 },
    quickBtn:          { flex: 1, borderRadius: 14, padding: 16, alignItems: "center", gap: 6 },
    quickIcon:         { fontSize: 24 },
    quickLabel:        { fontSize: 12, fontWeight: "700" },
});
