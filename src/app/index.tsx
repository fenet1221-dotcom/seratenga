
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { supabase } from '../lib/supabase';

type Role = 'worker' | 'employer';
type Language = 'en' | 'am';
type Page =
  | 'welcome'
  | 'role'
  | 'auth'
  | 'home'
  | 'profile'
  | 'browse'
  | 'jobForm'
  | 'inbox'
  | 'chat';

const GREEN = '#246B50';
const CREAM = '#F7F8F4';
const DARK = '#24352B';
const MUTED = '#657268';
const BORDER = '#DDE5DC';

const DUTIES = [
  'Ethiopian cooking / injera',
  'International cooking',
  'Cleaning',
  'Laundry',
  'Childcare',
  'Elderly care',
];

export default function Index() {
  const [page, setPage] = useState<Page>('welcome');
  const [language, setLanguage] = useState<Language>('en');
  const [role, setRole] = useState<Role>('worker');
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [loginMode, setLoginMode] = useState(true);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [experience, setExperience] = useState('');
  const [salary, setSalary] = useState('');
  const [about, setAbout] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [living, setLiving] = useState('Live-out');
  const [languages, setLanguages] = useState('Amharic');

  const [search, setSearch] = useState('');
  const [listings, setListings] = useState<any[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConversation, setActiveConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageText, setMessageText] = useState('');

  const [jobTitle, setJobTitle] = useState('');
  const [jobLocation, setJobLocation] = useState('');
  const [jobSalary, setJobSalary] = useState('');
  const [jobHousehold, setJobHousehold] = useState('');
  const [jobRequirements, setJobRequirements] = useState('');
  const [jobLiving, setJobLiving] = useState('Live-out');
  const [jobDuties, setJobDuties] = useState<string[]>([]);

  const am = language === 'am';

  const t = {
    welcome: am ? 'ወደ ሰራተኛ እንኳን በደህና መጡ' : 'Welcome to Seratenga',
    intro: am ? 'የቤት ሰራተኞችን ከቀጣሪዎች ጋር እናገናኛለን' : 'Connecting household workers and employers',
    chooseLanguage: am ? 'ቋንቋ ይምረጡ' : 'Choose your language',
    chooseRole: am ? 'እንዴት መጠቀም ይፈልጋሉ?' : 'How will you use Seratenga?',
    worker: am ? 'ሥራ ፈላጊ ነኝ' : "I'm looking for a job",
    employer: am ? 'ሠራተኛ እፈልጋለሁ' : "I'm looking for a worker",
    login: am ? 'ወደ መለያ ይግቡ' : 'Log in',
    signup: am ? 'መለያ ይፍጠሩ' : 'Create account',
    email: 'Email / ኢሜይል',
    password: am ? 'የይለፍ ቃል' : 'Password',
    home: am ? 'መነሻ' : 'Home',
    browseWorkers: am ? 'ሰራተኞችን ይመልከቱ' : 'Browse workers',
    browseJobs: am ? 'ስራዎችን ይመልከቱ' : 'Browse jobs',
    createProfile: am ? 'መገለጫዬን አስተካክል' : 'My worker profile',
    postJob: am ? 'ስራ ለጥፍ' : 'Post a job',
    inbox: am ? 'መልዕክቶች' : 'Messages',
    myProfile: am ? 'የእኔ መገለጫ' : 'My Profile',
    language: am ? 'ቋንቋ ቀይር' : 'Change language',
    logout: am ? 'ውጣ' : 'Log out',
    save: am ? 'አስቀምጥ' : 'Save',
    back: am ? '← ተመለስ' : '← Back',
    search: am ? 'ፈልግ...' : 'Search...',
    noResults: am ? 'ውጤት አልተገኘም' : 'Nothing found yet',
    fullName: am ? 'ሙሉ ስም' : 'Full name',
    phone: am ? 'ስልክ ቁጥር' : 'Phone number',
    location: am ? 'አካባቢ' : 'Location',
    experience: am ? 'የስራ ልምድ' : 'Experience',
    salary: am ? 'ወርሃዊ ደመወዝ (ብር)' : 'Monthly salary (ETB)',
    about: am ? 'ስለ እርስዎ' : 'About you',
    skills: am ? 'የስራ ችሎታዎች' : 'Skills',
    living: am ? 'የመኖሪያ አይነት' : 'Living arrangement',
    liveIn: am ? 'Live-in' : 'Live-in',
    liveOut: am ? 'Live-out' : 'Live-out',
    send: am ? 'ላክ' : 'Send',
    messagePlaceholder: am ? 'መልዕክብ ይጻፉ...' : 'Write a message...',
  };

  const showError = (message: string) => Alert.alert(am ? 'ስህተት' : 'Error', message);

  const loadProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      showError(error.message);
      return null;
    }

    setProfile(data);
    if (data) {
      setRole(data.role);
      setName(data.full_name ?? '');
      setPhone(data.phone ?? '');
      setLocation(data.location ?? '');
      setExperience(data.experience ?? '');
      setSalary(data.expected_salary ?? '');
      setAbout(data.about ?? '');
      setSkills(data.skills ?? []);
      setLiving(data.living_arrangement ?? 'Live-out');
      setLanguages(data.languages ?? 'Amharic');
    }
    return data;
  }, []);

  const enterApp = useCallback(async (currentUser: any) => {
    setUser(currentUser);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', currentUser.id)
      .maybeSingle();

    if (error) {
      showError(error.message);
      return;
    }

    if (!data) {
      showError('Your account profile was not found. Please sign up again or check your Supabase signup trigger.');
      await supabase.auth.signOut();
      setUser(null);
      setPage('welcome');
      return;
    }

    setProfile(data);
    setRole(data.role);
    setName(data.full_name ?? '');
    setPhone(data.phone ?? '');
    setLocation(data.location ?? '');
    setExperience(data.experience ?? '');
    setSalary(data.expected_salary ?? '');
    setAbout(data.about ?? '');
    setSkills(data.skills ?? []);
    setLiving(data.living_arrangement ?? 'Live-out');
    setLanguages(data.languages ?? 'Amharic');
    setPage('home');
  }, []);

  useEffect(() => {
    let alive = true;

    supabase.auth.getSession().then(({ data }) => {
      if (alive && data.session?.user) {
        enterApp(data.session.user);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!alive) return;
        if (event === 'SIGNED_OUT' || !session?.user) {
          setUser(null);
          setProfile(null);
          setPage('welcome');
        }
      }
    );

    return () => {
      alive = false;
      listener.subscription.unsubscribe();
    };
  }, [enterApp]);

  async function submitAuth() {
    if (!email.trim() || password.length < 6) {
      showError('Enter a valid email and a password with at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      if (loginMode) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        if (!data.user) throw new Error('Could not load your account.');

        const { data: p, error: pError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .maybeSingle();

        if (pError) throw pError;
        if (!p) throw new Error('Your profile is missing. Please contact support.');
        if (p.role !== role) {
          await supabase.auth.signOut();
          throw new Error(`This account is registered as ${p.role}. Please choose the matching role.`);
        }
        await enterApp(data.user);
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { role } },
        });
        if (error) throw error;

        if (data.session && data.user) {
          await enterApp(data.user);
        } else {
          Alert.alert(
            am ? 'ኢሜይልዎን ያረጋግጡ' : 'Check your email',
            'Open the confirmation email to activate your account, then return and log in.'
          );
          setLoginMode(true);
        }
      }
    } catch (e: any) {
      showError(e?.message ?? 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  async function saveWorkerProfile() {
    if (!name.trim() || !location.trim() || !salary.trim()) {
      showError('Please enter your name, location, and expected salary.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        role: 'worker',
        full_name: name.trim(),
        phone: phone.trim(),
        location: location.trim(),
        experience: experience.trim(),
        expected_salary: salary.trim(),
        about: about.trim(),
        skills,
        living_arrangement: living,
        languages: languages.trim(),
      });

      if (error) throw error;
      await loadProfile(user.id);
      Alert.alert('Saved', 'Your worker profile has been saved.');
      setPage('home');
    } catch (e: any) {
      showError(e.message ?? 'Could not save profile.');
    } finally {
      setLoading(false);
    }
  }

  async function loadListings() {
    setLoading(true);
    try {
      if (role === 'employer') {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, location, skills, experience, living_arrangement, expected_salary, languages, about')
          .eq('role', 'worker')
          .neq('id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setListings(data ?? []);
      } else {
        const { data, error } = await supabase
          .from('jobs')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setListings(data ?? []);
      }
      setPage('browse');
    } catch (e: any) {
      showError(e.message ?? 'Could not load listings.');
    } finally {
      setLoading(false);
    }
  }

  async function postJob() {
    if (!jobTitle.trim() || !jobLocation.trim() || !jobSalary.trim()) {
      showError('Please enter a job title, location, and salary.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('jobs').insert({
        employer_id: user.id,
        employer_name: profile?.full_name ?? name ?? '',
        title: jobTitle.trim(),
        location: jobLocation.trim(),
        salary: jobSalary.trim(),
        household_size: jobHousehold.trim(),
        duties: jobDuties,
        living_arrangement: jobLiving,
        requirements: jobRequirements.trim(),
      });

      if (error) throw error;
      setJobTitle('');
      setJobLocation('');
      setJobSalary('');
      setJobHousehold('');
      setJobRequirements('');
      setJobDuties([]);
      Alert.alert('Posted', 'Your job listing is now available.');
      setPage('home');
    } catch (e: any) {
      showError(e.message ?? 'Could not post job.');
    } finally {
      setLoading(false);
    }
  }

  async function startConversation(workerId: string) {
    if (!user || workerId === user.id) return;

    setLoading(true);
    try {
      const employerId = role === 'employer' ? user.id : workerId;
      const actualWorkerId = role === 'worker' ? user.id : workerId;

      const { data: existing, error: findError } = await supabase
        .from('conversations')
        .select('*')
        .eq('employer_id', employerId)
        .eq('worker_id', actualWorkerId)
        .maybeSingle();

      if (findError) throw findError;

      let conversation = existing;
      if (!conversation) {
        const { data, error } = await supabase
          .from('conversations')
          .insert({ employer_id: employerId, worker_id: actualWorkerId })
          .select()
          .single();

        if (error) throw error;
        conversation = data;
      }

      setActiveConversation(conversation);
      await loadMessages(conversation.id);
      setPage('chat');
    } catch (e: any) {
      showError(e.message ?? 'Could not open conversation.');
    } finally {
      setLoading(false);
    }
  }

  async function loadMessages(conversationId: string) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      showError(error.message);
      return;
    }
    setMessages(data ?? []);
  }

  async function loadInbox() {
    setLoading(true);
    try {
      const column = role === 'employer' ? 'employer_id' : 'worker_id';
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq(column, user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const rows = await Promise.all(
        (data ?? []).map(async (conversation: any) => {
          const otherId =
            role === 'employer' ? conversation.worker_id : conversation.employer_id;
          const { data: other } = await supabase
            .from('profiles')
            .select('full_name, location')
            .eq('id', otherId)
            .maybeSingle();

          const { data: last } = await supabase
            .from('messages')
            .select('content, created_at')
            .eq('conversation_id', conversation.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          return {
            ...conversation,
            otherName: other?.full_name ?? 'Seratenga user',
            otherLocation: other?.location ?? '',
            lastMessage: last?.content ?? 'Start your conversation',
          };
        })
      );
      setConversations(rows);
      setPage('inbox');
    } catch (e: any) {
      showError(e.message ?? 'Could not load inbox.');
    } finally {
      setLoading(false);
    }
  }

  async function sendMessage() {
    const content = messageText.trim();
    if (!content || !activeConversation) return;

    setMessageText('');
    const { error } = await supabase.from('messages').insert({
      conversation_id: activeConversation.id,
      sender_id: user.id,
      content,
    });

    if (error) {
      setMessageText(content);
      showError(error.message);
      return;
    }
    await loadMessages(activeConversation.id);
  }

  async function logout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      showError(error.message);
      return;
    }
    setUser(null);
    setProfile(null);
    setPage('welcome');
  }

  function toggle(list: string[], setter: (next: string[]) => void, item: string) {
    setter(list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);
  }

  function button(label: string, onPress: () => void, secondary = false) {
    return (
      <TouchableOpacity
        key={label}
        onPress={onPress}
        activeOpacity={0.8}
        style={[styles.button, secondary && styles.secondaryButton]}
      >
        <Text style={[styles.buttonText, secondary && styles.secondaryButtonText]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  }

  function field(
    label: string,
    value: string,
    setter: (value: string) => void,
    placeholder = '',
    multiline = false,
    secure = false,
    keyboardType: 'default' | 'email-address' | 'phone-pad' = 'default'
  ) {
    return (
      <View style={styles.field} key={label}>
        <Text style={styles.label}>{label}</Text>
        <TextInput
          style={[styles.input, multiline && styles.multiline]}
          value={value}
          onChangeText={setter}
          placeholder={placeholder || label}
          placeholderTextColor="#929C93"
          multiline={multiline}
          secureTextEntry={secure}
          keyboardType={keyboardType}
          autoCapitalize={keyboardType === 'email-address' ? 'none' : 'sentences'}
          textAlignVertical={multiline ? 'top' : 'center'}
        />
      </View>
    );
  }

  function choice(label: string, options: string[], selected: string[], setter: (next: string[]) => void) {
    return (
      <View style={styles.field} key={label}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.chips}>
          {options.map((item) => {
            const active = selected.includes(item);
            return (
              <TouchableOpacity
                key={item}
                onPress={() => toggle(selected, setter, item)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {active ? '✓ ' : '+ '}{item}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  }

  function top(title: string) {
    return (
      <View style={styles.topBar}>
        <Text style={styles.logo}>Seratenga</Text>
        <Text style={styles.topTitle}>{title}</Text>
      </View>
    );
  }

  function openProfile() {
    if (role === 'worker') {
      loadProfile(user.id);
    }
    setPage('profile');
  }

  function renderHome() {
    return (
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.greetingCard}>
          <Text style={styles.greeting}>
            {am ? 'ሰላም' : 'Hello'}, {profile?.full_name || email.split('@')[0] || 'there'}!
          </Text>
          <Text style={styles.subtitle}>
            {role === 'worker'
              ? (am ? 'ለሚቀጥለው የስራ እድልዎ ዝግጁ ነዎት?' : 'Ready for your next job opportunity?')
              : (am ? 'ለቤትዎ ተስማሚ ሰራተኛ ያግኙ።' : 'Find the right person to help at home.')}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>{am ? 'ፈጣን አገናኞች' : 'Quick actions'}</Text>
        {role === 'employer' ? (
          <>
            {button('🔎  ' + t.browseWorkers, loadListings)}
            {button('＋  ' + t.postJob, () => setPage('jobForm'), true)}
          </>
        ) : (
          <>
            {button('🔎  ' + t.browseJobs, loadListings)}
            {button('＋  ' + t.createProfile, () => setPage('profile'), true)}
          </>
        )}

        <Text style={styles.sectionTitle}>{am ? 'መለያዎ' : 'Your account'}</Text>
        {button('✉  ' + t.inbox, loadInbox)}
        {button('👤  ' + t.myProfile, openProfile, true)}
        {button('🌐  ' + t.language, () => setPage('welcome'), true)}
        {button('↪  ' + t.logout, logout, true)}
      </ScrollView>
    );
  }

  function renderProfile() {
    return (
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.pageTitle}>{t.myProfile}</Text>
        <Text style={styles.subtitle}>
          {role === 'worker'
            ? 'Your information helps employers understand your experience and skills.'
            : 'Your account information.'}
        </Text>

        {field(t.fullName, name, setName)}
        {field(t.phone, phone, setPhone, '', false, false, 'phone-pad')}

        {role === 'worker' ? (
          <>
            {field(t.location, location, setLocation)}
            {field(t.experience, experience, setExperience, 'e.g. 2 years')}
            {field(t.salary, salary, setSalary, 'e.g. 5000')}
            {choice(t.skills, DUTIES, skills, setSkills)}
            <Text style={styles.label}>{t.living}</Text>
            <View style={styles.chips}>
              {['Live-in', 'Live-out', 'Either'].map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[styles.chip, living === item && styles.chipActive]}
                  onPress={() => setLiving(item)}
                >
                  <Text style={[styles.chipText, living === item && styles.chipTextActive]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {field('Languages spoken', languages, setLanguages)}
            {field(t.about, about, setAbout, 'Tell employers a little about yourself', true)}
            {button(loading ? 'Saving...' : t.save, saveWorkerProfile)}
          </>
        ) : (
          <>
            {field(t.location, location, setLocation)}
            {button(loading ? 'Saving...' : t.save, async () => {
              setLoading(true);
              const { error } = await supabase.from('profiles').update({
                full_name: name.trim(),
                phone: phone.trim(),
                location: location.trim(),
              }).eq('id', user.id);
              setLoading(false);
              if (error) showError(error.message);
              else {
                await loadProfile(user.id);
                Alert.alert('Saved', 'Your account details were updated.');
                setPage('home');
              }
            })}
          </>
        )}
        {button(t.back, () => setPage('home'), true)}
      </ScrollView>
    );
  }

  function renderBrowse() {
    const filtered = listings.filter((item) =>
      JSON.stringify(item).toLowerCase().includes(search.trim().toLowerCase())
    );

    return (
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.pageTitle}>{role === 'employer' ? t.browseWorkers : t.browseJobs}</Text>
        {field(t.search, search, setSearch, 'Search by name, location, or skill')}
        {loading && <ActivityIndicator color={GREEN} size="large" />}

        {!loading && filtered.length === 0 && (
          <Text style={styles.empty}>{t.noResults}</Text>
        )}

        {filtered.map((item) => (
          <View style={styles.listingCard} key={item.id}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(role === 'employer' ? item.full_name : item.title)?.charAt(0)?.toUpperCase() || 'S'}
              </Text>
            </View>
            <View style={styles.listingBody}>
              <Text style={styles.cardTitle}>
                {role === 'employer' ? item.full_name || 'Worker' : item.title}
              </Text>
              <Text style={styles.muted}>📍 {item.location}</Text>
              {role === 'employer' ? (
                <>
                  <Text style={styles.detail}>Skills: {(item.skills ?? []).join(', ') || 'Not added yet'}</Text>
                  <Text style={styles.detail}>Experience: {item.experience || 'Not specified'}</Text>
                  <Text style={styles.detail}>Salary: {item.expected_salary || 'Discuss with worker'}</Text>
                  <Text style={styles.detail}>Living: {item.living_arrangement || 'Not specified'}</Text>
                  <Text style={styles.detail}>Languages: {item.languages || 'Not specified'}</Text>
                  <Text style={styles.detail}>{item.about || ''}</Text>
                  <TouchableOpacity
                    style={styles.smallButton}
                    onPress={() => startConversation(item.id)}
                  >
                    <Text style={styles.smallButtonText}>✉  Send message</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={styles.detail}>Employer: {item.employer_name || 'Household'}</Text>
                  <Text style={styles.detail}>Salary: {item.salary}</Text>
                  <Text style={styles.detail}>Duties: {(item.duties ?? []).join(', ')}</Text>
                  <Text style={styles.detail}>Living: {item.living_arrangement || 'Not specified'}</Text>
                  <Text style={styles.detail}>{item.requirements || ''}</Text>
                  <TouchableOpacity
                    style={styles.smallButton}
                    onPress={() => startConversation(item.employer_id)}
                  >
                    <Text style={styles.smallButtonText}>✉  Contact employer</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        ))}
        {button(t.back, () => { setSearch(''); setPage('home'); }, true)}
      </ScrollView>
    );
  }

  function renderJobForm() {
    return (
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.pageTitle}>{t.postJob}</Text>
        {field('Job title', jobTitle, setJobTitle, 'e.g. Household helper')}
        {field(t.location, jobLocation, setJobLocation)}
        {field(t.salary, jobSalary, setJobSalary, 'e.g. 5000–7000')}
        {field('Household size', jobHousehold, setJobHousehold, 'e.g. 4 people')}
        {choice('Job duties', DUTIES, jobDuties, setJobDuties)}
        <Text style={styles.label}>{t.living}</Text>
        <View style={styles.chips}>
          {['Live-in', 'Live-out', 'Either'].map((item) => (
            <TouchableOpacity
              key={item}
              style={[styles.chip, jobLiving === item && styles.chipActive]}
              onPress={() => setJobLiving(item)}
            >
              <Text style={[styles.chipText, jobLiving === item && styles.chipTextActive]}>
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {field('Additional requirements', jobRequirements, setJobRequirements, 'Anything else the worker should know', true)}
        {button(loading ? 'Posting...' : 'Publish job', postJob)}
        {button(t.back, () => setPage('home'), true)}
      </ScrollView>
    );
  }

  function renderInbox() {
    return (
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.pageTitle}>{t.inbox}</Text>
        {loading && <ActivityIndicator color={GREEN} />}
        {!loading && conversations.length === 0 && (
          <Text style={styles.empty}>No conversations yet. Open a worker or job listing to start a conversation.</Text>
        )}
        {conversations.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.inboxCard}
            onPress={async () => {
              setActiveConversation(item);
              await loadMessages(item.id);
              setPage('chat');
            }}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.otherName?.charAt(0)?.toUpperCase() || 'S'}</Text>
            </View>
            <View style={styles.inboxBody}>
              <Text style={styles.cardTitle}>{item.otherName}</Text>
              <Text style={styles.muted}>{item.otherLocation}</Text>
              <Text style={styles.detail} numberOfLines={1}>{item.lastMessage}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        ))}
        {button(t.back, () => setPage('home'), true)}
      </ScrollView>
    );
  }

  function renderChat() {
    const otherId = role === 'employer'
      ? activeConversation?.worker_id
      : activeConversation?.employer_id;

    const otherName =
      conversations.find((c) => c.id === activeConversation?.id)?.otherName ||
      (role === 'employer' ? 'Worker' : 'Employer');

    return (
      <View style={styles.chatScreen}>
        <View style={styles.chatHeader}>
          <TouchableOpacity onPress={() => setPage('inbox')} style={styles.chatBack}>
            <Text style={styles.chatBackText}>‹</Text>
          </TouchableOpacity>
          <View style={styles.chatAvatar}>
            <Text style={styles.chatAvatarText}>{otherName.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.chatName}>{otherName}</Text>
            <Text style={styles.chatSubtitle}>Seratenga messages</Text>
          </View>
          <TouchableOpacity onPress={() => activeConversation && loadMessages(activeConversation.id)}>
            <Text style={styles.refresh}>↻</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.messageScroll}
          contentContainerStyle={styles.messageContent}
          ref={(ref) => {
            if (ref && messages.length) {
              setTimeout(() => ref.scrollToEnd({ animated: true }), 80);
            }
          }}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.chatDate}>Conversation on Seratenga</Text>
          {messages.length === 0 && (
            <View style={styles.firstMessage}>
              <Text style={styles.firstMessageText}>Say hello to start your conversation.</Text>
            </View>
          )}
          {messages.map((msg) => {
            const mine = msg.sender_id === user.id;
            return (
              <View key={msg.id} style={[styles.messageRow, mine ? styles.myRow : styles.theirRow]}>
                <View style={[styles.bubble, mine ? styles.myBubble : styles.theirBubble]}>
                  <Text style={[styles.messageText, mine && styles.myMessageText]}>{msg.content}</Text>
                  <Text style={[styles.messageTime, mine && styles.myMessageTime]}>
                    {new Date(msg.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
              </View>
            );
          })}
        </ScrollView>

        <View style={styles.composer}>
          <TextInput
            style={styles.messageInput}
            value={messageText}
            onChangeText={setMessageText}
            placeholder={t.messagePlaceholder}
            placeholderTextColor="#8A968D"
            multiline
          />
          <TouchableOpacity
            onPress={sendMessage}
            style={[styles.sendCircle, !messageText.trim() && styles.sendDisabled]}
            disabled={!messageText.trim()}
          >
            <Text style={styles.sendArrow}>➤</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!user || page === 'welcome' || page === 'role' || page === 'auth') {
    return (
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView contentContainerStyle={styles.authContent} keyboardShouldPersistTaps="handled">
            <Text style={styles.logoLarge}>Seratenga</Text>
            {page === 'welcome' && (
              <>
                <Text style={styles.hero}>{t.welcome}</Text>
                <Text style={styles.subtitle}>{t.intro}</Text>
                <Text style={styles.label}>{t.chooseLanguage}</Text>
                {button('English', () => { setLanguage('en'); setPage('role'); })}
                {button('አማርኛ', () => { setLanguage('am'); setPage('role'); }, true)}
              </>
            )}
            {page === 'role' && (
              <>
                <Text style={styles.hero}>{t.chooseRole}</Text>
                <Text style={styles.subtitle}>{t.intro}</Text>
                {button('👩🏽‍🍳  ' + t.worker, () => { setRole('worker'); setLoginMode(false); setPage('auth'); })}
                {button('🏡  ' + t.employer, () => { setRole('employer'); setLoginMode(false); setPage('auth'); }, true)}
                {button(t.back, () => setPage('welcome'), true)}
              </>
            )}
            {page === 'auth' && (
              <>
                <Text style={styles.hero}>{loginMode ? t.login : t.signup}</Text>
                <Text style={styles.subtitle}>
                  {role === 'worker' ? t.worker : t.employer}
                </Text>
                {field(t.email, email, setEmail, 'you@example.com', false, false, 'email-address')}
                {field(t.password, password, setPassword, 'At least 6 characters', false, true)}
                {button(loading ? 'Please wait...' : (loginMode ? t.login : t.signup), submitAuth)}
                <TouchableOpacity onPress={() => setLoginMode(!loginMode)} style={styles.switchLink}>
                  <Text style={styles.switchText}>
                    {loginMode ? 'New here? Create an account' : 'Already have an account? Log in'}
                  </Text>
                </TouchableOpacity>
                {button(t.back, () => setPage('role'), true)}
              </>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {page !== 'chat' && top(
        page === 'home' ? t.home :
        page === 'profile' ? t.myProfile :
        page === 'browse' ? (role === 'employer' ? t.browseWorkers : t.browseJobs) :
        page === 'jobForm' ? t.postJob :
        t.inbox
      )}

      {page === 'home' && renderHome()}
      {page === 'profile' && renderProfile()}
      {page === 'browse' && renderBrowse()}
      {page === 'jobForm' && renderJobForm()}
      {page === 'inbox' && renderInbox()}
      {page === 'chat' && renderChat()}

      {page !== 'chat' && (
        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navItem} onPress={() => setPage('home')}>
            <Text style={styles.navIcon}>⌂</Text>
            <Text style={styles.navLabel}>{t.home}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={loadListings}>
            <Text style={styles.navIcon}>⌕</Text>
            <Text style={styles.navLabel}>{am ? 'Explore' : 'Explore'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={loadInbox}>
            <Text style={styles.navIcon}>✉</Text>
            <Text style={styles.navLabel}>{t.inbox}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={openProfile}>
            <Text style={styles.navIcon}>○</Text>
            <Text style={styles.navLabel}>{t.myProfile}</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: CREAM },
  flex: { flex: 1 },
  authContent: { flexGrow: 1, justifyContent: 'center', padding: 26 },
  content: { padding: 20, paddingBottom: 34 },
  logo: { fontSize: 23, fontWeight: '800', color: GREEN },
  logoLarge: { fontSize: 38, fontWeight: '900', color: GREEN, textAlign: 'center', marginBottom: 26 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: BORDER },
  topTitle: { color: DARK, fontWeight: '700', fontSize: 15, maxWidth: '60%' },
  hero: { fontSize: 27, lineHeight: 35, fontWeight: '800', color: DARK, textAlign: 'center', marginBottom: 12 },
  pageTitle: { fontSize: 26, fontWeight: '800', color: DARK, marginBottom: 8 },
  subtitle: { fontSize: 15, lineHeight: 23, color: MUTED, marginBottom: 24, textAlign: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: DARK, marginTop: 20, marginBottom: 10 },
  greetingCard: { backgroundColor: '#E8F0E8', borderRadius: 20, padding: 22, marginBottom: 10 },
  greeting: { fontSize: 25, fontWeight: '800', color: DARK, marginBottom: 8 },
  button: { backgroundColor: GREEN, paddingVertical: 15, paddingHorizontal: 18, borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginBottom: 11, minHeight: 50 },
  buttonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700', textAlign: 'center' },
  secondaryButton: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: BORDER },
  secondaryButtonText: { color: GREEN },
  field: { marginBottom: 17 },
  label: { color: DARK, fontSize: 14, fontWeight: '700', marginBottom: 8 },
  input: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: BORDER, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, fontSize: 15, color: DARK, minHeight: 48 },
  multiline: { minHeight: 94, textAlignVertical: 'top' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 5, marginBottom: 16 },
  chip: { borderWidth: 1, borderColor: BORDER, borderRadius: 20, paddingVertical: 9, paddingHorizontal: 12, backgroundColor: '#FFFFFF' },
  chipActive: { backgroundColor: '#E0EEE4', borderColor: GREEN },
  chipText: { color: DARK, fontSize: 13 },
  chipTextActive: { color: GREEN, fontWeight: '700' },
  listingCard: { backgroundColor: '#FFFFFF', borderRadius: 17, borderWidth: 1, borderColor: BORDER, padding: 16, marginBottom: 14, flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#E5F0E6', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 18, color: GREEN, fontWeight: '800' },
  listingBody: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '800', color: DARK, marginBottom: 4 },
  muted: { fontSize: 13, color: MUTED, marginBottom: 8 },
  detail: { fontSize: 13, lineHeight: 19, color: '#46564B', marginBottom: 3 },
  smallButton: { backgroundColor: GREEN, borderRadius: 10, alignSelf: 'flex-start', paddingVertical: 10, paddingHorizontal: 14, marginTop: 12 },
  smallButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  empty: { color: MUTED, textAlign: 'center', lineHeight: 22, paddingVertical: 30 },
  inboxCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#FFFFFF', borderRadius: 15, borderWidth: 1, borderColor: BORDER, padding: 14, marginBottom: 10 },
  inboxBody: { flex: 1 },
  chevron: { fontSize: 27, color: MUTED },
  switchLink: { paddingVertical: 15, alignItems: 'center' },
  switchText: { color: GREEN, fontWeight: '700', textAlign: 'center' },
  bottomNav: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: BORDER, backgroundColor: '#FFFFFF', paddingTop: 8, paddingBottom: Platform.OS === 'ios' ? 8 : 5 },
  navItem: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 5 },
  navIcon: { fontSize: 22, color: GREEN, marginBottom: 2 },
  navLabel: { fontSize: 10, fontWeight: '600', color: MUTED },
  chatScreen: { flex: 1, backgroundColor: CREAM },
  chatHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 12, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: BORDER },
  chatBack: { paddingHorizontal: 6, paddingVertical: 2 },
  chatBackText: { fontSize: 34, color: GREEN },
  chatAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E4EFE5', alignItems: 'center', justifyContent: 'center' },
  chatAvatarText: { fontSize: 17, color: GREEN, fontWeight: '800' },
  chatName: { fontSize: 16, color: DARK, fontWeight: '800' },
  chatSubtitle: { fontSize: 12, color: MUTED, marginTop: 2 },
  refresh: { fontSize: 24, color: GREEN, paddingHorizontal: 7 },
  messageScroll: { flex: 1 },
  messageContent: { padding: 15, paddingBottom: 22, flexGrow: 1, justifyContent: 'flex-end' },
  chatDate: { textAlign: 'center', color: MUTED, fontSize: 11, marginVertical: 18 },
  firstMessage: { alignSelf: 'center', backgroundColor: '#E8F0E8', padding: 12, borderRadius: 12, marginBottom: 18 },
  firstMessageText: { color: MUTED, fontSize: 13 },
  messageRow: { width: '100%', marginBottom: 10, flexDirection: 'row' },
  myRow: { justifyContent: 'flex-end' },
  theirRow: { justifyContent: 'flex-start' },
  bubble: { maxWidth: '82%', paddingHorizontal: 13, paddingTop: 10, paddingBottom: 7, borderRadius: 17 },
  myBubble: { backgroundColor: GREEN, borderBottomRightRadius: 5 },
  theirBubble: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: BORDER, borderBottomLeftRadius: 5 },
  messageText: { fontSize: 15, lineHeight: 21, color: DARK },
  myMessageText: { color: '#FFFFFF' },
  messageTime: { fontSize: 10, color: MUTED, textAlign: 'right', marginTop: 5 },
  myMessageTime: { color: '#DCE9DF' },
  composer: { flexDirection: 'row', alignItems: 'flex-end', gap: 9, padding: 11, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: BORDER },
  messageInput: { flex: 1, minHeight: 44, maxHeight: 110, backgroundColor: CREAM, borderWidth: 1, borderColor: BORDER, borderRadius: 22, paddingHorizontal: 16, paddingVertical: 11, fontSize: 15, color: DARK },
  sendCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: GREEN, alignItems: 'center', justifyContent: 'center' },
  sendDisabled: { opacity: 0.45 },
  sendArrow: { fontSize: 19, color: '#FFFFFF' },
});
