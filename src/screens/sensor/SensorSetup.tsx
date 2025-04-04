import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { colors } from '../../constants/colors';
import { theme } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';
import { registerSensorDevice } from '../../services/sensor';

type SensorSetupScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

function SensorSetup() {
  const navigation = useNavigation<SensorSetupScreenNavigationProp>();
  const { user } = useAuth();
  const [deviceName, setDeviceName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

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
      await registerSensorDevice(user.id, deviceName);
      Alert.alert(
        'Success',
        'Device registered successfully',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Main', { screen: 'Sensor' }),
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
          onPress: () => navigation.navigate('Main', { screen: 'Sensor' })
        }
      ]
    );
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Step 1: Prepare Your Device</Text>
            <Text style={styles.stepDescription}>
              Make sure your Lullaby sensor is charged and ready to be paired.
              Press the power button on the device to turn it on.
            </Text>
            <View style={styles.imageContainer}>
              {/* Placeholder for device image */}
              <View style={styles.imagePlaceholder}>
                <Text style={styles.imagePlaceholderText}>Device Image</Text>
              </View>
            </View>
          </View>
        );
      case 2:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Step 2: Connect Your Device</Text>
            <Text style={styles.stepDescription}>
              Press and hold the pairing button on your device until the LED light starts blinking.
              This indicates that the device is in pairing mode.
            </Text>
            <View style={styles.imageContainer}>
              {/* Placeholder for connection image */}
              <View style={styles.imagePlaceholder}>
                <Text style={styles.imagePlaceholderText}>Connection Image</Text>
              </View>
            </View>
          </View>
        );
      case 3:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Step 3: Name Your Device</Text>
            <Text style={styles.stepDescription}>
              Give your device a name to easily identify it in the app.
            </Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Device Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter device name"
                value={deviceName}
                onChangeText={setDeviceName}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
});

export default SensorSetup; 