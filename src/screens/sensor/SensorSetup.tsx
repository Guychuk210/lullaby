import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Clipboard,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { colors } from '../../constants/colors';
import { theme } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';
import { registerSensorDevice } from '../../services/sensor';
import { Ionicons } from '@expo/vector-icons';

type SensorSetupScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

function SensorSetup() {
  const navigation = useNavigation<SensorSetupScreenNavigationProp>();
  const { user } = useAuth();
  const [deviceName, setDeviceName] = useState('');
  const [deviceId, setDeviceId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 2;

  const handleRegisterDevice = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to register a device');
      return;
    }

    if (!deviceName.trim()) {
      Alert.alert('Error', 'Please enter a device name');
      return;
    }

    setIsLoading(true);
    try {
      await registerSensorDevice(user.id, deviceName, deviceId, phoneNumber);
      Alert.alert(
        'Success',
        'Device registered successfully',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Main', { screen: 'Home' }),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to register device. Please try again.');
      console.error('Device registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExit = () => {
    Alert.alert(
      'Exit Setup',
      'Are you sure you want to exit the sensor setup process? Your progress will not be saved.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Exit', 
          style: 'destructive',
          onPress: () => navigation.navigate('Main', { screen: 'Home' })
        }
      ]
    );
  };

  const handleCopyDeviceId = () => {
    const defaultDeviceId = 'EC:A3:45:0B:65:F4';
    Clipboard.setString(defaultDeviceId);
    setDeviceId(defaultDeviceId);
    Alert.alert('Copied', 'Device ID copied to clipboard');
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Step 1: Connect Your Device</Text>
            <Text style={styles.stepDescription}>
              Follow these steps to connect your device to your home network:
            </Text>
            <View style={styles.instructionsList}>
              <Text style={styles.instructionItem}>1. Turn on the sensor</Text>
              <Text style={styles.instructionItem}>2. Turn off cellular data on this phone</Text>
              <Text style={styles.instructionItem}>3. Look for the sensor's WiFi in your settings and connect to it</Text>
              <Text style={styles.instructionItem}>4. Go to this address: 192.168.4.1</Text>
              <Text style={styles.instructionItem}>5. Choose the home WiFi and type in the password to connect the sensor to your home network</Text>
            </View>
          </View>
        );
      case 2:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Step 2: Name Your Device</Text>
            <Text style={styles.stepDescription}>
              Give your device a name to easily identify it in the app.
            </Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Device Name</Text>
              <TextInput
                style={styles.input}
                placeholder="i.e. Johnny's device"
                value={deviceName}
                onChangeText={setDeviceName}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Device ID</Text>
              <View style={styles.inputWithIcon}>
                <TextInput
                  style={styles.inputWithIconField}
                  placeholder="i.e. EC:A3:45:0B:65:F4"
                  value={deviceId}
                  onChangeText={setDeviceId}
                />
                <TouchableOpacity 
                  style={styles.copyButton}
                  onPress={handleCopyDeviceId}
                >
                  <Ionicons name="copy-outline" size={22} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Phone Number to Contact</Text>
              <TextInput
                style={styles.input}
                placeholder="+972 501234567"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
              />
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView 
          style={styles.keyboardAvoidingContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 1 : 1}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Set Up Sensor</Text>
            <TouchableOpacity
              style={styles.exitButton}
              onPress={handleExit}
            >
              <Text style={styles.exitButtonText}>Exit</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
            <View style={styles.progressContainer}>
              {Array.from({ length: totalSteps }).map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.progressStep,
                    index + 1 <= currentStep ? styles.progressStepActive : {},
                  ]}
                />
              ))}
            </View>

            {renderStep()}

            <View style={styles.buttonContainer}>
              {currentStep > 1 && (
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => setCurrentStep(currentStep - 1)}
                >
                  <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>
              )}

              {currentStep < totalSteps ? (
                <TouchableOpacity
                  style={styles.nextButton}
                  onPress={() => setCurrentStep(currentStep + 1)}
                >
                  <Text style={styles.nextButtonText}>Next</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.finishButton}
                  onPress={handleRegisterDevice}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color={colors.white} />
                  ) : (
                    <Text style={styles.finishButtonText}>Finish Setup</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardAvoidingContainer: {
    flex: 1,
  },
  header: {
    padding: theme.spacing.l,
    paddingTop: 50,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: 'bold',
    color: colors.white,
  },
  exitButton: {
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.xs,
  },
  exitButtonText: {
    color: colors.white,
    fontSize: theme.typography.fontSize.m,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: theme.spacing.l,
    flexGrow: 1,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: theme.spacing.xl,
  },
  progressStep: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.gray[300],
    marginHorizontal: theme.spacing.xs,
  },
  progressStepActive: {
    backgroundColor: colors.primary,
  },
  stepContainer: {
    flex: 1,
    marginBottom: theme.spacing.xl,
  },
  stepTitle: {
    fontSize: theme.typography.fontSize.l,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: theme.spacing.m,
  },
  stepDescription: {
    fontSize: theme.typography.fontSize.m,
    color: colors.text,
    marginBottom: theme.spacing.l,
    lineHeight: theme.typography.lineHeight.m,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.l,
  },
  imagePlaceholder: {
    width: 200,
    height: 200,
    backgroundColor: colors.gray[200],
    borderRadius: theme.borderRadius.m,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    color: colors.gray[500],
    fontSize: theme.typography.fontSize.m,
  },
  inputContainer: {
    marginBottom: theme.spacing.l,
  },
  inputLabel: {
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
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputWithIconField: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.m,
    fontSize: theme.typography.fontSize.m,
    flex: 1,
  },
  copyButton: {
    padding: theme.spacing.m,
    marginLeft: theme.spacing.xs,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 'auto',
  },
  backButton: {
    backgroundColor: colors.gray[200],
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.m,
    flex: 1,
    marginRight: theme.spacing.s,
    alignItems: 'center',
  },
  backButtonText: {
    color: colors.text,
    fontSize: theme.typography.fontSize.m,
    fontWeight: '600',
  },
  nextButton: {
    backgroundColor: colors.primary,
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.m,
    flex: 1,
    marginLeft: theme.spacing.s,
    alignItems: 'center',
  },
  nextButtonText: {
    color: colors.white,
    fontSize: theme.typography.fontSize.m,
    fontWeight: '600',
  },
  finishButton: {
    backgroundColor: colors.primary,
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.m,
    flex: 1,
    marginLeft: theme.spacing.s,
    alignItems: 'center',
  },
  finishButtonText: {
    color: colors.white,
    fontSize: theme.typography.fontSize.m,
    fontWeight: '600',
  },
  instructionsList: {
    marginBottom: theme.spacing.l,
  },
  instructionItem: {
    fontSize: theme.typography.fontSize.m,
    color: colors.text,
    marginBottom: theme.spacing.m,
    lineHeight: theme.typography.lineHeight.m,
  },
});

export default SensorSetup; 