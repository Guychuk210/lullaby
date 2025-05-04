import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  TextInput,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../constants/colors';
import { theme } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';
import Header from '../../components/Header';
import { signOut } from '../../services/auth';

function SettingsScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [name, setName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = () => {
    // In a real app, you would update the user's profile here
    Alert.alert('Success', 'Profile updated successfully');
    setIsEditing(false);
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      // Sign out - the auth state change will be detected by useAuth
      // and the RootNavigator will automatically navigate to the Auth screen
      await signOut();
      console.log('Sign out successful');
    } catch (error) {
      console.error('Sign out error:', error);
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Header />
      
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Name</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
              />
            ) : (
              <Text style={styles.value}>{name || 'Not set'}</Text>
            )}
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Email</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            ) : (
              <Text style={styles.value}>{email || 'Not set'}</Text>
            )}
          </View>

          {isEditing ? (
            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setIsEditing(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={handleSave}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => setIsEditing(true)}
            >
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
          
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>Change Password</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem} disabled={true}>
            <Text style={[styles.menuItemText, styles.disabledText]}>Two-Factor Authentication</Text>
          </TouchableOpacity>
        </View>


        {/* Sign Out Button Section */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.signOutButton}
            onPress={handleSignOut}
            disabled={isLoading}
          >
            <Text style={styles.signOutButtonText}>
              {isLoading ? 'Signing Out...' : 'Sign Out'}
            </Text>
          </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.l,
    paddingTop: 50,
    backgroundColor: colors.primary,
  },
  backButton: {
    padding: theme.spacing.xs,
  },
  backButtonText: {
    color: colors.white,
    fontSize: theme.typography.fontSize.m,
  },
  title: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: 'bold',
    color: colors.white,
  },
  placeholder: {
    width: 50, // To balance the back button
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: theme.spacing.l,
    paddingBottom: 0,
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
  formGroup: {
    marginBottom: theme.spacing.m,
  },
  label: {
    fontSize: theme.typography.fontSize.s,
    fontWeight: '500',
    color: colors.text,
    marginBottom: theme.spacing.xs,
  },
  value: {
    fontSize: theme.typography.fontSize.m,
    color: colors.text,
    paddingVertical: theme.spacing.s,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.m,
    fontSize: theme.typography.fontSize.m,
    color: colors.text,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.m,
  },
  cancelButton: {
    backgroundColor: colors.gray[200],
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.m,
    flex: 1,
    marginRight: theme.spacing.s,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: colors.text,
    fontSize: theme.typography.fontSize.m,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.m,
    flex: 1,
    marginLeft: theme.spacing.s,
    alignItems: 'center',
  },
  saveButtonText: {
    color: colors.white,
    fontSize: theme.typography.fontSize.m,
    fontWeight: '600',
  },
  editButton: {
    backgroundColor: colors.primary,
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.m,
    alignItems: 'center',
    marginTop: theme.spacing.m,
  },
  editButtonText: {
    color: colors.white,
    fontSize: theme.typography.fontSize.m,
    fontWeight: '600',
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
  disabledText: {
    color: colors.gray[200],
  },
  // Sign Out Button Styles
  signOutButton: {
    backgroundColor: colors.error,
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.m,
    alignItems: 'center',
  },
  signOutButtonText: {
    color: colors.white,
    fontSize: theme.typography.fontSize.m,
    fontWeight: '600',
  },
});

export default SettingsScreen; 