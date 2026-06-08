import {
    View, Text, StyleSheet, ScrollView, Alert,
    TouchableOpacity, ActivityIndicator, Dimensions,
} from "react-native";
import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { addWeightLog, getWeightLogs, WeightLog } from "../services/weight.api";
import { TextField } from "../components/TextField";
import { LineChart } from "react-native-chart-kit";
import { COLORS, SHADOW } from "../theme";

const screenWidth = Dimensions.get("window").width;

export function WeightTrackerScreen() {
    const { userId } = useAuth();
    const [weight, setWeight] = useState("");
    const [logs, setLogs] = useState<WeightLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => { loadLogs(); }, []);

    async function loadLogs() {
        if (!userId) return;
        try {
            const data = await getWeightLogs(userId);
            setLogs(data);
        } catch {
            Alert.alert("Erro", "Não foi possível carregar o histórico");
        } finally {
            setLoading(false);
        }
    }

    async function handleSave() {
        if (!weight || isNaN(Number(weight)))
            return Alert.alert("Erro", "Informe um peso válido");
        if (!userId) return;
        setSaving(true);
        try {
            const newLog = await addWeightLog(userId, Number(weight));
            setLogs(prev => [...prev, newLog]);
            setWeight("");
        } catch {
            Alert.alert("Erro", "Não foi possível salvar o peso");
        } finally {
            setSaving(false);
        }
    }

    const chartData = logs.slice(-10);
    const hasChart = chartData.length >= 2;
    const chartLabels = chartData.map(l => {
        const d = new Date(l.recorded_at);
        return `${d.getDate()}/${d.getMonth() + 1}`;
    });
    const chartValues = chartData.map(l => Number(l.weight));

    // Estatísticas
    const allWeights = logs.map(l => Number(l.weight));
    const minW = allWeights.length ? Math.min(...allWeights) : null;
    const maxW = allWeights.length ? Math.max(...allWeights) : null;
    const latestW = allWeights.length ? allWeights[allWeights.length - 1] : null;
    const firstW = allWeights.length ? allWeights[0] : null;
    const delta = latestW != null && firstW != null ? latestW - firstW : null;

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <Text style={styles.title}>Rastreamento de Peso</Text>

            {/* Formulário */}
            <View style={[styles.card, SHADOW]}>
                <Text style={styles.sectionLabel}>Registrar Peso</Text>
                <TextField
                    label="Peso atual (kg)"
                    value={weight}
                    onChangeText={setWeight}
                    placeholder="Ex: 75.5"
                    keyboardType="decimal-pad"
                />
                <TouchableOpacity
                    style={[styles.btn, saving && { opacity: 0.6 }]}
                    onPress={handleSave}
                    disabled={saving}
                >
                    <Text style={styles.btnText}>{saving ? "Salvando..." : "Registrar"}</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color={COLORS.blue} style={{ marginTop: 30 }} />
            ) : (
                <>
                    {/* Stats */}
                    {logs.length > 0 && (
                        <View style={styles.statsRow}>
                            {[
                                { label: 'Atual',  value: latestW != null ? `${latestW.toFixed(1)}kg` : '—' },
                                { label: 'Mínimo', value: minW != null ? `${minW.toFixed(1)}kg` : '—' },
                                { label: 'Máximo', value: maxW != null ? `${maxW.toFixed(1)}kg` : '—' },
                                { label: 'Variação', value: delta != null ? `${delta > 0 ? '+' : ''}${delta.toFixed(1)}kg` : '—' },
                            ].map(s => (
                                <View key={s.label} style={[styles.statCard, SHADOW]}>
                                    <Text style={styles.statValue}>{s.value}</Text>
                                    <Text style={styles.statLabel}>{s.label}</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Gráfico */}
                    {hasChart ? (
                        <View style={[styles.card, SHADOW]}>
                            <Text style={styles.sectionLabel}>Evolução</Text>
                            <LineChart
                                data={{ labels: chartLabels, datasets: [{ data: chartValues }] }}
                                width={screenWidth - 60}
                                height={190}
                                yAxisSuffix="kg"
                                fromZero={false}
                                chartConfig={{
                                    backgroundColor: COLORS.card,
                                    backgroundGradientFrom: COLORS.card,
                                    backgroundGradientTo: COLORS.card,
                                    decimalPlaces: 1,
                                    color: (opacity = 1) => `rgba(37,99,235,${opacity})`,
                                    labelColor: () => COLORS.textMuted,
                                    propsForDots: { r: '5', strokeWidth: '2', stroke: COLORS.blue },
                                    propsForBackgroundLines: { stroke: COLORS.border },
                                }}
                                bezier
                                style={{ borderRadius: 8, marginLeft: -10 }}
                            />
                        </View>
                    ) : logs.length === 1 ? (
                        <View style={[styles.hintBox, SHADOW]}>
                            <Text style={styles.hintText}>Adicione mais um registro para ver o gráfico de evolução.</Text>
                        </View>
                    ) : null}

                    {/* Histórico */}
                    {logs.length > 0 && (
                        <>
                            <Text style={styles.sectionLabel}>Histórico</Text>
                            <View style={[styles.card, SHADOW]}>
                                {[...logs].reverse().map((log, i, arr) => (
                                    <View key={log.id} style={[styles.logRow, i < arr.length - 1 && styles.logBorder]}>
                                        <Text style={styles.logDate}>
                                            {new Date(log.recorded_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                                        </Text>
                                        <Text style={styles.logWeight}>{Number(log.weight).toFixed(1)} kg</Text>
                                    </View>
                                ))}
                            </View>
                        </>
                    )}

                    {logs.length === 0 && (
                        <Text style={styles.emptyText}>Nenhum registro ainda. Comece registrando seu peso atual!</Text>
                    )}
                </>
            )}
            <View style={{ height: 32 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container:   { flex: 1, padding: 20, backgroundColor: COLORS.bg },
    title:       { fontSize: 24, fontWeight: '800', color: COLORS.text, marginBottom: 16 },
    card:        { backgroundColor: COLORS.card, borderRadius: 14, padding: 16, marginBottom: 14 },
    sectionLabel:{ fontSize: 11, fontWeight: '700', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 12 },
    btn:         { backgroundColor: COLORS.blue, borderRadius: 10, padding: 14, alignItems: 'center' },
    btnText:     { color: '#fff', fontWeight: '700', fontSize: 15 },
    statsRow:    { flexDirection: 'row', gap: 8, marginBottom: 14 },
    statCard:    { flex: 1, backgroundColor: COLORS.card, borderRadius: 12, padding: 12, alignItems: 'center' },
    statValue:   { fontSize: 14, fontWeight: '800', color: COLORS.text },
    statLabel:   { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
    hintBox:     { backgroundColor: COLORS.blueLight, borderRadius: 12, padding: 14, marginBottom: 14, alignItems: 'center' },
    hintText:    { color: COLORS.blue, fontSize: 13, textAlign: 'center' },
    logRow:      { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12 },
    logBorder:   { borderBottomWidth: 1, borderBottomColor: COLORS.border },
    logDate:     { color: COLORS.textSecondary, fontSize: 14 },
    logWeight:   { fontWeight: '700', fontSize: 15, color: COLORS.text },
    emptyText:   { color: COLORS.textMuted, textAlign: 'center', paddingVertical: 20, fontSize: 14 },
});
