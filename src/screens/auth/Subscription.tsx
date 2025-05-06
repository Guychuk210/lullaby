import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { colors } from '../../constants/colors';
import { theme } from '../../constants/theme';
import { updateSubscriptionStatus, checkSubscriptionStatus } from '../../services/subscription';
import { auth } from '../../services/firebase';
import { CommonActions } from '@react-navigation/native';

type SubscriptionScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Subscription'>;

function SubscriptionScreen() {
  const navigation = useNavigation<SubscriptionScreenNavigationProp>();
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvc, setCvc] = useState('');
  const [nameOnCard, setNameOnCard] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const navigateToHome = () => {
    // Navigate to Main stack which contains Home screen
    console.log('Navigating to Main after subscription');
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      })
    );
  };

  const handleSubscribe = async () => {
    if (!cardNumber || !expiryDate || !cvc || !nameOnCard) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Basic card validation
    if (cardNumber.replace(/\s/g, '').length < 16) {
      Alert.alert('Error', 'Please enter a valid card number');
      return;
    }

    if (!expiryDate.includes('/') || expiryDate.length !== 5) {
      Alert.alert('Error', 'Please enter a valid expiry date (MM/YY)');
      return;
    }

    if (cvc.length < 3) {
      Alert.alert('Error', 'Please enter a valid CVC');
      return;
    }

    setIsLoading(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('No user found');
      }

      // Update subscription status in Firestore
      await updateSubscriptionStatus(currentUser.uid);
      
      // Show success message and navigate to main app
      Alert.alert(
        'Success',
        'Subscription activated successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigateToHome()
          }
        ]
      );
    } catch (error) {
      console.error('Subscription error:', error);
      Alert.alert('Error', 'Failed to activate subscription. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle credit card number formatting
  const formatCardNumber = (text: string) => {
    // Remove all non-numeric characters
    const cleaned = text.replace(/[^0-9]/g, '');
    // Add space after every 4 digits
    const formatted = cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
    // Limit to 19 characters (16 digits + 3 spaces)
    return formatted.slice(0, 19);
  };

  // Handle expiry date formatting (MM/YY)
  const formatExpiryDate = (text: string) => {
    // Remove all non-numeric characters
    const cleaned = text.replace(/[^0-9]/g, '');
    
    if (cleaned.length > 0) {
      // Format as MM/YY
      if (cleaned.length <= 2) {
        return cleaned;
      } else {
        return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
      }
    }
    return '';
  };

  if (isInitialLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Checking subscription status...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView 
            contentContainerStyle={styles.scrollView}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.header}>
              
              <Text style={styles.title}>Numah.AI</Text>
              <Text style={styles.subtitle}>Complete Your Registration</Text>
            </View>

        <View style={styles.subscriptionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Subscription Details</Text>
            <Text style={styles.price}>$20/mo</Text>
          </View>
          <View style={styles.planDetails}>
            <View>
              <Text style={styles.planName}>Premium Subscription</Text>
              <Text style={styles.planDescription}>
                Full access to all Numah.AI features and services
              </Text>
            </View>
          </View>
        </View>

            <View style={styles.paymentSection}>
              <Text style={styles.sectionTitle}>Payment Information</Text>
              
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Card Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChangeText={(text) => setCardNumber(formatCardNumber(text))}
                  keyboardType="numeric"
                  maxLength={19}
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.inputContainer, styles.halfWidth]}>
                  <Text style={styles.label}>Expiry Date</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="MM/YY"
                    value={expiryDate}
                    onChangeText={(text) => setExpiryDate(formatExpiryDate(text))}
                    maxLength={5}
                    keyboardType="numeric"
                  />
                </View>

                <View style={[styles.inputContainer, styles.halfWidth]}>
                  <Text style={styles.label}>CVC</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="123"
                    value={cvc}
                    onChangeText={setCvc}
                    keyboardType="numeric"
                    maxLength={3}
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Name on Card</Text>
                <TextInput
                  style={styles.input}
                  placeholder="John Doe"
                  value={nameOnCard}
                  onChangeText={setNameOnCard}
                />
              </View>

              <TouchableOpacity
                style={styles.subscribeButton}
                onPress={handleSubscribe}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={styles.buttonText}>
                    Subscribe & Continue ($20/month)
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.skipButton}
                onPress={() => {
                  Alert.alert(
                    'Skip Subscription',
                    'You can subscribe later, but some features will be limited.',
                    [
                      {
                        text: 'Continue with Free Version',
                        onPress: () => navigateToHome()
                      },
                      {
                        text: 'Cancel',
                        style: 'cancel'
                      }
                    ]
                  );
                }}
              >
                <Text style={styles.skipButtonText}>Skip for now</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.m,
    fontSize: theme.typography.fontSize.m,
    color: colors.text,
  },
  scrollView: {
    flexGrow: 1,
    padding: theme.spacing.l,
    paddingBottom: theme.spacing.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    marginTop: theme.spacing.xl,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: theme.spacing.m,
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
  subscriptionCard: {
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.l,
    padding: theme.spacing.l,
    marginBottom: theme.spacing.l,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.m,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.l,
    fontWeight: '600',
    color: colors.text,
  },
  planDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  planInfo: {
    flex: 1,
    marginRight: theme.spacing.m,
  },
  planName: {
    fontSize: theme.typography.fontSize.m,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: theme.spacing.xs,
  },
  planDescription: {
    fontSize: theme.typography.fontSize.s,
    color: colors.text,
  },
  price: {
    fontSize: theme.typography.fontSize.l,
    fontWeight: 'bold',
    color: colors.primary,
    flexShrink: 0,
  },
  paymentSection: {
    marginTop: theme.spacing.l,
  },
  inputContainer: {
    marginBottom: theme.spacing.m,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
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
  subscribeButton: {
    backgroundColor: colors.primary,
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.m,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.l,
  },
  buttonText: {
    color: colors.white,
    fontSize: theme.typography.fontSize.m,
    fontWeight: '600',
  },
  skipButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.m,
    padding: theme.spacing.m,
  },
  skipButtonText: {
    color: colors.gray[600],
    fontSize: theme.typography.fontSize.m,
  },
  backButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.m,
    padding: theme.spacing.m,
  },
  backButtonText: {
    color: colors.gray[600],
    fontSize: theme.typography.fontSize.m,
  },
});

export default SubscriptionScreen; 