import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { User } from 'lucide-react';
import { setStorageItem, getStorageItem } from '../utils/storage';
import { sanitizeInput } from '../utils/validation';

interface UserProfile {
  name: string;
  email: string;
}

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    email: getStorageItem<string>('userEmail', ''),
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const savedProfile = getStorageItem<UserProfile>('userProfile', {
      name: '',
      email: profile.email,
    });
    setProfile(savedProfile);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    const sanitizedName = sanitizeInput(profile.name);
    if (!sanitizedName) {
      setError('Name cannot be empty');
      return;
    }

    setProfile((prev) => ({ ...prev, name: sanitizedName }));
    setStorageItem('userProfile', { ...profile, name: sanitizedName });
    setSuccess(true);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex">
      <Navbar />
      <main className="flex-1 md:ml-64 p-6 md:pt-6 pt-20">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 flex items-center">
            <div className="bg-gray-200 rounded-full p-4 mr-6">
              <User className="w-12 h-12 text-gray-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {profile.name || 'Welcome!'}
              </h1>
              <p className="text-gray-600 mt-1">{profile.email}</p>
            </div>
          </div>

          <div className="bg-white shadow-sm rounded-lg">
            <div className="p-6 sm:p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Profile Settings
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label 
                      htmlFor="name" 
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={profile.name}
                      onChange={(e) =>
                        setProfile((prev) => ({ ...prev, name: e.target.value }))
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-md 
                        shadow-sm focus:ring-2 focus:ring-[#4299E1] focus:border-transparent
                        transition duration-200"
                      placeholder="Enter your name"
                    />
                  </div>

                  <div>
                    <label 
                      htmlFor="email" 
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={profile.email}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-md 
                        bg-gray-50 text-gray-500 cursor-not-allowed"
                    />
                  </div>
                </div>

                {error && (
                  <div className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-md">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="text-sm text-green-600 bg-green-50 px-4 py-3 rounded-md">
                    Profile updated successfully!
                  </div>
                )}

                <div className="flex items-center justify-end pt-4">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#4299E1] text-white rounded-md 
                      hover:bg-[#2B6CB0] focus:outline-none focus:ring-2 
                      focus:ring-offset-2 focus:ring-[#4299E1] transition duration-200
                      flex items-center space-x-2 shadow-sm"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;