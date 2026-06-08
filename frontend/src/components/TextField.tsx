import { View, Text, TextInput, StyleSheet } from 'react-native';
import { COLORS } from '../theme';

type Props = {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    secureTextEntry?: boolean;
    keyboardType?: 'default' | 'numeric' | 'decimal-pad' | 'email-address';
};

export function TextField({ label, value, onChangeText, placeholder, secureTextEntry, keyboardType }: Props) {
    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={COLORS.textMuted}
                secureTextEntry={secureTextEntry}
                autoCapitalize="none"
                keyboardType={keyboardType ?? 'default'}
                style={styles.input}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { marginBottom: 14 },
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.textSecondary,
        marginBottom: 6,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    input: {
        borderWidth: 1.5,
        borderColor: COLORS.border,
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 11,
        fontSize: 15,
        color: COLORS.text,
        backgroundColor: COLORS.card,
    },
});
