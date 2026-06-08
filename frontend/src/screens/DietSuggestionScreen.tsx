import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from "react-native";
import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { getLatestPlan, PlanResponse } from "../plan/plan.api";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/AppStack";
import { COLORS, SHADOW } from "../theme";

// ─── Macro dos alimentos por 100g ───────────────────────────────────────────
const FOODS = {
    rice:    { label: 'Arroz cozido',  cal: 128, prot: 2.6, carb: 28.1, fat: 0.2 },
    beans:   { label: 'Feijão cozido', cal: 77,  prot: 4.8, carb: 13.6, fat: 0.5 },
    chicken: { label: 'Frango grelhado', cal: 165, prot: 31.0, carb: 0,   fat: 3.6 },
    bread:   { label: 'Pão de forma',  cal: 265, prot: 8.0, carb: 49.0, fat: 3.4 },
    egg:     { label: 'Ovo cozido (1 un ≈ 50g)', cal: 77, prot: 6.3, carb: 0.6, fat: 5.3 },
};

type Meal = {
    name: string;
    color: string;
    items: { food: keyof typeof FOODS; grams: number }[];
};

function buildMeals(plan: PlanResponse & { goal_weight?: string }): Meal[] {
    const totalCal = plan.calories;
    const goal = plan.goal_weight ?? 'maintain';

    // Distribuição calórica: café 25%, almoço 40%, jantar 35%
    const breakfastCal = totalCal * 0.25;
    const lunchCal     = totalCal * 0.40;
    const dinnerCal    = totalCal * 0.35;

    // ── Café da manhã ────────────────────────────────────────────────────────
    // Base: ovos + pão
    const eggsBreakfast = goal === 'gain' ? 3 : 2; // unidades (cada ~50g)
    const eggsCal = eggsBreakfast * FOODS.egg.cal * 0.5; // 0.5 = 50g / 100g
    const breadGrams = Math.round(((breakfastCal - eggsCal) / FOODS.bread.cal) * 100);

    // ── Almoço ───────────────────────────────────────────────────────────────
    // Proporção: 40% frango, 35% arroz, 25% feijão
    const chickenLunchGrams = Math.round((lunchCal * 0.40 / FOODS.chicken.cal) * 100);
    const riceLunchGrams    = Math.round((lunchCal * 0.35 / FOODS.rice.cal)    * 100);
    const beansLunchGrams   = Math.round((lunchCal * 0.25 / FOODS.beans.cal)   * 100);

    // ── Jantar ───────────────────────────────────────────────────────────────
    const chickenDinnerGrams = Math.round((dinnerCal * 0.50 / FOODS.chicken.cal) * 100);
    const riceDinnerGrams    = Math.round((dinnerCal * 0.30 / FOODS.rice.cal)    * 100);
    const beansDinnerGrams   = Math.round((dinnerCal * 0.20 / FOODS.beans.cal)   * 100);

    return [
        {
            name: 'Café da Manhã',
            color: COLORS.orange,
            items: [
                { food: 'egg',   grams: eggsBreakfast * 50 },
                { food: 'bread', grams: Math.max(30, breadGrams) },
            ],
        },
        {
            name: 'Almoço',
            color: COLORS.primary,
            items: [
                { food: 'chicken', grams: chickenLunchGrams },
                { food: 'rice',    grams: riceLunchGrams },
                { food: 'beans',   grams: beansLunchGrams },
            ],
        },
        {
            name: 'Jantar',
            color: COLORS.purple,
            items: [
                { food: 'chicken', grams: chickenDinnerGrams },
                { food: 'rice',    grams: riceDinnerGrams },
                { food: 'beans',   grams: beansDinnerGrams },
            ],
        },
    ];
}

function calcMealMacros(meal: Meal) {
    let cal = 0, prot = 0, carb = 0, fat = 0;
    for (const item of meal.items) {
        const f = FOODS[item.food];
        const ratio = item.grams / 100;
        cal  += f.cal  * ratio;
        prot += f.prot * ratio;
        carb += f.carb * ratio;
        fat  += f.fat  * ratio;
    }
    return {
        cal:  Math.round(cal),
        prot: Math.round(prot),
        carb: Math.round(carb),
        fat:  Math.round(fat),
    };
}

export function DietSuggestionScreen() {
    const { userId } = useAuth();
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const [plan, setPlan] = useState<(PlanResponse & { goal_weight?: string }) | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) return;
        getLatestPlan(userId).then(data => {
            setPlan(data as any);
            setLoading(false);
        });
    }, [userId]);

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    if (!plan) {
        return (
            <View style={styles.center}>
                <Text style={styles.emptyTitle}>Nenhum plano encontrado</Text>
                <Text style={styles.emptyDesc}>
                    Gere um plano alimentar primeiro para ver suas sugestões de refeição.
                </Text>
                <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('GeneratePlan')}>
                    <Text style={styles.btnText}>Gerar Plano</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const meals = buildMeals(plan);

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>Sugestão de Dieta</Text>
            <Text style={styles.subtitle}>Baseado nas suas {plan.calories} kcal diárias</Text>

            {/* Resumo de macros do dia */}
            <View style={[styles.macroRow, SHADOW]}>
                {[
                    { label: 'Proteína', value: `${plan.protein}g`, color: COLORS.primary },
                    { label: 'Carbo',    value: `${plan.carbs}g`,   color: COLORS.orange },
                    { label: 'Gordura',  value: `${plan.fat}g`,     color: COLORS.purple },
                    { label: 'Água',     value: `${(plan.water_ml / 1000).toFixed(1)}L`, color: COLORS.blue },
                ].map(m => (
                    <View key={m.label} style={styles.macroItem}>
                        <Text style={[styles.macroVal, { color: m.color }]}>{m.value}</Text>
                        <Text style={styles.macroLabel}>{m.label}</Text>
                    </View>
                ))}
            </View>

            {meals.map(meal => {
                const totals = calcMealMacros(meal);
                return (
                    <View key={meal.name} style={[styles.mealCard, SHADOW]}>
                        <View style={[styles.mealHeader, { backgroundColor: meal.color }]}>
                            <Text style={styles.mealName}>{meal.name}</Text>
                            <Text style={styles.mealCal}>{totals.cal} kcal</Text>
                        </View>

                        {meal.items.map(item => (
                            <View key={item.food} style={styles.foodRow}>
                                <Text style={styles.foodName}>{FOODS[item.food].label}</Text>
                                <Text style={styles.foodGrams}>{item.grams}g</Text>
                            </View>
                        ))}

                        <View style={styles.mealMacros}>
                            <Text style={styles.mealMacroText}>P: {totals.prot}g</Text>
                            <Text style={styles.mealMacroText}>C: {totals.carb}g</Text>
                            <Text style={styles.mealMacroText}>G: {totals.fat}g</Text>
                        </View>
                    </View>
                );
            })}

            <Text style={styles.note}>
                * Quantidades aproximadas. Ajuste conforme sua balança e preferências.
            </Text>
            <View style={{ height: 32 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container:  { flex: 1, padding: 20, backgroundColor: COLORS.bg },
    center:     { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, backgroundColor: COLORS.bg },
    title:      { fontSize: 24, fontWeight: '800', color: COLORS.text, marginBottom: 4 },
    subtitle:   { fontSize: 14, color: COLORS.textMuted, marginBottom: 20 },
    emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 8, textAlign: 'center' },
    emptyDesc:  { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', marginBottom: 24 },
    btn:        { backgroundColor: COLORS.primary, borderRadius: 10, padding: 14, paddingHorizontal: 28 },
    btnText:    { color: '#fff', fontWeight: '700', fontSize: 15 },
    macroRow:   {
        flexDirection: 'row',
        backgroundColor: COLORS.card,
        borderRadius: 14,
        padding: 16,
        marginBottom: 20,
        justifyContent: 'space-between',
    },
    macroItem:  { alignItems: 'center' },
    macroVal:   { fontSize: 16, fontWeight: '800' },
    macroLabel: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
    mealCard:   { backgroundColor: COLORS.card, borderRadius: 14, marginBottom: 16, overflow: 'hidden' },
    mealHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14 },
    mealName:   { fontSize: 15, fontWeight: '700', color: '#fff' },
    mealCal:    { fontSize: 13, fontWeight: '600', color: '#ffffffcc' },
    foodRow:    { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border },
    foodName:   { fontSize: 14, color: COLORS.text },
    foodGrams:  { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary },
    mealMacros: { flexDirection: 'row', gap: 16, padding: 12, paddingHorizontal: 14 },
    mealMacroText: { fontSize: 12, color: COLORS.textMuted, fontWeight: '600' },
    note:       { fontSize: 12, color: COLORS.textMuted, textAlign: 'center', marginTop: 4 },
});
