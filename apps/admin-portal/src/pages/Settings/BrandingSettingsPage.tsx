/**
 * Branding Settings Page
 * Customize platform appearance
 */

import { useState } from 'react';
import { useToast } from '../../components/shared/Toast';

export function BrandingSettingsPage() {
  const { showToast } = useToast();
  const [platformName, setPlatformName] = useState('Enterprise ERP');
  const [logoUrl, setLogoUrl] = useState('https://example.com/logo.png');
  const [primaryColor, setPrimaryColor] = useState('#5C6268');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // TODO: Implement API call to save branding settings
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      showToast('Branding settings saved successfully', 'success');
    } catch (error) {
      showToast('Failed to save branding settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Branding Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Branding</h2>
          <p className="text-sm text-gray-600">Customize your platform appearance</p>
        </div>

        <div className="space-y-6">
          {/* Platform Name */}
          <div>
            <label htmlFor="platformName" className="block text-sm font-semibold text-gray-900 mb-2">
              Platform Name
            </label>
            <input
              type="text"
              id="platformName"
              value={platformName}
              onChange={(e) => setPlatformName(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 bg-white"
              placeholder="Enter platform name"
            />
          </div>

          {/* Logo URL */}
          <div>
            <label htmlFor="logoUrl" className="block text-sm font-semibold text-gray-900 mb-2">
              Logo URL
            </label>
            <input
              type="url"
              id="logoUrl"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 bg-white"
              placeholder="https://example.com/logo.png"
            />
          </div>

          {/* Primary Color */}
          <div>
            <label htmlFor="primaryColor" className="block text-sm font-semibold text-gray-900 mb-2">
              Primary Color
            </label>
            <div className="flex items-center gap-4">
              <input
                type="color"
                id="primaryColor"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-16 h-12 border border-gray-300 rounded-lg cursor-pointer"
              />
              <input
                type="text"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 bg-white font-mono"
                placeholder="#5C6268"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2.5 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : 'Save Branding'}
          </button>
        </div>
      </div>
    </div>
  );
}

