import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Switch,
  Linking,
  TextInput,
  Modal,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { colors } from '../../constants/colors';
import { theme } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';
import { auth } from '../../services/firebase';
import Header from '../../components/Header';
import { getUserDevices, updateDevicePhoneNumber, updateDeviceId } from '../../services/sensor';
import { Ionicons } from '@expo/vector-icons';
import { SensorDevice } from '../../types';
import { PrivacyPolicy, TermsOfService } from './PolicyTexts';
import firebase from 'firebase/app';
import 'firebase/auth';

type ProfileScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

function ProfileScreen() {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  
  // Device state
  const [deviceId, setDeviceId] = useState<string>('');
  const [newDeviceId, setNewDeviceId] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [isUpdatingPhoneNumber, setIsUpdatingPhoneNumber] = useState(false);
  const [isUpdatingDeviceId, setIsUpdatingDeviceId] = useState(false);
  const [userDevices, setUserDevices] = useState<SensorDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<SensorDevice | null>(null);
  const [isLoadingDevices, setIsLoadingDevices] = useState(true);

  // Modal state
  const [policyModalVisible, setPolicyModalVisible] = useState(false);
  const [termsModalVisible, setTermsModalVisible] = useState(false);

  // Delete account state
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // Load user devices
  useEffect(() => {
    async function fetchUserDevices() {
      if (!user) return;
      
      setIsLoadingDevices(true);
      try {
        // Get user's devices from Firebase
        const devices = await getUserDevices(user.id);
        setUserDevices(devices);
        
        // Set the first device as selected if available
        if (devices.length > 0) {
          setSelectedDevice(devices[0]);
          setDeviceId(devices[0].id); // This is the document name
          setNewDeviceId(devices[0].id); // Initialize new device ID with current value
          setPhoneNumber(devices[0].phoneNumber || '');
        }
      } catch (error) {
        console.error('Error fetching user devices:', error);
        Alert.alert('Error', 'Failed to load device information');
      } finally {
        setIsLoadingDevices(false);
      }
    }
    
    fetchUserDevices();
  }, [user]);

  // Update device ID in Firebase
  const handleUpdateDeviceId = async () => {
    if (!user || !deviceId || !newDeviceId) return;
    
    // Don't proceed if the IDs are the same
    if (deviceId === newDeviceId) {
      Alert.alert('No Change', 'The Device ID remains the same.');
      return;
    }
    
    // Confirm before updating
    Alert.alert(
      'Update Device ID',
      `Are you sure you want to change the Device ID from ${deviceId} to ${newDeviceId}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Update',
          onPress: async () => {
            setIsUpdatingDeviceId(true);
            try {
              await updateDeviceId(user.id, deviceId, newDeviceId);
              
              // Update the local state
              setDeviceId(newDeviceId);
              
              // Update the selected device and devices list
              if (selectedDevice) {
                const updatedDevice = { ...selectedDevice, id: newDeviceId };
                setSelectedDevice(updatedDevice);
                
                const updatedDevices = userDevices.map(device => 
                  device.id === deviceId ? updatedDevice : device
                );
                setUserDevices(updatedDevices);
              }
              
              Alert.alert('Success', 'Device ID updated successfully');
            } catch (error) {
              console.error('Error updating device ID:', error);
              Alert.alert('Error', 'Failed to update Device ID. Please try again.');
            } finally {
              setIsUpdatingDeviceId(false);
            }
          },
        },
      ]
    );
  };

  // Update phone number in Firebase
  const handleUpdatePhoneNumber = async () => {
    if (!user || !deviceId) return;
    
    setIsUpdatingPhoneNumber(true);
    try {
      await updateDevicePhoneNumber(user.id, deviceId, phoneNumber);
      Alert.alert('Success', 'Phone number updated successfully');
      
      // Update the local device information
      if (selectedDevice) {
        const updatedDevice = { ...selectedDevice, phoneNumber };
        setSelectedDevice(updatedDevice);
        
        // Update the device in the userDevices array
        const updatedDevices = userDevices.map(device => 
          device.id === deviceId ? { ...device, phoneNumber } : device
        );
        setUserDevices(updatedDevices);
      }
    } catch (error) {
      console.error('Error updating phone number:', error);
      Alert.alert('Error', 'Failed to update phone number. Please try again.');
    } finally {
      setIsUpdatingPhoneNumber(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => {
            setIsLoading(true);
            console.log('Sign out confirmed in Profile screen');
            
            // First navigate to the Auth screen
            console.log('Attempting to navigate to Auth screen');
            try {
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: 'Auth' }]
                })
              );
              
              console.log('Navigation completed, now signing out');
              
              // Then sign out after navigation (with slight delay)
              setTimeout(() => {
                auth.signOut()
                  .then(() => {
                    console.log('Firebase sign out successful');
                  })
                  .catch(error => {
                    console.error('Firebase sign out error:', error);
                  })
                  .finally(() => {
                    setIsLoading(false);
                  });
              }, 500);
            } catch (e) {
              console.error('Navigation or signout error:', e);
              setIsLoading(false);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to permanently delete your account? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsDeletingAccount(true);
            
            try {
              // Get the current user
              const currentUser = auth.currentUser;
              
              if (!currentUser) {
                throw new Error('No user is currently signed in');
              }
              
              // Delete the user account
              await currentUser.delete();
              
              console.log('User account deleted successfully');
              
              // Navigate to Auth screen
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: 'Auth' }]
                })
              );
            } catch (error: any) {
              console.error('Error deleting account:', error);
              
              // Handle reauthentication errors
              if (error.code === 'auth/requires-recent-login') {
                Alert.alert(
                  'Authentication Required', 
                  'Please sign out and sign in again before deleting your account.',
                  [{ text: 'OK' }]
                );
              } else {
                Alert.alert('Error', 'Failed to delete account. Please try again.');
              }
            } finally {
              setIsDeletingAccount(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" />
      <Header />
      
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
              </Text>
            </View>
          </View>
          <Text style={styles.userName}>{user?.displayName || 'User'}</Text>
          <Text style={styles.userEmail}>{user?.email || ''}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Device Information</Text>
          
          {isLoadingDevices ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.loadingText}>Loading device information...</Text>
            </View>
          ) : userDevices.length === 0 ? (
            <Text style={styles.noDeviceText}>No devices registered</Text>
          ) : (
            <>
              {/* Device ID Field (Now editable) */}
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Device ID</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    value={newDeviceId}
                    onChangeText={setNewDeviceId}
                    placeholder="Enter device ID"
                    placeholderTextColor={colors.gray[400]}
                  />
                  <TouchableOpacity 
                    style={styles.confirmButton}
                    onPress={handleUpdateDeviceId}
                    disabled={isUpdatingDeviceId}
                  >
                    {isUpdatingDeviceId ? (
                      <ActivityIndicator size="small" color={colors.white} />
                    ) : (
                      <Ionicons name="checkmark" size={18} color={colors.white} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
              
              {/* Phone Number Field */}
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Device Phone Number</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    placeholder="Enter phone number"
                    placeholderTextColor={colors.gray[400]}
                    keyboardType="phone-pad"
                  />
                  <TouchableOpacity 
                    style={styles.confirmButton}
                    onPress={handleUpdatePhoneNumber}
                    disabled={isUpdatingPhoneNumber}
                  >
                    {isUpdatingPhoneNumber ? (
                      <ActivityIndicator size="small" color={colors.white} />
                    ) : (
                      <Ionicons name="checkmark" size={18} color={colors.white} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => setPolicyModalVisible(true)}
          >
            <Text style={styles.menuItemText}>Privacy Policy</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => setTermsModalVisible(true)}
          >
            <Text style={styles.menuItemText}>Terms of Service</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => Linking.openURL('mailto:stav@lullabyai.net')}
          >
            <Text style={styles.menuItemText}>Help & Support</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.menuItem, styles.menuItemDisabled]}
            disabled={true}
          >
            <Text style={[styles.menuItemText, styles.disabledText]}>Account Settings</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.menuItem, styles.menuItemDisabled]}
            disabled={true}
          >
            <Text style={[styles.menuItemText, styles.disabledText]}>Notification Preferences</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.deleteAccountButton}
          onPress={handleDeleteAccount}
          disabled={isDeletingAccount || isLoading}
        >
          {isDeletingAccount ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.deleteAccountButtonText}>Delete Account</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.signOutButton}
          onPress={handleSignOut}
          disabled={isLoading || isDeletingAccount}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.signOutButtonText}>Sign Out</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.versionText}>Version 1.0.0</Text>
      </ScrollView>

      {/* Privacy Policy Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={policyModalVisible}
        onRequestClose={() => setPolicyModalVisible(false)}
        onShow={() => StatusBar.setBarStyle('light-content')}
        onDismiss={() => StatusBar.setBarStyle('dark-content')}
      >
        <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Privacy Policy</Text>
              <TouchableOpacity 
                onPress={() => setPolicyModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={colors.white} />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <PrivacyPolicy />
            </View>
          </View>
        </View>
      </Modal>

      {/* Terms of Service Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={termsModalVisible}
        onRequestClose={() => setTermsModalVisible(false)}
        onShow={() => StatusBar.setBarStyle('light-content')}
        onDismiss={() => StatusBar.setBarStyle('dark-content')}
      >
        <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Terms of Service</Text>
              <TouchableOpacity 
                onPress={() => setTermsModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={colors.white} />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <TermsOfService />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // New styles
  loadingContainer: {
    alignItems: 'center',
    padding: theme.spacing.m,
  },
  loadingText: {
    marginTop: theme.spacing.s,
    color: colors.gray[600],
    fontSize: theme.typography.fontSize.s,
  },
  noDeviceText: {
    textAlign: 'center',
    padding: theme.spacing.m,
    color: colors.gray[600],
    fontSize: theme.typography.fontSize.m,
  },
  readOnlyInput: {
    backgroundColor: colors.gray[200],
    color: colors.gray[700],
  },
  // Existing and updated styles
  fieldContainer: {
    marginBottom: theme.spacing.m,
  },
  fieldLabel: {
    fontSize: theme.typography.fontSize.s,
    color: colors.gray[600],
    marginBottom: theme.spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 46,
    backgroundColor: colors.gray[100],
    borderRadius: theme.borderRadius.s,
    paddingHorizontal: theme.spacing.m,
    color: colors.text,
    fontSize: theme.typography.fontSize.m,
    marginRight: theme.spacing.xs,
  },
  confirmButton: {
    width: 40,
    height: 40,
    backgroundColor: colors.primary,
    borderRadius: theme.borderRadius.s,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: theme.spacing.l,
    paddingTop: theme.padding.header,
    backgroundColor: colors.primary,
  },
  title: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: 'bold',
    color: colors.white,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: theme.spacing.l,
    paddingBottom: 0,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  avatarContainer: {
    marginBottom: theme.spacing.m,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.white,
  },
  userName: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: theme.spacing.xs,
  },
  userEmail: {
    fontSize: theme.typography.fontSize.m,
    color: colors.gray[600],
  },
  section: {
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.l,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.m,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: theme.spacing.m,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  settingLabel: {
    fontSize: theme.typography.fontSize.m,
    color: colors.text,
  },
  menuItem: {
    paddingVertical: theme.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  menuItemText: {
    fontSize: theme.typography.fontSize.m,
    color: colors.text,
  },
  menuItemDisabled: {
    opacity: 0.6,
  },
  disabledText: {
    color: colors.gray[400],
  },
  deleteAccountButton: {
    backgroundColor: colors.error,
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.m,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.m,
  },
  deleteAccountButtonText: {
    color: colors.white,
    fontSize: theme.typography.fontSize.m,
    fontWeight: '600',
  },
  signOutButton: {
    backgroundColor: colors.primary,
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.m,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.l,
  },
  signOutButtonText: {
    color: colors.white,
    fontSize: theme.typography.fontSize.m,
    fontWeight: '600',
  },
  versionText: {
    textAlign: 'center',
    fontSize: theme.typography.fontSize.xs,
    color: colors.gray[500],
    marginBottom: theme.spacing.l,
  },
  // Updated modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: theme.spacing.s,
  },
  modalContent: {
    width: '95%',
    height: '90%',
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.m,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
    backgroundColor: colors.primary,
  },
  modalTitle: {
    fontSize: theme.typography.fontSize.l,
    fontWeight: 'bold',
    color: colors.white,
  },
  closeButton: {
    padding: theme.spacing.xs,
  },
  modalBody: {
    flex: 1,
  },
  modalText: {
    fontSize: theme.typography.fontSize.m,
    lineHeight: 24,
    color: colors.text,
    paddingVertical: theme.spacing.m,
  },
});

export default ProfileScreen; 