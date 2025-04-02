import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { signIn } from '../../services/auth';
import { colors } from '../../constants/colors';
import { theme } from '../../constants/theme';
import { auth } from '../../services/firebase';
import { checkSubscriptionStatus } from '../../services/subscription';

type LoginScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

function LoginScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Add logging for component mounting
  useEffect(() => {
    console.log('LoginScreen mounted');
    
    // Check if user is already logged in
    const currentUser = auth.currentUser;
    console.log('Current user on mount:', currentUser?.email);
    
    // Set up an auth state listener for testing purposes
    const unsubscribe = auth.onAuthStateChanged((user) => {
      console.log('Auth state changed in LoginScreen:', user?.email);
      if (user) {
        console.log('User is signed in with ID:', user.uid);
        checkAuthAndSubscription(user.uid);
      }
    });
    
    return () => {
      console.log('LoginScreen unmounting');
      unsubscribe();
    };
  }, []);
  
  // Helper function to check auth and subscription status
  const checkAuthAndSubscription = async (userId: string) => {
    console.log('Checking subscription status for user:', userId);
    try {
      const hasSubscription = await checkSubscriptionStatus(userId);
      console.log('Subscription status:', hasSubscription);
      
      // Log navigation state
      const navState = navigation.getState();
      console.log('Current navigation state:', JSON.stringify(navState, null, 2));
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const handleLogin = async () => {
    console.log('Login button pressed with email:', email);
    
    if (!email || !password) {
      console.log('Email or password is empty');
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Attempting to sign in...');
      const user = await signIn(email, password);
      console.log('Sign in successful for user:', user.email);
      console.log('User ID:', user.uid);
      console.log('Display Name:', user.displayName);
      
      // Navigation will be handled by the auth state change in the root navigator
      console.log('Waiting for auth state listener to handle navigation...');
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Login Failed', 'Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollView}>
          <View style={styles.header}>
            <Text style={styles.title}>Lullaby</Text>
            <Text style={styles.subtitle}>Sign in to your account</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity 
              style={styles.forgotPassword}
              onPress={() => navigation.navigate('ForgotPassword')}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.buttonText}>Sign In</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.signUpText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
    padding: theme.spacing.l,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: theme.typography.fontSize.xxxl,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.m,
    color: colors.text,
  },
  form: {
    marginBottom: theme.spacing.xl,
  },
  inputContainer: {
    marginBottom: theme.spacing.m,
  },
  label: {
    fontSize: theme.typography.fontSize.s,
    fontWeight: '500',
    color: colors.text,
    marginBottom: theme.spacing.xs,
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.m,
    fontSize: theme.typography.fontSize.m,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: theme.spacing.l,
  },
  forgotPasswordText: {
    color: colors.primary,
    fontSize: theme.typography.fontSize.s,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.m,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: colors.white,
    fontSize: theme.typography.fontSize.m,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: colors.text,
    fontSize: theme.typography.fontSize.s,
  },
  signUpText: {
    color: colors.primary,
    fontSize: theme.typography.fontSize.s,
    fontWeight: '600',
  },
});

export default LoginScreen; 