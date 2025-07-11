import React, { useState } from 'react';
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
  Alert,
  Modal,
  Pressable
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { registerUser } from '../../services/auth';
import { colors } from '../../constants/colors';
import { theme } from '../../constants/theme';
import PhoneInput from 'react-native-phone-number-input';
import Checkbox from 'expo-checkbox';
import { PrivacyPolicy, TermsOfService } from '../profile/PolicyTexts';

// Navigation type for auth stack screens
type RegisterScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

function RegisterScreen() {
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [formattedPhoneNumber, setFormattedPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // New states for checkbox and modals
  const [policyAccepted, setPolicyAccepted] = useState(false);
  const [privacyModalVisible, setPrivacyModalVisible] = useState(false);
  const [termsModalVisible, setTermsModalVisible] = useState(false);
  const phoneInput = React.useRef<PhoneInput>(null);

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!policyAccepted) {
      Alert.alert('Error', 'Please accept the Terms of Use and Privacy Policy');
      return;
    }

    // Validate phone number
    // const checkValid = phoneInput.current?.isValidNumber(phoneNumber);
    // if (!checkValid) {
    //   Alert.alert('Error', 'Please enter a valid phone number');
    //   return;
    // }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setIsLoading(true);
    console.log('Starting registration process...');
    try {
      // Register user with Firebase - this will automatically sign them in
      // Navigation will be handled automatically by the RootNavigator when auth state changes
      console.log('Calling registerUser function...');
      const userData = await registerUser(email, password, name, formattedPhoneNumber);
      console.log('Registration successful, user data:', userData);
      console.log('User should now be authenticated and navigation should occur automatically');
      
      // Remove explicit navigation - let auth state listener handle it automatically
      // The user is now signed in and the RootNavigator will detect this change
      
    } catch (error) {
      // Extract the specific error message from the error object
      const errorMessage = error instanceof Error ? error.message : 'Could not create account. Please try again.';
      console.error('Registration failed:', error);
      Alert.alert('Registration Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to render the Privacy Policy modal
  const renderPrivacyPolicyModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={privacyModalVisible}
      onRequestClose={() => setPrivacyModalVisible(false)}
    >
      <View style={styles.modalBackdrop}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Privacy Policy</Text>
            <View style={styles.modalScrollView}>
              <PrivacyPolicy />
            </View>
            <TouchableOpacity 
              style={styles.modalButton} 
              onPress={() => setPrivacyModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // Function to render the Terms of Use modal
  const renderTermsOfUseModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={termsModalVisible}
      onRequestClose={() => setTermsModalVisible(false)}
    >
      <View style={styles.modalBackdrop}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Terms of Use</Text>
            <View style={styles.modalScrollView}>
              <TermsOfService />
            </View>
            <TouchableOpacity 
              style={styles.modalButton} 
              onPress={() => setTermsModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      {renderPrivacyPolicyModal()}
      {renderTermsOfUseModal()}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollView}>
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Sign up to get started</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your name"
                value={name}
                onChangeText={setName}
              />
            </View>

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

            {/* <View style={styles.inputContainer}>
              <Text style={styles.label}>Phone Number</Text>
              <PhoneInput
                ref={phoneInput}
                defaultValue={phoneNumber}
                defaultCode="US"
                layout="first"
                onChangeText={(text) => {
                  setPhoneNumber(text);
                }}
                onChangeFormattedText={(text) => {
                  setFormattedPhoneNumber(text);
                }}
                withDarkTheme={false}
                withShadow={false}
                autoFocus={false}
                containerStyle={styles.phoneInputContainer}
                textContainerStyle={styles.phoneTextContainer}
              />
            </View> */}

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Create a password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirm Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            </View>

            {/* Policy Agreement Checkbox */}
            <View style={styles.checkboxContainer}>
              <Checkbox
                style={styles.checkbox}
                value={policyAccepted}
                onValueChange={setPolicyAccepted}
                color={policyAccepted ? colors.primary : undefined}
              />
              <View style={styles.checkboxTextContainer}>
                <Text style={styles.checkboxText}>
                  I've read and accepted the {' '}
                </Text>
                <TouchableOpacity onPress={() => setTermsModalVisible(true)}>
                  <Text style={styles.linkText}>Terms of Use</Text>
                </TouchableOpacity>
                <Text style={styles.checkboxText}> and </Text>
                <TouchableOpacity onPress={() => setPrivacyModalVisible(true)}>
                  <Text style={styles.linkText}>Privacy Policy</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.button,
                (!policyAccepted || isLoading) && styles.buttonDisabled
              ]}
              onPress={handleRegister}
              disabled={isLoading || !policyAccepted}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={[
                  styles.buttonText,
                  (!policyAccepted || isLoading) && styles.buttonTextDisabled
                ]}>
                  Sign Up
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.signInText}>Sign In</Text>
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
    color: colors.text,
  },
  phoneInputContainer: {
    width: '100%',
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: theme.borderRadius.m,
    backgroundColor: colors.white,
  },
  phoneTextContainer: {
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.m,
    paddingVertical: theme.spacing.s,
  },
  // Checkbox styles
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.m,
    marginTop: theme.spacing.s,
  },
  checkbox: {
    margin: 5,
    marginTop: 2,
  },
  checkboxTextContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginLeft: theme.spacing.xs,
  },
  checkboxText: {
    fontSize: theme.typography.fontSize.s,
    color: colors.text,
  },
  linkText: {
    fontSize: theme.typography.fontSize.s,
    color: colors.primary,
    fontWeight: '600',
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.m,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.m,
  },
  buttonDisabled: {
    backgroundColor: colors.gray[300],
    opacity: 0.7,
  },
  buttonText: {
    color: colors.white,
    fontSize: theme.typography.fontSize.m,
    fontWeight: '600',
  },
  buttonTextDisabled: {
    color: colors.gray[500],
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
  signInText: {
    color: colors.primary,
    fontSize: theme.typography.fontSize.s,
    fontWeight: '600',
  },
  // Updated modal styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '95%',
    height: '90%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.m,
    paddingHorizontal: theme.spacing.m,
    paddingTop: theme.spacing.l,
    paddingBottom: theme.spacing.m,
    width: '100%',
    height: '100%',
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    // Shadow for Android
    elevation: 5,
    flexDirection: 'column',
  },
  modalTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: theme.spacing.m,
    textAlign: 'center',
  },
  modalScrollView: {
    flex: 1,
    marginBottom: theme.spacing.m,
  },
  modalButton: {
    backgroundColor: colors.primary,
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.m,
    alignItems: 'center',
    marginTop: theme.spacing.s,
  },
  modalButtonText: {
    color: colors.white,
    fontSize: theme.typography.fontSize.m,
    fontWeight: '600',
  },
});

export default RegisterScreen; 