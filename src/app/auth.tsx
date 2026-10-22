
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import { supabase } from '../lib/supabase';

export default function AuthCallbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    code?: string | string[];
    token_hash?: string | string[];
    type?: string | string[];
  }>();

  const [message, setMessage] = useState('Confirming your email...');

  useEffect(() => {
    let active = true;

    async function confirmEmail() {
      try {
        const code = Array.isArray(params.code) ? params.code[0] : params.code;
        const tokenHash = Array.isArray(params.token_hash)
          ? params.token_hash[0]
          : params.token_hash;
        const type = Array.isArray(params.type) ? params.type[0] : params.type;

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        } else if (tokenHash && type === 'signup') {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: 'signup',
          });
          if (error) throw error;
        } else {
          throw new Error(
            'Confirmation information was not found in the link. Please request a new confirmation email.'
          );
        }

        if (!active) return;

        setMessage('Email confirmed! You can now return to Seratenga.');
        Alert.alert(
          'Email confirmed',
          'Your email has been confirmed. Please log in to continue.',
          [
            {
              text: 'Continue',
              onPress: () => router.replace('/'),
            },
          ]
        );
      } catch (error) {
        if (!active) return;

        const detail =
          error instanceof Error ? error.message : 'Please request a new confirmation email.';

        setMessage('We could not confirm your email.');
        Alert.alert('Confirmation failed', detail, [
          {
            text: 'Back to Seratenga',
            onPress: () => router.replace('/'),
          },
        ]);
      }
    }

    confirmEmail();

    return () => {
      active = false;
    };
  }, [params.code, params.token_hash, params.type, router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#246B50" />
      <Text style={styles.title}>Seratenga</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8F4',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },
  title: {
    marginTop: 24,
    fontSize: 28,
    fontWeight: 'bold',
    color: '#246B50',
  },
  message: {
    marginTop: 14,
    fontSize: 16,
    color: '#24352B',
    textAlign: 'center',
  },
});
