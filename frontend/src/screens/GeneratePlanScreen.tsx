import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { useState } from "react";
import { createPlan, CreatePlanRequest } from "../plan/plan.api";
import { addWeightLog } from "../services/weight.api";
import { TextField } from "../components/TextField";
import { Picker } from "@react-native-picker/picker";
import { useAuth } from "../auth/AuthContext";
import { COLORS, SHADOW } from "../theme";

type Result = { calories: number; protein: number; carbs: number; fat: number; water_ml: number };

export function GeneratePlanScreen() {
    const { userId } = useAuth();
    const [weight, setWeight]       = useState("");
    const [height, setHeight]       = useState("");
    const [age, setAge]             = useState("");
    const [gender, setGender]       = useState<CreatePlanRequest["gender"]>("male");
    const [goalWeight, setGoalWeight] = useState<CreatePlanRequest["goalWeight"]>("gain");
    const [goalTraining, setGoalTraining] = useState<CreatePlanRequest["goalTraining"]>("hypertrophy");
    const [intensity, setIntensity] = useState<CreatePlanRequest["intensity"]>("moderate");
    const [result, setResult]       = useState<Result | null>(null);
    const [loading, setLoading]     = useState(false);

    async function handleGenerate() {
        if (!weight || !height || !age || isNaN(Number(weight)) || isNaN(Number(height)) || isNaN(Number(age)))
            return Alert.alert("Erro", "Preencha todos os campos corretamente");
        if (!userId)
            return Alert.alert("Erro", "Usuário não autenticado");

        setLoading(true);
        try {
            const data = await createPlan({ userId, weight: Number(weight), height: Number(height), age: Number(age), gender, goalWeight, goalTraining, intensity });
            setResult(data);

            // Salva o peso no rastreamento sem afetar o cálculo da dieta
            addWeightLog(userId, Number(weight)).catch(() => null);

            Alert.alert(
                "Plano gerado!",
                `Seu plano de ${data.calories} kcal foi salvo com sucesso.\nO seu peso (${weight} kg) também foi registrado no gráfico.`
            );
        } catch {
            Alert.alert("Erro", "Não foi possível gerar o plano");
        } finally {
            setLoading(false);
        }
    }

    const pickerStyle = { color: COLORS.text };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <Text style={styles.title}>Gerar Plano</Text>

            <View style={[styles.card, SHADOW]}>
                <Text style={styles.sectionLabel}>Dados Pessoais</Text>
                <View style={styles.row}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                        <TextField label="Peso (kg)" value={weight} onChangeText={setWeight} placeholder="70" keyboardType="decimal-pad" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <TextField label="Altura (cm)" value={height} onChangeText={setHeight} placeholder="175" keyboardType="numeric" />
                    </View>
                </View>
                <TextField label="Idade" value={age} onChangeText={setAge} placeholder="25" keyboardType="numeric" />

                <Text style={styles.fieldLabel}>GÊNERO</Text>
                <View style={styles.pickerWrap}>
                    <Picker selectedValue={gender} onValueChange={v => setGender(v)} style={pickerStyle}>
                        <Picker.Item label="Masculino" value="male" />
                        <Picker.Item label="Feminino" value="female" />
                    </Picker>
                </View>
            </View>

            <View style={[styles.card, SHADOW]}>
                <Text style={styles.sectionLabel}>Objetivos</Text>

                <Text style={styles.fieldLabel}>OBJETIVO</Text>
                <View style={styles.pickerWrap}>
                    <Picker selectedValue={goalWeight} onValueChange={v => setGoalWeight(v)} style={pickerStyle}>
                        <Picker.Item label="Ganhar peso" value="gain" />
                        <Picker.Item label="Perder peso" value="lose" />
                        <Picker.Item label="Manter peso" value="maintain" />
                    </Picker>
                </View>

                <Text style={styles.fieldLabel}>TIPO DE TREINO</Text>
                <View style={styles.pickerWrap}>
                    <Picker selectedValue={goalTraining} onValueChange={v => setGoalTraining(v)} style={pickerStyle}>
                        <Picker.Item label="Hipertrofia" value="hypertrophy" />
                        <Picker.Item label="Força" value="strength" />
                    </Picker>
                </View>

                <Text style={styles.fieldLabel}>INTENSIDADE</Text>
                <View style={styles.pickerWrap}>
                    <Picker selectedValue={intensity} onValueChange={v => setIntensity(v)} style={pickerStyle}>
                        <Picker.Item label="Leve" value="light" />
                        <Picker.Item label="Moderado" value="moderate" />
                        <Picker.Item label="Intenso" value="intense" />
                    </Picker>
                </View>
            </View>

            <TouchableOpacity style={[styles.btn, loading && { opacity: 0.6 }]} onPress={handleGenerate} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Calcular Plano</Text>}
            </TouchableOpacity>

            {result && (
                <View style={[styles.resultCard, SHADOW]}>
                    <Text style={styles.resultTitle}>Seu Plano</Text>
                    <View style={styles.macroGrid}>
                        {[
                            { label: 'Calorias',    value: `${result.calories}`, unit: 'kcal', color: COLORS.orange,  bg: COLORS.orangeLight },
                            { label: 'Proteína',    value: `${result.protein}`,  unit: 'g',    color: COLORS.primary, bg: COLORS.primaryLight },
                            { label: 'Carboidrato', value: `${result.carbs}`,    unit: 'g',    color: COLORS.blue,    bg: COLORS.blueLight },
                            { label: 'Gordura',     value: `${result.fat}`,      unit: 'g',    color: COLORS.purple,  bg: COLORS.purpleLight },
                        ].map(m => (
                            <View key={m.label} style={[styles.macroCard, { backgroundColor: m.bg }]}>
                                <Text style={[styles.macroValue, { color: m.color }]}>{m.value}</Text>
                                <Text style={[styles.macroUnit, { color: m.color }]}>{m.unit}</Text>
                                <Text style={styles.macroLabel}>{m.label}</Text>
                            </View>
                        ))}
                    </View>
                    <View style={styles.waterRow}>
                        <Text style={styles.waterLabel}>💧 Água diária</Text>
                        <Text style={styles.waterValue}>{(result.water_ml / 1000).toFixed(1)} L</Text>
                    </View>
                </View>
            )}
            <View style={{ height: 32 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container:    { flex: 1, padding: 20, backgroundColor: COLORS.bg },
    title:        { fontSize: 24, fontWeight: '800', color: COLORS.text, marginBottom: 16 },
    card:         { backgroundColor: COLORS.card, borderRadius: 14, padding: 16, marginBottom: 14 },
    sectionLabel: { fontSize: 11, fontWeight: '700', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 12 },
    fieldLabel:   { fontSize: 11, fontWeight: '700', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4, marginTop: 8 },
    row:          { flexDirection: 'row' },
    pickerWrap:   { borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 10, marginBottom: 4, overflow: 'hidden' },
    btn:          { backgroundColor: COLORS.primary, borderRadius: 12, padding: 15, alignItems: 'center', marginBottom: 14 },
    btnText:      { color: '#fff', fontWeight: '700', fontSize: 16 },
    resultCard:   { backgroundColor: COLORS.card, borderRadius: 14, padding: 18, marginBottom: 14 },
    resultTitle:  { fontSize: 17, fontWeight: '700', color: COLORS.text, marginBottom: 14 },
    macroGrid:    { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 12 },
    macroCard:    { width: '47%', borderRadius: 12, padding: 14, alignItems: 'center' },
    macroValue:   { fontSize: 24, fontWeight: '800' },
    macroUnit:    { fontSize: 12, fontWeight: '600' },
    macroLabel:   { fontSize: 12, color: COLORS.textSecondary, marginTop: 4 },
    waterRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.blueLight, borderRadius: 10, padding: 12 },
    waterLabel:   { fontSize: 14, color: COLORS.blue },
    waterValue:   { fontSize: 16, fontWeight: '800', color: COLORS.blue },
});
