
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
} from 'react-native';
import { supabase } from './supabase';

type Props = {
  language: 'English' | 'አማርኛ';
  role: 'worker' | 'employer';
  onSuccess: () => void;
  onBack: () => void;
};

export default function AuthScreen({
  language,
  role,
  onSuccess,
  onBack,
}: Props) {
  const am = language === 'አማርኛ';

  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const tr = (en: string, amh: string) => (am ? amh : en);

  async function submit() {
    if (!email.trim() || !password) {
      Alert.alert(
        tr('Missing information', 'መረጃ ይጎድላል'),
        tr(
          'Enter your email and password.',
          'ኢሜይልና የይለፍ ቃል ያስገቡ።'
        )
      );
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        tr('Password', 'የይለፍ ቃል'),
        tr(
          'Password must be at least 6 characters.',
          'የይለፍ ቃሉ ቢያንስ 6 ቁምፊዎች መሆን አለበት።'
        )
      );
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { data, error } =
          await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          });

        if (error) throw error;
        if (!data.user) {
          throw new Error('User information was not returned.');
        }

        const { data: profile, error: profileError } =
          await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.user.id)
            .maybeSingle();

        if (profileError) throw profileError;

        if (!profile) {
          throw new Error(
            'Your profile is missing. Please contact support.'
          );
        }

        if (profile.role !== role) {
          await supabase.auth.signOut();

          throw new Error(
            `This account is registered as ${
              profile.role === 'worker' ? 'a job seeker' : 'an employer'
            }. Go back and choose the matching option.`
          );
        }

        onSuccess();
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { role },
            emailRedirectTo: 'seratenga://auth',
          },
        });

        if (error) throw error;
        if (!data.user) {
          throw new Error('User information was not returned.');
        }

        if (data.session) {
          // The database trigger creates the profile.
          // Do not insert a duplicate profile here.
          onSuccess();
        } else {
          Alert.alert(
            tr('Check your email', 'ኢሜይልዎን ያረጋግጡ'),
            tr(
              'Open the confirmation email to activate your account, then return here and log in.',
              'መለያዎን ለማረጋገጥ ኢሜይልዎን ይክፈቱ፣ ከዚያ ይግቡ።'
            )
          );

          setIsLogin(true);
        }
      }
    } catch (error) {
      Alert.alert(
        tr('Error', 'ስህተት'),
        error instanceof Error
          ? error.message
          : 'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.logo}>Seratenga</Text>

        <Text style={styles.title}>
          {isLogin
            ? tr('Welcome back', 'እንኳን ደህና መጡ')
            : tr('Create your account', 'መለያ ይፍጠሩ')}
        </Text>

        <Text style={styles.subtitle}>
          {tr(
            role === 'worker'
              ? 'Looking for a job'
              : 'Looking for a worker',
            role === 'worker' ? 'ሥራ ፈላጊ' : 'ሠራተኛ ፈላጊ'
          )}
        </Text>

        <Text style={styles.label}>Email / ኢሜይል</Text>

        <TextInput
          style={styles.input}
          placeholder="you@example.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!loading}
        />

        <Text style={styles.label}>
          {tr('Password', 'የይለፍ ቃል')}
        </Text>

        <TextInput
          style={styles.input}
          placeholder={tr('Enter password', 'የይለፍ ቃል ያስገቡ')}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          editable={!loading}
        />

        <Pressable
          style={[styles.button, loading && { opacity: 0.6 }]}
          onPress={submit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>
              {isLogin
                ? tr('Log in', 'ግባ')
                : tr('Create account', 'መለያ ፍጠር')}
            </Text>
          )}
        </Pressable>

        <Pressable
          style={styles.link}
          onPress={() => setIsLogin(!isLogin)}
          disabled={loading}
        >
          <Text style={styles.linkText}>
            {isLogin
              ? tr(
                  "Don't have an account? Sign up",
                  'መለያ የለዎትም? ይመዝገቡ'
                )
              : tr(
                  'Already have an account? Log in',
                  'መለያ አለዎት? ይግቡ'
                )}
          </Text>
        </Pressable>

        <Pressable
          style={styles.link}
          onPress={onBack}
          disabled={loading}
        >
          <Text style={styles.backText}>
            {tr('← Back', '← ተመለስ')}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8F4',
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 36,
  },
  logo: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#246B50',
    textAlign: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#24352B',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#657268',
    textAlign: 'center',
    marginBottom: 28,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#24352B',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D8E1D9',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 20,
    color: '#24352B',
  },
  button: {
    backgroundColor: '#246B50',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  link: {
    alignItems: 'center',
    paddingVertical: 18,
  },
  linkText: {
    color: '#246B50',
    fontSize: 14,
    textAlign: 'center',
  },
  backText: {
    color: '#657268',
    fontSize: 15,
  },
});
