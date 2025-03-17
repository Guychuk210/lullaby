import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Switch,
  TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../constants/colors';
import { theme } from '../../constants/theme';

function NotificationsScreen() {
  const navigation = useNavigation();
  const [notificationSettings, setNotificationSettings] = useState({
    wetAlerts: true,
    batteryLow: true,
    disconnection: true,
    dailySummary: false,
    weeklySummary: true,
    appUpdates: false,
  });

  const toggleSetting = (setting: keyof typeof notificationSettings) => {
    setNotificationSettings({
      ...notificationSettings,
      [setting]: !notificationSettings[setting],
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Alerts</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Wet Alerts</Text>
              <Text style={styles.settingDescription}>
                Get notified when the sensor detects wetness
              </Text>
            </View>
            <Switch
              value={notificationSettings.wetAlerts}
              onValueChange={() => toggleSetting('wetAlerts')}
              trackColor={{ false: colors.gray[300], true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Low Battery</Text>
              <Text style={styles.settingDescription}>
                Get notified when the sensor battery is low
              </Text>
            </View>
            <Switch
              value={notificationSettings.batteryLow}
              onValueChange={() => toggleSetting('batteryLow')}
              trackColor={{ false: colors.gray[300], true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Disconnection</Text>
              <Text style={styles.settingDescription}>
                Get notified when the sensor disconnects
              </Text>
            </View>
            <Switch
              value={notificationSettings.disconnection}
              onValueChange={() => toggleSetting('disconnection')}
              trackColor={{ false: colors.gray[300], true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summaries</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Daily Summary</Text>
              <Text style={styles.settingDescription}>
                Receive a daily summary of sensor activity
              </Text>
            </View>
            <Switch
              value={notificationSettings.dailySummary}
              onValueChange={() => toggleSetting('dailySummary')}
              trackColor={{ false: colors.gray[300], true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Weekly Summary</Text>
              <Text style={styles.settingDescription}>
                Receive a weekly summary of sensor activity
              </Text>
            </View>
            <Switch
              value={notificationSettings.weeklySummary}
              onValueChange={() => toggleSetting('weeklySummary')}
              trackColor={{ false: colors.gray[300], true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Other</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>App Updates</Text>
              <Text style={styles.settingDescription}>
                Get notified about app updates and new features
              </Text>
            </View>
            <Switch
              value={notificationSettings.appUpdates}
              onValueChange={() => toggleSetting('appUpdates')}
              trackColor={{ false: colors.gray[300], true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
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
    paddingVertical: theme.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  settingInfo: {
    flex: 1,
    marginRight: theme.spacing.m,
  },
  settingLabel: {
    fontSize: theme.typography.fontSize.m,
    fontWeight: '500',
    color: colors.text,
    marginBottom: theme.spacing.xs,
  },
  settingDescription: {
    fontSize: theme.typography.fontSize.s,
    color: colors.gray[600],
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.m,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.m,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: theme.typography.fontSize.m,
    fontWeight: '600',
  },
});

export default NotificationsScreen; 