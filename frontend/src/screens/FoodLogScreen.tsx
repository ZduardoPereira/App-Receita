import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal,
    TextInput, FlatList, Alert,
} from "react-native";
import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import {
    addFoodLog, deleteFoodLog, getTodayFoodLogs,
    FoodLog, MealType,
} from "../services/food-logs.api";
import { addWaterIntake, getTodayWater } from "../services/water.api";
import { getLatestPlan, PlanResponse } from "../plan/plan.api";
import { COLORS, SHADOW } from "../theme";
import { LocalFood, searchFoods } from "../data/foods";

const MEALS: { key: MealType; label: string; color: string; bg: string; icon: string }[] = [
    { key: "breakfast", label: "Café da Manhã", color: COLORS.orange,  bg: COLORS.orangeLight,  icon: "☀️" },
    { key: "lunch",     label: "Almoço",        color: COLORS.primary, bg: COLORS.primaryLight, icon: "🍽️" },
    { key: "snack",     label: "Lanche",        color: COLORS.purple,  bg: COLORS.purpleLight,  icon: "🍎" },
    { key: "dinner",    label: "Jantar",        color: COLORS.blue,    bg: COLORS.blueLight,    icon: "🌙" },
];

const MEAL_LABEL: Record<MealType, string> = {
    breakfast: "Café da Manhã",
    lunch:     "Almoço",
    snack:     "Lanche",
    dinner:    "Jantar",
};

const LOCAL_FOODS = {
    rice:    { label: "Arroz cozido",      cal: 128, prot: 2.6, carb: 28.1, fat: 0.2 },
    beans:   { label: "Feijão cozido",     cal: 77,  prot: 4.8, carb: 13.6, fat: 0.5 },
    chicken: { label: "Frango grelhado",   cal: 165, prot: 31.0,carb: 0,    fat: 3.6 },
    bread:   { label: "Pão de forma",      cal: 265, prot: 8.0, carb: 49.0, fat: 3.4 },
    egg:     { label: "Ovo cozido (50g)",  cal: 77,  prot: 6.3, carb: 0.6,  fat: 5.3 },
};

function buildSuggestedMeals(plan: PlanResponse) {
    const total = plan.calories;
    const goal  = plan.goal_weight;

    const breakfastCal = total * 0.25;
    const lunchCal     = total * 0.40;
    const dinnerCal    = total * 0.35;

    const eggsN        = goal === "gain" ? 3 : 2;
    const eggsCal      = eggsN * LOCAL_FOODS.egg.cal;
    const breadG       = Math.max(30, Math.round(((breakfastCal - eggsCal) / LOCAL_FOODS.bread.cal) * 100));

    const chickenLunchG = Math.round((lunchCal * 0.40 / LOCAL_FOODS.chicken.cal) * 100);
    const riceLunchG    = Math.round((lunchCal * 0.35 / LOCAL_FOODS.rice.cal)    * 100);
    const beansLunchG   = Math.round((lunchCal * 0.25 / LOCAL_FOODS.beans.cal)   * 100);

    const chickenDinnerG = Math.round((dinnerCal * 0.50 / LOCAL_FOODS.chicken.cal) * 100);
    const riceDinnerG    = Math.round((dinnerCal * 0.30 / LOCAL_FOODS.rice.cal)    * 100);
    const beansDinnerG   = Math.round((dinnerCal * 0.20 / LOCAL_FOODS.beans.cal)   * 100);

    return [
        {
            name: "Café da Manhã", color: COLORS.orange,
            items: [
                { label: LOCAL_FOODS.egg.label,   grams: eggsN * 50, ...macros(LOCAL_FOODS.egg,   eggsN * 50) },
                { label: LOCAL_FOODS.bread.label,  grams: breadG,     ...macros(LOCAL_FOODS.bread, breadG) },
            ],
        },
        {
            name: "Almoço", color: COLORS.primary,
            items: [
                { label: LOCAL_FOODS.chicken.label, grams: chickenLunchG, ...macros(LOCAL_FOODS.chicken, chickenLunchG) },
                { label: LOCAL_FOODS.rice.label,    grams: riceLunchG,    ...macros(LOCAL_FOODS.rice,    riceLunchG) },
                { label: LOCAL_FOODS.beans.label,   grams: beansLunchG,   ...macros(LOCAL_FOODS.beans,   beansLunchG) },
            ],
        },
        {
            name: "Jantar", color: COLORS.blue,
            items: [
                { label: LOCAL_FOODS.chicken.label, grams: chickenDinnerG, ...macros(LOCAL_FOODS.chicken, chickenDinnerG) },
                { label: LOCAL_FOODS.rice.label,    grams: riceDinnerG,    ...macros(LOCAL_FOODS.rice,    riceDinnerG) },
                { label: LOCAL_FOODS.beans.label,   grams: beansDinnerG,   ...macros(LOCAL_FOODS.beans,   beansDinnerG) },
            ],
        },
    ];
}

function macros(food: { cal: number; prot: number; carb: number; fat: number }, grams: number) {
    const r = grams / 100;
    return {
        cal:  Math.round(food.cal  * r),
        prot: Math.round(food.prot * r),
        carb: Math.round(food.carb * r),
        fat:  Math.round(food.fat  * r),
    };
}

const WATER_PRESETS = [150, 200, 300, 500, 750, 1000];

export function FoodLogScreen() {
    const { userId } = useAuth();

    const [logs,          setLogs]          = useState<FoodLog[]>([]);
    const [plan,          setPlan]          = useState<PlanResponse | null>(null);
    const [waterMl,       setWaterMl]       = useState(0);
    const [loading,       setLoading]       = useState(true);
    const [showSuggested, setShowSuggested] = useState(false);

    // Modal busca
    const [searchMeal,   setSearchMeal]   = useState<MealType | null>(null);
    const [query,        setQuery]        = useState("");
    const [results,      setResults]      = useState<LocalFood[]>([]);
    const [selectedFood, setSelectedFood] = useState<LocalFood | null>(null);
    const [grams,        setGrams]        = useState("100");
    const [addingFood,   setAddingFood]   = useState(false);

    // Modal água
    const [showWater,  setShowWater]  = useState(false);
    const [waterInput, setWaterInput] = useState("");

    useEffect(() => { load(); }, []);

    async function load() {
        if (!userId) return;
        try {
            const p = await getLatestPlan(userId);
            setPlan(p);
        } catch { /* silent */ }

        try {
            const [l, w] = await Promise.all([
                getTodayFoodLogs(userId),
                getTodayWater(userId),
            ]);
            setLogs(l);
            setWaterMl(w);
        } catch { /* silent */ }

        setLoading(false);
    }

    function onQueryChange(text: string) {
        setQuery(text);
        setResults(searchFoods(text));
    }

    function macrosForGrams(food: LocalFood, g: number) {
        const r = g / 100;
        return {
            cal:  Math.round(food.cal  * r),
            prot: Math.round(food.prot * r),
            carb: Math.round(food.carb * r),
            fat:  Math.round(food.fat  * r),
        };
    }

    async function confirmAddFood() {
        if (!userId || !selectedFood || !searchMeal) return;
        const g = Number(grams);
        if (!g || isNaN(g) || g <= 0) return Alert.alert("Erro", "Informe uma quantidade válida");
        const m = macrosForGrams(selectedFood, g);
        setAddingFood(true);
        try {
            const log = await addFoodLog({
                userId, mealType: searchMeal,
                foodName: selectedFood.nome,
                calories: m.cal, protein: m.prot, carbs: m.carb, fat: m.fat, grams: g,
            });
            setLogs(prev => [...prev, log]);
            closeSearchModal();
        } catch {
            Alert.alert("Erro", "Não foi possível salvar o alimento");
        } finally {
            setAddingFood(false);
        }
    }

    async function handleDeleteFood(id: number) {
        try {
            await deleteFoodLog(id);
            setLogs(prev => prev.filter(l => l.id !== id));
        } catch { Alert.alert("Erro", "Não foi possível remover"); }
    }

    function closeSearchModal() {
        setSearchMeal(null); setQuery(""); setResults([]);
        setSelectedFood(null); setGrams("100");
    }

    async function addWater(ml: number) {
        if (!userId) return;
        try {
            await addWaterIntake(userId, ml);
            setWaterMl(prev => prev + ml);
        } catch { /* silent */ }
    }

    async function addCustomWater() {
        const ml = Number(waterInput);
        if (!ml || isNaN(ml) || ml <= 0) return;
        await addWater(ml);
        setWaterInput(""); setShowWater(false);
    }

    const totalCal  = Math.round(logs.reduce((s, l) => s + Number(l.calories), 0));
    const totalProt = Math.round(logs.reduce((s, l) => s + Number(l.protein),  0));
    const totalCarb = Math.round(logs.reduce((s, l) => s + Number(l.carbs),    0));
    const totalFat  = Math.round(logs.reduce((s, l) => s + Number(l.fat),      0));
    const goalCal   = plan?.calories ?? 0;
    const goalWater = plan?.water_ml ?? 2500;
    const calPct    = goalCal > 0 ? Math.min(totalCal / goalCal, 1) : 0;
    const waterPct  = Math.min(waterMl / goalWater, 1);

    function logsForMeal(meal: MealType): FoodLog[] {
        return logs.filter(l => l.meal_type === meal);
    }
    function mealCal(meal: MealType): number {
        return Math.round(logsForMeal(meal).reduce((s, l) => s + Number(l.calories), 0));
    }

    if (loading) {
        return (
            <View style={styles.center}>
                <Text style={{ color: COLORS.textMuted }}>Carregando...</Text>
            </View>
        );
    }

    const suggestedMeals = plan ? buildSuggestedMeals(plan) : null;

    return (
        <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
                <Text style={styles.title}>Dieta</Text>
                <Text style={styles.subtitle}>
                    {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
                </Text>

                {/* ── Resumo calórico ──────────────────────────────────── */}
                <View style={[styles.card, SHADOW]}>
                    <View style={styles.cardRow}>
                        <Text style={styles.cardTitle}>Calorias do dia</Text>
                        <Text style={styles.calBadge}>
                            <Text style={{ color: goalCal > 0 && totalCal > goalCal ? COLORS.red : COLORS.orange, fontWeight: "800" }}>
                                {totalCal}
                            </Text>
                            {goalCal > 0 && (
                                <Text style={{ color: COLORS.textMuted }}> / {goalCal} kcal</Text>
                            )}
                        </Text>
                    </View>
                    {goalCal > 0 && (
                        <>
                            <View style={styles.progressBg}>
                                <View style={[styles.progressFill, {
                                    width: `${calPct * 100}%` as any,
                                    backgroundColor: calPct >= 1 ? COLORS.red : COLORS.orange,
                                }]} />
                            </View>
                            <Text style={styles.progressSub}>
                                {goalCal - totalCal > 0
                                    ? `Faltam ${goalCal - totalCal} kcal`
                                    : totalCal === goalCal ? "Meta atingida!" : `${totalCal - goalCal} kcal acima da meta`}
                            </Text>
                        </>
                    )}
                    <View style={styles.macroRow}>
                        {[
                            { label: "Prot",  value: totalProt, goal: plan?.protein, color: COLORS.primary },
                            { label: "Carbo", value: totalCarb, goal: plan?.carbs,   color: COLORS.orange  },
                            { label: "Gord",  value: totalFat,  goal: plan?.fat,     color: COLORS.purple  },
                        ].map(m => (
                            <View key={m.label} style={styles.macroItem}>
                                <Text style={[styles.macroVal, { color: m.color }]}>{m.value}g</Text>
                                {m.goal != null && (
                                    <Text style={styles.macroGoal}>/ {m.goal}g</Text>
                                )}
                                <Text style={styles.macroLabel}>{m.label}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* ── Rastreador de água ───────────────────────────────── */}
                <View style={[styles.card, SHADOW]}>
                    <View style={styles.cardRow}>
                        <Text style={styles.cardTitle}>💧 Água</Text>
                        <Text style={styles.calBadge}>
                            <Text style={{ color: COLORS.blue, fontWeight: "800" }}>
                                {waterMl} ml
                            </Text>
                            <Text style={{ color: COLORS.textMuted }}>
                                {" / "}{goalWater} ml
                            </Text>
                        </Text>
                    </View>
                    <View style={[styles.progressBg, { marginBottom: 12 }]}>
                        <View style={[styles.progressFill, {
                            width: `${waterPct * 100}%` as any,
                            backgroundColor: waterPct >= 1 ? COLORS.primary : COLORS.blue,
                        }]} />
                    </View>
                    <View style={styles.waterBtns}>
                        {WATER_PRESETS.map(ml => (
                            <TouchableOpacity key={ml} style={styles.waterBtn} onPress={() => addWater(ml)}>
                                <Text style={styles.waterBtnText}>
                                    {ml >= 1000 ? `${ml / 1000}L` : `${ml}ml`}
                                </Text>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity
                            style={[styles.waterBtn, { backgroundColor: COLORS.blueLight, borderColor: COLORS.blue }]}
                            onPress={() => setShowWater(true)}
                        >
                            <Text style={[styles.waterBtnText, { color: COLORS.blue }]}>+ ml</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* ── Dieta Sugerida ───────────────────────────────────── */}
                {suggestedMeals && (
                    <View style={[styles.card, SHADOW]}>
                        <TouchableOpacity style={styles.cardRow} onPress={() => setShowSuggested(p => !p)}>
                            <Text style={styles.cardTitle}>📋 Dieta Sugerida</Text>
                            <Text style={{ color: COLORS.primary, fontWeight: "700" }}>
                                {plan?.calories} kcal {showSuggested ? "▲" : "▼"}
                            </Text>
                        </TouchableOpacity>
                        {showSuggested && suggestedMeals.map(meal => (
                            <View key={meal.name} style={styles.suggestedMeal}>
                                <Text style={[styles.suggestedMealName, { color: meal.color }]}>
                                    {meal.name}
                                </Text>
                                {meal.items.map((item, i) => (
                                    <View key={i} style={styles.suggestedItem}>
                                        <Text style={styles.suggestedItemName}>{item.label}</Text>
                                        <Text style={styles.suggestedItemMeta}>
                                            {item.grams}g · {item.cal} kcal · P:{item.prot}g C:{item.carb}g G:{item.fat}g
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        ))}
                        {showSuggested && (
                            <Text style={styles.suggestedNote}>
                                * Valores aproximados baseados no seu plano.
                            </Text>
                        )}
                    </View>
                )}

                {/* ── Refeições ────────────────────────────────────────── */}
                {MEALS.map(meal => {
                    const mealLogs = logsForMeal(meal.key);
                    const cal      = mealCal(meal.key);
                    return (
                        <View key={meal.key} style={[styles.mealCard, SHADOW]}>
                            <View style={[styles.mealHeader, { backgroundColor: meal.color }]}>
                                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                                    <Text style={styles.mealIcon}>{meal.icon}</Text>
                                    <Text style={styles.mealName}>{meal.label}</Text>
                                </View>
                                <Text style={styles.mealCal}>{cal} kcal</Text>
                            </View>

                            {mealLogs.map(log => (
                                <View key={log.id} style={styles.foodRow}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.foodName} numberOfLines={1}>{log.food_name}</Text>
                                        <Text style={styles.foodMeta}>
                                            {Math.round(Number(log.grams))}g · P:{Math.round(Number(log.protein))}g C:{Math.round(Number(log.carbs))}g G:{Math.round(Number(log.fat))}g
                                        </Text>
                                    </View>
                                    <View style={styles.foodRight}>
                                        <Text style={styles.foodCal}>{Math.round(Number(log.calories))} kcal</Text>
                                        <TouchableOpacity onPress={() => handleDeleteFood(log.id)}>
                                            <Text style={styles.delBtn}>✕</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))}

                            <TouchableOpacity
                                style={[styles.addFoodBtn, { borderColor: meal.color }]}
                                onPress={() => { setSearchMeal(meal.key); setQuery(""); setResults([]); }}
                            >
                                <Text style={[styles.addFoodBtnText, { color: meal.color }]}>
                                    + Adicionar Alimento
                                </Text>
                            </TouchableOpacity>
                        </View>
                    );
                })}

                <View style={{ height: 20 }} />
            </ScrollView>

            {/* ── Modal: Busca local ────────────────────────────────── */}
            <Modal visible={searchMeal !== null} animationType="slide" transparent>
                <View style={styles.overlay}>
                    <View style={styles.sheet}>
                        <View style={styles.sheetHeader}>
                            <Text style={styles.sheetTitle}>
                                {searchMeal ? MEAL_LABEL[searchMeal] : "Buscar Alimento"}
                            </Text>
                            <TouchableOpacity onPress={closeSearchModal}>
                                <Text style={styles.sheetClose}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        {selectedFood ? (
                            <View style={styles.confirmView}>
                                <Text style={styles.confirmName}>{selectedFood.nome}</Text>
                                <Text style={styles.confirmMeta}>
                                    por 100g: {selectedFood.cal} kcal · P:{selectedFood.prot}g · C:{selectedFood.carb}g · G:{selectedFood.fat}g
                                </Text>
                                <Text style={styles.fieldLabel}>QUANTIDADE (gramas)</Text>
                                <TextInput
                                    value={grams}
                                    onChangeText={setGrams}
                                    keyboardType="decimal-pad"
                                    style={styles.input}
                                    autoFocus
                                />
                                {grams && !isNaN(Number(grams)) && Number(grams) > 0 && (() => {
                                    const m = macrosForGrams(selectedFood, Number(grams));
                                    return (
                                        <View style={styles.previewBox}>
                                            <Text style={styles.previewCal}>{m.cal} kcal</Text>
                                            <Text style={styles.previewMacro}>P: {m.prot}g · C: {m.carb}g · G: {m.fat}g</Text>
                                        </View>
                                    );
                                })()}
                                <View style={styles.confirmBtns}>
                                    <TouchableOpacity
                                        style={[styles.confirmBtn, { backgroundColor: COLORS.border }]}
                                        onPress={() => setSelectedFood(null)}
                                    >
                                        <Text style={[styles.confirmBtnText, { color: COLORS.text }]}>Voltar</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.confirmBtn, { backgroundColor: COLORS.primary }, addingFood && { opacity: 0.6 }]}
                                        onPress={confirmAddFood}
                                        disabled={addingFood}
                                    >
                                        <Text style={styles.confirmBtnText}>{addingFood ? "..." : "Adicionar"}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ) : (
                            <>
                                <View style={styles.searchBox}>
                                    <TextInput
                                        value={query}
                                        onChangeText={onQueryChange}
                                        placeholder="Ex: frango, arroz, ovo..."
                                        placeholderTextColor={COLORS.textMuted}
                                        style={styles.searchInput}
                                        autoFocus
                                    />
                                </View>
                                {query.length === 0 && (
                                    <Text style={styles.hint}>Digite o nome do alimento para buscar</Text>
                                )}
                                {query.length >= 2 && results.length === 0 && (
                                    <Text style={styles.noResults}>Nenhum resultado para "{query}"</Text>
                                )}
                                <FlatList
                                    data={results}
                                    keyExtractor={item => item.id.toString()}
                                    style={{ maxHeight: 380 }}
                                    keyboardShouldPersistTaps="handled"
                                    renderItem={({ item }) => (
                                        <TouchableOpacity
                                            style={styles.resultItem}
                                            onPress={() => { setSelectedFood(item); setGrams("100"); }}
                                        >
                                            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                                <Text style={styles.resultName} numberOfLines={1}>{item.nome}</Text>
                                                <Text style={styles.resultCat}>{item.categoria}</Text>
                                            </View>
                                            <Text style={styles.resultMeta}>
                                                {item.cal} kcal · P:{item.prot}g · C:{item.carb}g · G:{item.fat}g (por 100g)
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                    ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: COLORS.border }} />}
                                />
                            </>
                        )}
                    </View>
                </View>
            </Modal>

            {/* ── Modal: Água personalizada ─────────────────────────── */}
            <Modal visible={showWater} animationType="fade" transparent>
                <View style={[styles.overlay, { justifyContent: "center" }]}>
                    <View style={[styles.sheet, { padding: 20, maxHeight: 220 }]}>
                        <Text style={styles.sheetTitle}>Adicionar Água</Text>
                        <Text style={styles.fieldLabel}>QUANTIDADE (ml)</Text>
                        <TextInput
                            value={waterInput}
                            onChangeText={setWaterInput}
                            keyboardType="numeric"
                            placeholder="Ex: 350"
                            placeholderTextColor={COLORS.textMuted}
                            style={[styles.input, { marginBottom: 16 }]}
                            autoFocus
                        />
                        <View style={styles.confirmBtns}>
                            <TouchableOpacity
                                style={[styles.confirmBtn, { backgroundColor: COLORS.border }]}
                                onPress={() => { setShowWater(false); setWaterInput(""); }}
                            >
                                <Text style={[styles.confirmBtnText, { color: COLORS.text }]}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.confirmBtn, { backgroundColor: COLORS.blue }]}
                                onPress={addCustomWater}
                            >
                                <Text style={styles.confirmBtnText}>Adicionar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    center:        { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: COLORS.bg },
    scroll:        { padding: 20, paddingTop: 16 },
    title:         { fontSize: 24, fontWeight: "800", color: COLORS.text, marginBottom: 2 },
    subtitle:      { fontSize: 13, color: COLORS.textMuted, marginBottom: 16, textTransform: "capitalize" },

    card:          { backgroundColor: COLORS.card, borderRadius: 14, padding: 16, marginBottom: 14 },
    cardRow:       { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
    cardTitle:     { fontSize: 14, fontWeight: "700", color: COLORS.text },
    calBadge:      { fontSize: 14 },
    progressBg:    { height: 8, backgroundColor: COLORS.border, borderRadius: 4, overflow: "hidden", marginBottom: 6 },
    progressFill:  { height: 8, borderRadius: 4 },
    progressSub:   { fontSize: 11, color: COLORS.textMuted, marginBottom: 10 },

    macroRow:      { flexDirection: "row", justifyContent: "space-around", marginTop: 4 },
    macroItem:     { alignItems: "center" },
    macroVal:      { fontSize: 15, fontWeight: "800" },
    macroGoal:     { fontSize: 11, color: COLORS.textMuted },
    macroLabel:    { fontSize: 11, color: COLORS.textMuted, marginTop: 1 },

    waterBtns:     { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    waterBtn:      { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, backgroundColor: COLORS.bg, borderWidth: 1, borderColor: COLORS.border },
    waterBtnText:  { fontSize: 12, fontWeight: "700", color: COLORS.textSecondary },

    suggestedMeal:       { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: COLORS.border },
    suggestedMealName:   { fontSize: 13, fontWeight: "700", marginBottom: 6 },
    suggestedItem:       { marginBottom: 5 },
    suggestedItemName:   { fontSize: 13, color: COLORS.text },
    suggestedItemMeta:   { fontSize: 11, color: COLORS.textMuted },
    suggestedNote:       { fontSize: 11, color: COLORS.textMuted, marginTop: 10, fontStyle: "italic" },

    mealCard:      { backgroundColor: COLORS.card, borderRadius: 14, marginBottom: 14, overflow: "hidden" },
    mealHeader:    { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 14 },
    mealIcon:      { fontSize: 18 },
    mealName:      { fontSize: 15, fontWeight: "700", color: "#fff" },
    mealCal:       { fontSize: 13, color: "#ffffffcc", fontWeight: "600" },

    foodRow:       { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border },
    foodName:      { fontSize: 13, fontWeight: "600", color: COLORS.text },
    foodMeta:      { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
    foodRight:     { alignItems: "flex-end", gap: 4 },
    foodCal:       { fontSize: 13, fontWeight: "700", color: COLORS.textSecondary },
    delBtn:        { fontSize: 12, color: COLORS.red, fontWeight: "700", padding: 4 },

    addFoodBtn:    { margin: 12, borderWidth: 1.5, borderRadius: 8, padding: 10, alignItems: "center", borderStyle: "dashed" },
    addFoodBtnText:{ fontSize: 13, fontWeight: "700" },

    overlay:       { flex: 1, backgroundColor: "#00000066", justifyContent: "flex-end" },
    sheet:         { backgroundColor: COLORS.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: "90%" },
    sheetHeader:   { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
    sheetTitle:    { fontSize: 16, fontWeight: "700", color: COLORS.text },
    sheetClose:    { fontSize: 16, color: COLORS.textMuted, padding: 4 },

    searchBox:     { flexDirection: "row", alignItems: "center", margin: 12, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 10, paddingHorizontal: 12, backgroundColor: COLORS.bg },
    searchInput:   { flex: 1, paddingVertical: 10, fontSize: 15, color: COLORS.text },
    hint:          { textAlign: "center", color: COLORS.textMuted, padding: 20, fontSize: 13 },
    noResults:     { textAlign: "center", color: COLORS.textMuted, padding: 20, fontSize: 14 },

    resultItem:    { padding: 14 },
    resultName:    { fontSize: 14, fontWeight: "600", color: COLORS.text, flex: 1 },
    resultCat:     { fontSize: 11, color: COLORS.textMuted, marginLeft: 8 },
    resultMeta:    { fontSize: 12, color: COLORS.textMuted, marginTop: 3 },

    confirmView:   { padding: 16 },
    confirmName:   { fontSize: 16, fontWeight: "700", color: COLORS.text, marginBottom: 4 },
    confirmMeta:   { fontSize: 13, color: COLORS.textMuted, marginBottom: 16 },
    fieldLabel:    { fontSize: 10, fontWeight: "700", color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 },
    input:         { borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 10, padding: 12, fontSize: 15, color: COLORS.text, backgroundColor: COLORS.bg },
    previewBox:    { backgroundColor: COLORS.primaryLight, borderRadius: 10, padding: 12, marginTop: 10, alignItems: "center" },
    previewCal:    { fontSize: 20, fontWeight: "800", color: COLORS.primary },
    previewMacro:  { fontSize: 12, color: COLORS.primary, marginTop: 2 },
    confirmBtns:   { flexDirection: "row", gap: 10, marginTop: 16 },
    confirmBtn:    { flex: 1, borderRadius: 10, padding: 13, alignItems: "center" },
    confirmBtnText:{ color: "#fff", fontWeight: "700", fontSize: 14 },
});
