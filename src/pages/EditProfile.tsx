import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import toast from 'react-hot-toast';

export default function EditProfile() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    document.title = 'Edit Profile - WeNews';
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
    }
  }, [user]);

  const getUserInitials = () => {
    if (!firstName && !lastName) return 'U';
    return ((firstName[0] || '') + (lastName[0] || '')).toUpperCase();
  };

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    
    try {
      const updateData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      };

      await updateUser(updateData);
      navigate('/profile');
    } catch (error) {
      toast.error('An error occurred while updating profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/profile')}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-3xl font-bold text-foreground">Edit Profile</h1>
      </div>

      {/* Profile Picture Section */}
      <Card className="mb-6 p-6">
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold mb-4">
            {getUserInitials()}
          </div>
          <button
            onClick={() => toast('Photo upload coming soon!', { icon: 'ℹ️' })}
            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            Change Photo
          </button>
        </div>
      </Card>

      {/* Basic Information */}
      <Card className="mb-6 p-6">
        <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
        
        <div className="space-y-4">
          {/* First Name */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Enter your first name"
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Enter your last name"
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
            />
          </div>

          {/* Email (Read-only) */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Email
            </label>
            <div className="w-full px-4 py-2 border border-border rounded-lg bg-muted text-muted-foreground">
              {user?.email}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
          </div>

          {/* Username (Read-only) */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Username
            </label>
            <div className="w-full px-4 py-2 border border-border rounded-lg bg-muted text-muted-foreground">
              {user?.username}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Username cannot be changed</p>
          </div>
        </div>
      </Card>

      {/* Account Info */}
      <Card className="mb-6 p-6">
        <h2 className="text-xl font-semibold mb-4">Account Information</h2>
        
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">User ID</span>
            <span className="font-medium">{user?.id}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">Member Since</span>
            <span className="font-medium">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-muted-foreground">Account Status</span>
            <span className="font-medium text-green-600">Active</span>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button
          variant="outline"
          onClick={() => navigate('/profile')}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={isLoading}
          className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Saving...</span>
            </div>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>
    </div>
  );
}
