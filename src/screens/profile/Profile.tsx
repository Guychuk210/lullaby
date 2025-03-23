import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Switch
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { colors } from '../../constants/colors';
import { theme } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';
import { signOut } from '../../services/auth';
import Header from '../../components/Header';

type ProfileScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

function ProfileScreen() {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  const handleSignOut = async () => {
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
          onPress: async () => {
            setIsLoading(true);
            try {
              await signOut();
              // Navigation will be handled by the auth state change
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out. Please try again.');
              console.error('Sign out error:', error);
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
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
          <Text style={styles.sectionTitle}>Settings</Text>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Notifications</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: colors.gray[300], true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Dark Mode</Text>
            <Switch
              value={darkModeEnabled}
              onValueChange={setDarkModeEnabled}
              trackColor={{ false: colors.gray[300], true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('Settings')}
          >
            <Text style={styles.menuItemText}>Account Settings</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Text style={styles.menuItemText}>Notification Preferences</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>Privacy Policy</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>Terms of Service</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>Help & Support</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.signOutButton}
          onPress={handleSignOut}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.signOutButtonText}>Sign Out</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.versionText}>Version 1.0.0</Text>
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
  signOutButton: {
    backgroundColor: colors.error,
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
});

export default ProfileScreen; 