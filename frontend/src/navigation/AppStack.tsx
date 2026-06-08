import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import HomeScreen from "../screens/home";
import { ProfileScreen } from "../screens/profile";
import { GeneratePlanScreen } from "../screens/GeneratePlanScreen";
import { WeightTrackerScreen } from "../screens/WeightTrackerScreen";
import { WorkoutScreen } from "../screens/WorkoutScreen";
import { FoodLogScreen } from "../screens/FoodLogScreen";
import { COLORS } from "../theme";

// ─── Tipos de navegação ───────────────────────────────────────────────────────
export type RootStackParamList = {
    MainTabs: undefined;
    GeneratePlan: undefined;
    WeightTracker: undefined;
    Details: { userId: string };
};

export type TabParamList = {
    Home: undefined;
    Dieta: undefined;
    Treino: undefined;
    Perfil: undefined;
};

const RootStack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// ─── Ícones da tab bar ────────────────────────────────────────────────────────
function TabIcon({ label, focused }: { label: string; focused: boolean }) {
    const icons: Record<string, string> = {
        Home: "🏠", Dieta: "🥗", Treino: "💪", Perfil: "👤",
    };
    return (
        <View style={tabIconStyles.wrap}>
            <Text style={[tabIconStyles.icon, focused && tabIconStyles.iconFocused]}>
                {icons[label]}
            </Text>
        </View>
    );
}

const tabIconStyles = StyleSheet.create({
    wrap:         { alignItems: "center", justifyContent: "center" },
    icon:         { fontSize: 22, opacity: 0.45 },
    iconFocused:  { opacity: 1 },
});

// ─── Tab Navigator ────────────────────────────────────────────────────────────
function MainTabs() {
    const insets = useSafeAreaInsets();
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ focused }) => <TabIcon label={route.name} focused={focused} />,
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: COLORS.textMuted,
                tabBarStyle: {
                    backgroundColor: COLORS.card,
                    borderTopColor: COLORS.border,
                    borderTopWidth: 1,
                    height: 60 + insets.bottom,
                    paddingBottom: 8 + insets.bottom,
                    paddingTop: 4,
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: "600",
                },
            })}
        >
            <Tab.Screen name="Home"   component={HomeScreen}   options={{ title: "Home" }} />
            <Tab.Screen name="Dieta"  component={FoodLogScreen} options={{ title: "Dieta" }} />
            <Tab.Screen name="Treino" component={WorkoutScreen} options={{ title: "Treino" }} />
            <Tab.Screen name="Perfil" component={ProfileScreen} options={{ title: "Perfil" }} />
        </Tab.Navigator>
    );
}

// ─── Root Stack (tabs + telas modais) ────────────────────────────────────────
export function AppStack() {
    return (
        <RootStack.Navigator
            screenOptions={{
                headerStyle: { backgroundColor: COLORS.card },
                headerTintColor: COLORS.text,
                headerTitleStyle: { fontWeight: "700" },
                headerShadowVisible: false,
                contentStyle: { backgroundColor: COLORS.bg },
            }}
        >
            <RootStack.Screen
                name="MainTabs"
                component={MainTabs}
                options={{ headerShown: false }}
            />
            <RootStack.Screen
                name="GeneratePlan"
                component={GeneratePlanScreen}
                options={{ title: "Gerar Plano" }}
            />
            <RootStack.Screen
                name="WeightTracker"
                component={WeightTrackerScreen}
                options={{ title: "Rastrear Peso" }}
            />
        </RootStack.Navigator>
    );
}
