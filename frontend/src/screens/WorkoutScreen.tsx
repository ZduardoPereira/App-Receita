import {
    View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity,
    ActivityIndicator, Modal, FlatList, TextInput,
} from "react-native";
import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { addWorkoutLog, getWorkoutLogs, WorkoutLog } from "../services/workout.api";
import { getUserTemplates, saveTemplate, deleteTemplate, WorkoutTemplate } from "../services/workout-templates.api";
import { createSession, getSessions, WorkoutSession } from "../services/workout-sessions.api";
import { getLatestPlan } from "../plan/plan.api";
import { COLORS, SHADOW } from "../theme";

// ─── Templates embutidos AB ───────────────────────────────────────────────────
type BuiltinTemplate = {
    id: string; name: string; tag: string;
    color: string; bg: string;
    type: "hypertrophy" | "strength";
    exercises: string[];
};

const BUILTIN: BuiltinTemplate[] = [
    {
        id: "hyp_A", name: "Hipertrofia A", tag: "Peito · Ombro · Tríceps",
        color: COLORS.primary, bg: COLORS.primaryLight, type: "hypertrophy",
        exercises: ["Supino Reto", "Supino Inclinado", "Crossover", "Peck Deck",
            "Desenvolvimento com Halteres", "Elevação Lateral", "Tríceps Pulley", "Tríceps Testa"],
    },
    {
        id: "hyp_B", name: "Hipertrofia B", tag: "Costas · Bíceps · Pernas",
        color: COLORS.blue, bg: COLORS.blueLight, type: "hypertrophy",
        exercises: ["Puxada Frontal", "Remada Curvada", "Remada Unilateral", "Pull-over",
            "Rosca Direta", "Rosca Alternada", "Rosca Martelo",
            "Agachamento", "Leg Press", "Extensora", "Flexora", "Stiff"],
    },
    {
        id: "str_A", name: "Força A", tag: "Empurrar · Agachar",
        color: COLORS.orange, bg: COLORS.orangeLight, type: "strength",
        exercises: ["Agachamento Livre", "Supino Reto (Barra)", "Desenvolvimento Militar",
            "Agachamento Frontal", "Supino Inclinado (Barra)"],
    },
    {
        id: "str_B", name: "Força B", tag: "Puxar · Levantamento",
        color: COLORS.purple, bg: COLORS.purpleLight, type: "strength",
        exercises: ["Levantamento Terra", "Barra Fixa", "Remada Curvada (Barra)",
            "Terra Sumô", "Rosca Direta (Barra)", "Tríceps Mergulho"],
    },
];

const ALL_EXERCISES = [
    "Supino Reto", "Supino Inclinado", "Crossover", "Peck Deck", "Supino Reto (Barra)", "Supino Inclinado (Barra)",
    "Puxada Frontal", "Remada Curvada", "Remada Unilateral", "Pull-over", "Barra Fixa", "Remada Curvada (Barra)",
    "Desenvolvimento com Halteres", "Desenvolvimento Militar", "Elevação Lateral", "Elevação Frontal", "Crucifixo",
    "Rosca Direta", "Rosca Alternada", "Rosca Martelo", "Rosca Direta (Barra)", "Rosca Concentrada",
    "Tríceps Pulley", "Tríceps Testa", "Tríceps Mergulho", "Tríceps Banco",
    "Agachamento", "Agachamento Livre", "Agachamento Frontal", "Leg Press", "Extensora", "Flexora", "Stiff", "Afundo",
    "Levantamento Terra", "Terra Sumô", "Hip Thrust", "Panturrilha",
    "Abdominais", "Prancha", "Power Clean", "Farmer Walk",
];

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface ActiveSession { id: number; name: string; exercises: string[] }
type TrainingFilter = "hypertrophy" | "strength";

export function WorkoutScreen() {
    const { userId } = useAuth();

    const [view, setView]                 = useState<"home" | "session">("home");
    const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
    const [trainingFilter, setTrainingFilter] = useState<TrainingFilter>("hypertrophy");

    const [userTemplates, setUserTemplates] = useState<WorkoutTemplate[]>([]);
    const [sessions,      setSessions]      = useState<WorkoutSession[]>([]);
    const [allLogs,       setAllLogs]       = useState<WorkoutLog[]>([]);
    const [loading,       setLoading]       = useState(true);

    // Modais
    const [showStartModal,    setShowStartModal]    = useState(false);
    const [showExPickerModal, setShowExPickerModal] = useState(false);
    const [showSaveModal,     setShowSaveModal]     = useState(false);
    const [showCreateModal,   setShowCreateModal]   = useState(false);
    const [showDeleteModal,   setShowDeleteModal]   = useState<WorkoutTemplate | null>(null);

    // Formulário de série
    const [addingSetFor, setAddingSetFor] = useState<string | null>(null);
    const [setWeight,    setSetWeight]    = useState("");
    const [setReps,      setSetReps]      = useState("");
    const [savingSet,    setSavingSet]    = useState(false);

    // Criar/salvar template
    const [newTplName,      setNewTplName]      = useState("");
    const [newTplExercises, setNewTplExercises] = useState<string[]>([]);
    const [saveTplName,     setSaveTplName]     = useState("");

    useEffect(() => { loadAll(); }, []);

    async function loadAll() {
        if (!userId) return;
        try {
            const [logs, templates, sess, plan] = await Promise.all([
                getWorkoutLogs(userId),
                getUserTemplates(userId),
                getSessions(userId),
                getLatestPlan(userId),
            ]);
            setAllLogs(logs);
            setUserTemplates(templates);
            setSessions(sess);
            if (plan?.goal_training === "strength") setTrainingFilter("strength");
            else setTrainingFilter("hypertrophy");
        } catch {
            Alert.alert("Erro", "Não foi possível carregar os dados");
        } finally {
            setLoading(false);
        }
    }

    // ─── Sessão ───────────────────────────────────────────────────────────────
    async function startSession(name: string, exercises: string[]) {
        if (!userId) return;
        setShowStartModal(false);
        try {
            const session = await createSession(userId, name);
            setActiveSession({ id: session.id, name, exercises });
            setView("session");
            setSessions(prev => [session, ...prev]);
        } catch {
            Alert.alert("Erro", "Não foi possível iniciar o treino");
        }
    }

    function endSession() {
        setActiveSession(null);
        setView("home");
        setAddingSetFor(null);
        loadAll();
    }

    // ─── Série ────────────────────────────────────────────────────────────────
    async function handleAddSet(exerciseName: string) {
        if (!userId || !activeSession) return;
        const todaySets = getSessionSets(exerciseName);
        setSavingSet(true);
        try {
            const log = await addWorkoutLog({
                userId,
                exerciseName,
                weightKg:  setWeight ? Number(setWeight) : undefined,
                reps:      setReps   ? Number(setReps)   : undefined,
                sets:      1,
                setNumber: todaySets.length + 1,
                sessionId: activeSession.id,
            });
            setAllLogs(prev => [...prev, log]);
            setAddingSetFor(null);
            setSetWeight("");
            setSetReps("");
        } catch {
            Alert.alert("Erro", "Não foi possível salvar a série");
        } finally {
            setSavingSet(false);
        }
    }

    function addExerciseToSession(name: string) {
        if (!activeSession) return;
        if (!activeSession.exercises.includes(name))
            setActiveSession(prev => prev ? { ...prev, exercises: [...prev.exercises, name] } : prev);
        setShowExPickerModal(false);
    }

    // ─── Templates ───────────────────────────────────────────────────────────
    async function handleSaveAsTemplate() {
        if (!userId || !activeSession || !saveTplName.trim()) return;
        try {
            const tpl = await saveTemplate(userId, saveTplName.trim(), activeSession.exercises);
            setUserTemplates(prev => [tpl, ...prev]);
            setShowSaveModal(false);
            setSaveTplName("");
            Alert.alert("Salvo!", `Template "${tpl.name}" salvo.`);
        } catch { Alert.alert("Erro", "Não foi possível salvar o template"); }
    }

    async function handleCreateTemplate() {
        if (!userId || !newTplName.trim() || newTplExercises.length === 0)
            return Alert.alert("Atenção", "Preencha o nome e selecione ao menos um exercício");
        try {
            const tpl = await saveTemplate(userId, newTplName.trim(), newTplExercises);
            setUserTemplates(prev => [tpl, ...prev]);
            setShowCreateModal(false);
            setNewTplName("");
            setNewTplExercises([]);
        } catch { Alert.alert("Erro", "Não foi possível criar o template"); }
    }

    async function handleDeleteTemplate(tpl: WorkoutTemplate) {
        try {
            await deleteTemplate(tpl.id);
            setUserTemplates(prev => prev.filter(t => t.id !== tpl.id));
            setShowDeleteModal(null);
        } catch { Alert.alert("Erro", "Não foi possível excluir"); }
    }

    // ─── Helpers de sets ──────────────────────────────────────────────────────
    function getSessionSets(exerciseName: string): WorkoutLog[] {
        if (!activeSession) return [];
        return allLogs
            .filter(l => l.exercise_name === exerciseName && l.session_id === activeSession.id)
            .sort((a, b) => (a.set_number ?? 0) - (b.set_number ?? 0));
    }

    function getPrevSets(exerciseName: string): WorkoutLog[] {
        if (!activeSession) return [];
        // Apenas logs de sessões anteriores válidas (session_id não nulo)
        const prev = allLogs.filter(
            l => l.exercise_name === exerciseName &&
                 l.session_id !== null &&
                 l.session_id !== activeSession.id
        );
        if (!prev.length) return [];
        // Encontrar a sessão mais recente dentre os logs anteriores
        const latestSessionId = prev.reduce((best, l) => {
            if (best === null) return l.session_id!;
            const bestLog = prev.find(x => x.session_id === best);
            const curLog  = prev.find(x => x.session_id === l.session_id);
            if (!bestLog || !curLog) return best;
            return new Date(curLog.logged_at) > new Date(bestLog.logged_at) ? l.session_id! : best;
        }, null as number | null);
        if (latestSessionId === null) return [];
        return prev
            .filter(l => l.session_id === latestSessionId)
            .sort((a, b) => (a.set_number ?? 0) - (b.set_number ?? 0));
    }

    const filteredBuiltin = BUILTIN.filter(t => t.type === trainingFilter);

    // ─── Render: HOME ─────────────────────────────────────────────────────────
    if (view === "home") {
        return (
            <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
                <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                    <Text style={styles.title}>Treino</Text>

                    <TouchableOpacity style={[styles.startBtn, SHADOW]} onPress={() => setShowStartModal(true)}>
                        <Text style={styles.startBtnText}>Iniciar Treino</Text>
                        <Text style={styles.startBtnSub}>Escolha um template ou comece do zero</Text>
                    </TouchableOpacity>

                    {/* Filtro de tipo de treino */}
                    <View style={styles.filterRow}>
                        {(["hypertrophy", "strength"] as TrainingFilter[]).map(f => (
                            <TouchableOpacity
                                key={f}
                                style={[styles.filterBtn, trainingFilter === f && styles.filterBtnActive]}
                                onPress={() => setTrainingFilter(f)}
                            >
                                <Text style={[styles.filterBtnText, trainingFilter === f && styles.filterBtnTextActive]}>
                                    {f === "hypertrophy" ? "Hipertrofia" : "Força"}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Templates embutidos filtrados */}
                    <Text style={styles.sectionTitle}>Treinos de Exemplo</Text>
                    <View style={styles.tplGrid}>
                        {filteredBuiltin.map(t => (
                            <TouchableOpacity
                                key={t.id}
                                style={[styles.tplCard, { borderLeftColor: t.color }, SHADOW]}
                                onPress={() => startSession(t.name, t.exercises)}
                                activeOpacity={0.8}
                            >
                                <View style={[styles.tplDot, { backgroundColor: t.bg }]}>
                                    <Text style={[styles.tplDotText, { color: t.color }]}>
                                        {t.name.includes("A") ? "A" : "B"}
                                    </Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.tplName}>{t.name}</Text>
                                    <Text style={styles.tplTag}>{t.tag}</Text>
                                    <Text style={styles.tplCount}>{t.exercises.length} exercícios</Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Meus treinos */}
                    <View style={styles.sectionRow}>
                        <Text style={styles.sectionTitle}>Meus Treinos</Text>
                        <TouchableOpacity onPress={() => setShowCreateModal(true)}>
                            <Text style={styles.sectionAction}>+ Criar</Text>
                        </TouchableOpacity>
                    </View>
                    {loading ? (
                        <ActivityIndicator color={COLORS.primary} />
                    ) : userTemplates.length === 0 ? (
                        <Text style={styles.emptyText}>Nenhum treino salvo ainda.</Text>
                    ) : (
                        userTemplates.map(t => (
                            <View key={t.id} style={[styles.userTplCard, SHADOW]}>
                                <TouchableOpacity style={{ flex: 1 }} onPress={() => startSession(t.name, t.exercises)}>
                                    <Text style={styles.userTplName}>{t.name}</Text>
                                    <Text style={styles.userTplCount}>{t.exercises.length} exercícios · Toque para iniciar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.deleteBtn} onPress={() => setShowDeleteModal(t)}>
                                    <Text style={styles.deleteBtnText}>✕</Text>
                                </TouchableOpacity>
                            </View>
                        ))
                    )}

                    {/* Histórico */}
                    <Text style={[styles.sectionTitle, { marginTop: 8 }]}>Histórico</Text>
                    {sessions.length === 0 ? (
                        <Text style={styles.emptyText}>Nenhum treino realizado ainda.</Text>
                    ) : (
                        sessions.slice(0, 10).map(s => (
                            <View key={s.id} style={[styles.histCard, SHADOW]}>
                                <View>
                                    <Text style={styles.histName}>{s.name}</Text>
                                    <Text style={styles.histDate}>
                                        {new Date(s.started_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                                    </Text>
                                </View>
                                <View style={styles.histStats}>
                                    <Text style={styles.histStat}>{s.exercise_count ?? 0} exerc.</Text>
                                    <Text style={styles.histStat}>{s.set_count ?? 0} séries</Text>
                                </View>
                            </View>
                        ))
                    )}
                    <View style={{ height: 32 }} />
                </ScrollView>

                {/* Modal: Iniciar treino */}
                <Modal visible={showStartModal} animationType="slide" transparent>
                    <View style={styles.overlay}>
                        <View style={styles.sheet}>
                            <View style={styles.sheetHeader}>
                                <Text style={styles.sheetTitle}>Iniciar Treino</Text>
                                <TouchableOpacity onPress={() => setShowStartModal(false)}>
                                    <Text style={styles.sheetClose}>✕</Text>
                                </TouchableOpacity>
                            </View>
                            <ScrollView>
                                <Text style={styles.sheetSection}>Treinos de Exemplo</Text>
                                {filteredBuiltin.map(t => (
                                    <TouchableOpacity key={t.id} style={[styles.sheetItem, { borderLeftColor: t.color }]}
                                        onPress={() => startSession(t.name, t.exercises)}>
                                        <Text style={styles.sheetItemName}>{t.name}</Text>
                                        <Text style={styles.sheetItemTag}>{t.tag}</Text>
                                    </TouchableOpacity>
                                ))}
                                {userTemplates.length > 0 && (
                                    <>
                                        <Text style={styles.sheetSection}>Meus Treinos</Text>
                                        {userTemplates.map(t => (
                                            <TouchableOpacity key={t.id} style={[styles.sheetItem, { borderLeftColor: COLORS.purple }]}
                                                onPress={() => startSession(t.name, t.exercises)}>
                                                <Text style={styles.sheetItemName}>{t.name}</Text>
                                                <Text style={styles.sheetItemTag}>{t.exercises.length} exercícios</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </>
                                )}
                                <Text style={styles.sheetSection}>Personalizado</Text>
                                <TouchableOpacity style={[styles.sheetItem, { borderLeftColor: COLORS.textMuted }]}
                                    onPress={() => startSession("Treino Livre", [])}>
                                    <Text style={styles.sheetItemName}>Treino Livre</Text>
                                    <Text style={styles.sheetItemTag}>Adicione exercícios durante o treino</Text>
                                </TouchableOpacity>
                            </ScrollView>
                        </View>
                    </View>
                </Modal>

                {/* Modal: Criar template */}
                <Modal visible={showCreateModal} animationType="slide" transparent>
                    <View style={styles.overlay}>
                        <View style={[styles.sheet, { maxHeight: "85%" }]}>
                            <View style={styles.sheetHeader}>
                                <Text style={styles.sheetTitle}>Criar Template</Text>
                                <TouchableOpacity onPress={() => { setShowCreateModal(false); setNewTplExercises([]); setNewTplName(""); }}>
                                    <Text style={styles.sheetClose}>✕</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={{ padding: 16, flex: 1 }}>
                                <Text style={styles.fieldLabel}>NOME DO TREINO</Text>
                                <TextInput
                                    value={newTplName}
                                    onChangeText={setNewTplName}
                                    placeholder="Ex: Meu Treino A"
                                    placeholderTextColor={COLORS.textMuted}
                                    style={styles.input}
                                />
                                <Text style={[styles.fieldLabel, { marginTop: 12 }]}>
                                    EXERCÍCIOS ({newTplExercises.length})
                                </Text>
                                <ScrollView style={{ maxHeight: 240 }}>
                                    {ALL_EXERCISES.map(ex => {
                                        const selected = newTplExercises.includes(ex);
                                        return (
                                            <TouchableOpacity key={ex}
                                                style={[styles.exItem, selected && styles.exItemSelected]}
                                                onPress={() => setNewTplExercises(prev =>
                                                    selected ? prev.filter(e => e !== ex) : [...prev, ex]
                                                )}>
                                                <Text style={[styles.exItemText, selected && styles.exItemTextSel]}>{ex}</Text>
                                                {selected && <Text style={{ color: COLORS.primary }}>✓</Text>}
                                            </TouchableOpacity>
                                        );
                                    })}
                                </ScrollView>
                                <TouchableOpacity style={styles.saveBtn} onPress={handleCreateTemplate}>
                                    <Text style={styles.saveBtnText}>Salvar Template</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

                {/* Modal: Confirmar exclusão */}
                <Modal visible={!!showDeleteModal} animationType="fade" transparent>
                    <View style={[styles.overlay, { justifyContent: "center" }]}>
                        <View style={[styles.sheet, { maxHeight: 200, padding: 20 }]}>
                            <Text style={styles.sheetTitle}>Excluir "{showDeleteModal?.name}"?</Text>
                            <Text style={{ color: COLORS.textSecondary, marginBottom: 20 }}>Esta ação não pode ser desfeita.</Text>
                            <View style={{ flexDirection: "row", gap: 10 }}>
                                <TouchableOpacity style={[styles.saveBtn, { flex: 1, backgroundColor: COLORS.border }]} onPress={() => setShowDeleteModal(null)}>
                                    <Text style={[styles.saveBtnText, { color: COLORS.text }]}>Cancelar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.saveBtn, { flex: 1, backgroundColor: COLORS.red }]} onPress={() => showDeleteModal && handleDeleteTemplate(showDeleteModal)}>
                                    <Text style={styles.saveBtnText}>Excluir</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>
        );
    }

    // ─── Render: SESSION ──────────────────────────────────────────────────────
    if (!activeSession) return null;

    return (
        <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
            <View style={[styles.sessionHeader, SHADOW]}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.sessionName}>{activeSession.name}</Text>
                    <Text style={styles.sessionSub}>
                        {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
                    </Text>
                </View>
                <View style={{ flexDirection: "row", gap: 8 }}>
                    <TouchableOpacity style={styles.saveTplBtn} onPress={() => { setSaveTplName(activeSession.name); setShowSaveModal(true); }}>
                        <Text style={styles.saveTplBtnText}>Salvar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.endBtn} onPress={endSession}>
                        <Text style={styles.endBtnText}>Encerrar</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView style={styles.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                {activeSession.exercises.map(exName => {
                    const todaySets = getSessionSets(exName);
                    const prevSets  = getPrevSets(exName);
                    const isAdding  = addingSetFor === exName;
                    const hasPrev   = prevSets.length > 0;

                    return (
                        <View key={exName} style={[styles.exCard, SHADOW]}>
                            <View style={styles.exCardHeader}>
                                <Text style={styles.exCardName}>{exName}</Text>
                                <Text style={styles.exCardCount}>{todaySets.length} série{todaySets.length !== 1 ? "s" : ""}</Text>
                            </View>

                            {todaySets.length > 0 && (
                                <View style={styles.setsTable}>
                                    {/* Cabeçalho */}
                                    <View style={styles.setsHeader}>
                                        <Text style={[styles.setCellNum, styles.setCellHead]}>S</Text>
                                        <Text style={[styles.setCell,    styles.setCellHead]}>Peso</Text>
                                        <Text style={[styles.setCell,    styles.setCellHead]}>Reps</Text>
                                        {hasPrev && <Text style={[styles.setCell, styles.setCellHead]}>Anterior</Text>}
                                    </View>
                                    {todaySets.map((log, i) => {
                                        const p = prevSets[i];

                                        // Comparação: peso primeiro, depois reps se peso igual
                                        const curW = log.weight_kg != null ? Math.round(Number(log.weight_kg)) : null;
                                        const preW = p?.weight_kg  != null ? Math.round(Number(p.weight_kg))  : null;
                                        const curR = log.reps ?? null;
                                        const preR = p?.reps  ?? null;

                                        let indicator: "up" | "down" | "none" = "none";
                                        if (p) {
                                            if (curW !== null && preW !== null) {
                                                if (curW > preW)       indicator = "up";
                                                else if (curW < preW)  indicator = "down";
                                                else if (curR !== null && preR !== null) {
                                                    if (curR > preR)      indicator = "up";
                                                    else if (curR < preR) indicator = "down";
                                                }
                                            } else if (curR !== null && preR !== null) {
                                                if (curR > preR)      indicator = "up";
                                                else if (curR < preR) indicator = "down";
                                            }
                                        }

                                        return (
                                            <View key={log.id} style={[styles.setsRow, i % 2 === 1 && { backgroundColor: "#F9FAFB" }]}>
                                                <Text style={[styles.setCellNum, { color: COLORS.textSecondary }]}>{log.set_number ?? i + 1}</Text>
                                                <Text style={[styles.setCell,
                                                    indicator === "up"   && { color: COLORS.primary, fontWeight: "700" },
                                                    indicator === "down" && { color: COLORS.red,     fontWeight: "700" },
                                                ]}>
                                                    {curW != null ? `${curW}kg` : "—"}
                                                    {indicator === "up" ? " ↑" : indicator === "down" ? " ↓" : ""}
                                                </Text>
                                                <Text style={[styles.setCell,
                                                    indicator === "up"   && curW === preW && { color: COLORS.primary, fontWeight: "700" },
                                                    indicator === "down" && curW === preW && { color: COLORS.red,     fontWeight: "700" },
                                                ]}>
                                                    {curR ?? "—"}
                                                </Text>
                                                {hasPrev && (
                                                    <Text style={[styles.setCell, { color: COLORS.textMuted }]}>
                                                        {p ? `${preW != null ? preW : "—"}kg×${preR ?? "—"}` : "—"}
                                                    </Text>
                                                )}
                                            </View>
                                        );
                                    })}
                                </View>
                            )}

                            {todaySets.length === 0 && prevSets.length > 0 && (
                                <View style={styles.prevHint}>
                                    <Text style={styles.prevHintLabel}>Última sessão</Text>
                                    <Text style={styles.prevHintText}>
                                        {prevSets.map((p, i) => {
                                            const w = p.weight_kg != null ? Math.round(Number(p.weight_kg)) : "—";
                                            return `S${i + 1}: ${w}kg × ${p.reps ?? "—"}`;
                                        }).join("   ")}
                                    </Text>
                                </View>
                            )}

                            {isAdding ? (
                                <View style={styles.addSetForm}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.fieldLabel}>PESO (kg)</Text>
                                        <TextInput
                                            value={setWeight}
                                            onChangeText={setSetWeight}
                                            placeholder={prevSets[0]?.weight_kg != null ? `${prevSets[0].weight_kg}` : "0"}
                                            placeholderTextColor={COLORS.textMuted}
                                            keyboardType="decimal-pad"
                                            style={styles.setInput}
                                        />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.fieldLabel}>REPS</Text>
                                        <TextInput
                                            value={setReps}
                                            onChangeText={setSetReps}
                                            placeholder={prevSets[0]?.reps != null ? `${prevSets[0].reps}` : "10"}
                                            placeholderTextColor={COLORS.textMuted}
                                            keyboardType="numeric"
                                            style={styles.setInput}
                                        />
                                    </View>
                                    <View style={styles.addSetActions}>
                                        <TouchableOpacity style={[styles.addSetOk, savingSet && { opacity: 0.6 }]}
                                            onPress={() => handleAddSet(exName)} disabled={savingSet}>
                                            <Text style={{ color: "#fff", fontWeight: "700" }}>{savingSet ? "..." : "✓"}</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.addSetCancel}
                                            onPress={() => { setAddingSetFor(null); setSetWeight(""); setSetReps(""); }}>
                                            <Text style={{ color: COLORS.textSecondary, fontWeight: "700" }}>✕</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ) : (
                                <TouchableOpacity style={styles.addSerieBtn}
                                    onPress={() => { setAddingSetFor(exName); setSetWeight(""); setSetReps(""); }}>
                                    <Text style={styles.addSerieBtnText}>+ Adicionar Série</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    );
                })}

                <TouchableOpacity style={[styles.addExBtn, SHADOW]} onPress={() => setShowExPickerModal(true)}>
                    <Text style={styles.addExBtnText}>+ Adicionar Exercício</Text>
                </TouchableOpacity>
                <View style={{ height: 32 }} />
            </ScrollView>

            {/* Modal: Adicionar exercício */}
            <Modal visible={showExPickerModal} animationType="slide" transparent>
                <View style={styles.overlay}>
                    <View style={[styles.sheet, { maxHeight: "70%" }]}>
                        <View style={styles.sheetHeader}>
                            <Text style={styles.sheetTitle}>Adicionar Exercício</Text>
                            <TouchableOpacity onPress={() => setShowExPickerModal(false)}>
                                <Text style={styles.sheetClose}>✕</Text>
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={ALL_EXERCISES}
                            keyExtractor={item => item}
                            renderItem={({ item }) => {
                                const included = activeSession.exercises.includes(item);
                                return (
                                    <TouchableOpacity
                                        style={[styles.sheetItem, included && { opacity: 0.4 }]}
                                        onPress={() => addExerciseToSession(item)}
                                        disabled={included}
                                    >
                                        <Text style={styles.sheetItemName}>{item}</Text>
                                        {included && <Text style={{ color: COLORS.textMuted, fontSize: 12 }}>já incluído</Text>}
                                    </TouchableOpacity>
                                );
                            }}
                            ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: COLORS.border }} />}
                        />
                    </View>
                </View>
            </Modal>

            {/* Modal: Salvar como template */}
            <Modal visible={showSaveModal} animationType="fade" transparent>
                <View style={[styles.overlay, { justifyContent: "center" }]}>
                    <View style={[styles.sheet, { padding: 20, maxHeight: 260 }]}>
                        <Text style={styles.sheetTitle}>Salvar como Template</Text>
                        <Text style={styles.fieldLabel}>NOME DO TEMPLATE</Text>
                        <TextInput
                            value={saveTplName}
                            onChangeText={setSaveTplName}
                            placeholder="Nome do treino"
                            placeholderTextColor={COLORS.textMuted}
                            style={[styles.input, { marginBottom: 16 }]}
                        />
                        <View style={{ flexDirection: "row", gap: 10 }}>
                            <TouchableOpacity style={[styles.saveBtn, { flex: 1, backgroundColor: COLORS.border }]} onPress={() => setShowSaveModal(false)}>
                                <Text style={[styles.saveBtnText, { color: COLORS.text }]}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.saveBtn, { flex: 1 }]} onPress={handleSaveAsTemplate}>
                                <Text style={styles.saveBtnText}>Salvar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container:       { flex: 1, padding: 16 },
    title:           { fontSize: 24, fontWeight: "800", color: COLORS.text, marginBottom: 16 },
    startBtn:        { backgroundColor: COLORS.purple, borderRadius: 14, padding: 18, marginBottom: 16 },
    startBtnText:    { color: "#fff", fontSize: 17, fontWeight: "800", marginBottom: 2 },
    startBtnSub:     { color: "#ffffff99", fontSize: 13 },

    filterRow:       { flexDirection: "row", gap: 8, marginBottom: 20 },
    filterBtn:       { flex: 1, paddingVertical: 9, borderRadius: 10, borderWidth: 1.5, borderColor: COLORS.border, alignItems: "center" },
    filterBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    filterBtnText:   { fontSize: 13, fontWeight: "700", color: COLORS.textSecondary },
    filterBtnTextActive: { color: "#fff" },

    sectionTitle:    { fontSize: 15, fontWeight: "700", color: COLORS.text, marginBottom: 10 },
    sectionRow:      { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
    sectionAction:   { color: COLORS.primary, fontWeight: "700", fontSize: 14 },
    tplGrid:         { gap: 10, marginBottom: 24 },
    tplCard:         { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: COLORS.card, borderRadius: 12, padding: 14, borderLeftWidth: 4 },
    tplDot:          { width: 40, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center" },
    tplDotText:      { fontSize: 18, fontWeight: "800" },
    tplName:         { fontSize: 14, fontWeight: "700", color: COLORS.text },
    tplTag:          { fontSize: 12, color: COLORS.textMuted, marginTop: 1 },
    tplCount:        { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
    userTplCard:     { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.card, borderRadius: 12, padding: 14, marginBottom: 8 },
    userTplName:     { fontSize: 14, fontWeight: "700", color: COLORS.text },
    userTplCount:    { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
    deleteBtn:       { width: 30, height: 30, borderRadius: 15, backgroundColor: COLORS.redLight, alignItems: "center", justifyContent: "center" },
    deleteBtnText:   { color: COLORS.red, fontWeight: "700", fontSize: 12 },
    histCard:        { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: COLORS.card, borderRadius: 12, padding: 14, marginBottom: 8 },
    histName:        { fontSize: 14, fontWeight: "600", color: COLORS.text },
    histDate:        { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
    histStats:       { alignItems: "flex-end", gap: 2 },
    histStat:        { fontSize: 12, color: COLORS.textSecondary, fontWeight: "600" },
    emptyText:       { color: COLORS.textMuted, textAlign: "center", paddingVertical: 12, fontSize: 13 },

    // Session
    sessionHeader:   { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: COLORS.card, padding: 16, paddingTop: 20 },
    sessionName:     { fontSize: 17, fontWeight: "800", color: COLORS.text },
    sessionSub:      { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
    saveTplBtn:      { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8, borderWidth: 1.5, borderColor: COLORS.primary },
    saveTplBtnText:  { color: COLORS.primary, fontWeight: "700", fontSize: 13 },
    endBtn:          { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8, backgroundColor: COLORS.red },
    endBtnText:      { color: "#fff", fontWeight: "700", fontSize: 13 },

    // Exercise card
    exCard:          { backgroundColor: COLORS.card, borderRadius: 12, padding: 14, marginBottom: 10 },
    exCardHeader:    { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
    exCardName:      { fontSize: 15, fontWeight: "700", color: COLORS.text, flex: 1 },
    exCardCount:     { fontSize: 12, color: COLORS.textMuted },

    // Sets table — coluna de número mais estreita para alinhar melhor
    setsTable:       { borderRadius: 8, overflow: "hidden", borderWidth: 1, borderColor: COLORS.border, marginBottom: 8 },
    setsHeader:      { flexDirection: "row", backgroundColor: COLORS.bg },
    setsRow:         { flexDirection: "row", backgroundColor: COLORS.card },
    setCellHead:     { fontWeight: "700", color: COLORS.textSecondary, fontSize: 11 },
    setCellNum:      { width: 32, paddingVertical: 8, paddingHorizontal: 4, fontSize: 13, color: COLORS.text, textAlign: "center" },
    setCell:         { flex: 1, padding: 8, fontSize: 13, color: COLORS.text, textAlign: "center" },

    prevHint:        { backgroundColor: COLORS.bg, borderRadius: 8, padding: 10, marginBottom: 8 },
    prevHintLabel:   { fontSize: 11, fontWeight: "700", color: COLORS.textMuted, textTransform: "uppercase", marginBottom: 3 },
    prevHintText:    { fontSize: 13, color: COLORS.textSecondary },
    addSetForm:      { flexDirection: "row", gap: 8, alignItems: "flex-end" },
    fieldLabel:      { fontSize: 10, fontWeight: "700", color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 },
    setInput:        { borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 8, padding: 10, fontSize: 14, color: COLORS.text, backgroundColor: COLORS.bg },
    addSetActions:   { flexDirection: "row", gap: 6, alignSelf: "flex-end", marginBottom: 2 },
    addSetOk:        { width: 36, height: 36, borderRadius: 8, backgroundColor: COLORS.primary, alignItems: "center", justifyContent: "center" },
    addSetCancel:    { width: 36, height: 36, borderRadius: 8, backgroundColor: COLORS.border, alignItems: "center", justifyContent: "center" },
    addSerieBtn:     { borderWidth: 1.5, borderColor: COLORS.purple, borderRadius: 8, padding: 8, alignItems: "center", borderStyle: "dashed" },
    addSerieBtnText: { color: COLORS.purple, fontWeight: "600", fontSize: 13 },
    addExBtn:        { backgroundColor: COLORS.card, borderRadius: 12, padding: 14, alignItems: "center", marginBottom: 8 },
    addExBtnText:    { color: COLORS.primary, fontWeight: "700", fontSize: 14 },

    // Modais
    overlay:         { flex: 1, backgroundColor: "#00000066", justifyContent: "flex-end" },
    sheet:           { backgroundColor: COLORS.card, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
    sheetHeader:     { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
    sheetTitle:      { fontSize: 16, fontWeight: "700", color: COLORS.text },
    sheetClose:      { fontSize: 16, color: COLORS.textMuted, padding: 4 },
    sheetSection:    { fontSize: 11, fontWeight: "700", color: COLORS.textMuted, textTransform: "uppercase", paddingHorizontal: 16, paddingTop: 14, paddingBottom: 4 },
    sheetItem:       { padding: 14, paddingHorizontal: 16, borderLeftWidth: 3, borderLeftColor: "transparent", marginHorizontal: 8, borderRadius: 8, marginVertical: 2 },
    sheetItemName:   { fontSize: 15, fontWeight: "600", color: COLORS.text },
    sheetItemTag:    { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
    input:           { borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 10, padding: 12, fontSize: 15, color: COLORS.text, backgroundColor: COLORS.bg, marginBottom: 4 },
    exItem:          { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 12, borderRadius: 8, marginBottom: 2 },
    exItemSelected:  { backgroundColor: COLORS.primaryLight },
    exItemText:      { fontSize: 14, color: COLORS.text },
    exItemTextSel:   { color: COLORS.primary, fontWeight: "600" },
    saveBtn:         { backgroundColor: COLORS.primary, borderRadius: 10, padding: 13, alignItems: "center", marginTop: 8 },
    saveBtnText:     { color: "#fff", fontWeight: "700", fontSize: 14 },
});
