import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Card from '@/components/common/Card';
import toast from 'react-hot-toast';

export default function Settings() {
  const { user } = useAuth();
  
  // Security Settings
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Notification Settings
  const [earningsNotifications, setEarningsNotifications] = useState(true);
  const [withdrawalNotifications, setWithdrawalNotifications] = useState(true);
  const [newsNotifications, setNewsNotifications] = useState(false);
  const [levelRewardNotifications, setLevelRewardNotifications] = useState(true);
  const [adNotifications, setAdNotifications] = useState(true);
  const [marketingNotifications, setMarketingNotifications] = useState(false);

  // App Settings
  const [language, setLanguage] = useState('en');
  const [darkMode, setDarkMode] = useState(false);
  const [autoPlayVideos, setAutoPlayVideos] = useState(true);

  const handlePasswordChange = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill all password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    toast.success('Password changed successfully');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleSaveSettings = () => {
    toast.success('Settings saved successfully');
  };

  const ToggleSwitch = ({ enabled, onChange }: { enabled: boolean; onChange: (value: boolean) => void }) => (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        enabled ? 'bg-blue-600' : 'bg-gray-300'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-foreground mb-6">Settings</h1>

      {/* Security Settings */}
      <Card className="mb-6 p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">🛡️</span>
          <h2 className="text-xl font-semibold">Security Settings</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-border">
            <div className="flex-1">
              <div className="font-medium">Two-Factor Authentication</div>
              <div className="text-sm text-muted-foreground">
                Add an extra layer of security to your account
              </div>
            </div>
            <ToggleSwitch enabled={twoFactorEnabled} onChange={setTwoFactorEnabled} />
          </div>

          <div className="flex items-center justify-between py-3 border-b border-border">
            <div className="flex-1">
              <div className="font-medium">Biometric Authentication</div>
              <div className="text-sm text-muted-foreground">
                Use fingerprint or face ID to unlock the app
              </div>
            </div>
            <ToggleSwitch enabled={biometricEnabled} onChange={setBiometricEnabled} />
          </div>
        </div>
      </Card>

      {/* Password Management */}
      <Card className="mb-6 p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">🔑</span>
          <h2 className="text-xl font-semibold">Password Management</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
            />
          </div>

          <button
            onClick={handlePasswordChange}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors"
          >
            Change Password
          </button>
        </div>
      </Card>

      {/* Notification Settings */}
      <Card className="mb-6 p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">🔔</span>
          <h2 className="text-xl font-semibold">Notification Settings</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-border">
            <div className="flex-1">
              <div className="font-medium">Daily Earnings</div>
              <div className="text-sm text-muted-foreground">
                Get notified when daily earnings are credited
              </div>
            </div>
            <ToggleSwitch enabled={earningsNotifications} onChange={setEarningsNotifications} />
          </div>

          <div className="flex items-center justify-between py-3 border-b border-border">
            <div className="flex-1">
              <div className="font-medium">Level Rewards</div>
              <div className="text-sm text-muted-foreground">
                Notifications for level progression and rewards
              </div>
            </div>
            <ToggleSwitch enabled={levelRewardNotifications} onChange={setLevelRewardNotifications} />
          </div>

          <div className="flex items-center justify-between py-3 border-b border-border">
            <div className="flex-1">
              <div className="font-medium">Withdrawal Updates</div>
              <div className="text-sm text-muted-foreground">
                Status updates for withdrawal requests
              </div>
            </div>
            <ToggleSwitch enabled={withdrawalNotifications} onChange={setWithdrawalNotifications} />
          </div>

          <div className="flex items-center justify-between py-3 border-b border-border">
            <div className="flex-1">
              <div className="font-medium">New Ads Available</div>
              <div className="text-sm text-muted-foreground">
                Notify when new ad videos are ready
              </div>
            </div>
            <ToggleSwitch enabled={adNotifications} onChange={setAdNotifications} />
          </div>

          <div className="flex items-center justify-between py-3 border-b border-border">
            <div className="flex-1">
              <div className="font-medium">News Updates</div>
              <div className="text-sm text-muted-foreground">
                Breaking news and daily updates
              </div>
            </div>
            <ToggleSwitch enabled={newsNotifications} onChange={setNewsNotifications} />
          </div>

          <div className="flex items-center justify-between py-3 border-b border-border">
            <div className="flex-1">
              <div className="font-medium">Promotional Offers</div>
              <div className="text-sm text-muted-foreground">
                Updates about special offers and promotions
              </div>
            </div>
            <ToggleSwitch enabled={marketingNotifications} onChange={setMarketingNotifications} />
          </div>
        </div>
      </Card>

      {/* App Settings */}
      <Card className="mb-6 p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">⚙️</span>
          <h2 className="text-xl font-semibold">App Settings</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
            >
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
            </select>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-border">
            <div className="flex-1">
              <div className="font-medium">Dark Mode</div>
              <div className="text-sm text-muted-foreground">
                Use dark theme for the app
              </div>
            </div>
            <ToggleSwitch enabled={darkMode} onChange={setDarkMode} />
          </div>

          <div className="flex items-center justify-between py-3 border-b border-border">
            <div className="flex-1">
              <div className="font-medium">Auto-play Videos</div>
              <div className="text-sm text-muted-foreground">
                Automatically play videos when scrolling
              </div>
            </div>
            <ToggleSwitch enabled={autoPlayVideos} onChange={setAutoPlayVideos} />
          </div>
        </div>
      </Card>

      {/* Support Section */}
      <Card className="mb-6 p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">💬</span>
          <h2 className="text-xl font-semibold">Support & Help</h2>
        </div>

        <div className="space-y-3">
          <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-muted transition-colors flex items-center justify-between">
            <div>
              <div className="font-medium">Help Center</div>
              <div className="text-sm text-muted-foreground">Browse FAQs and guides</div>
            </div>
            <span>→</span>
          </button>

          <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-muted transition-colors flex items-center justify-between">
            <div>
              <div className="font-medium">Contact Support</div>
              <div className="text-sm text-muted-foreground">Get help from our team</div>
            </div>
            <span>→</span>
          </button>

          <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-muted transition-colors flex items-center justify-between">
            <div>
              <div className="font-medium">Terms & Conditions</div>
              <div className="text-sm text-muted-foreground">Read our terms of service</div>
            </div>
            <span>→</span>
          </button>

          <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-muted transition-colors flex items-center justify-between">
            <div>
              <div className="font-medium">Privacy Policy</div>
              <div className="text-sm text-muted-foreground">Learn how we protect your data</div>
            </div>
            <span>→</span>
          </button>
        </div>
      </Card>

      {/* Account Information */}
      <Card className="mb-6 p-6 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">ℹ️</span>
          <h2 className="text-xl font-semibold">Account Information</h2>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between py-2">
            <span className="text-muted-foreground">User ID:</span>
            <span className="font-medium">{user?.id}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-muted-foreground">Email:</span>
            <span className="font-medium">{user?.email}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-muted-foreground">Username:</span>
            <span className="font-medium">{user?.username}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-muted-foreground">App Version:</span>
            <span className="font-medium">1.0.0</span>
          </div>
        </div>
      </Card>

      {/* Save Button */}
      <button
        onClick={handleSaveSettings}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-lg font-semibold text-lg transition-all"
      >
        Save All Settings
      </button>
    </div>
  );
}
