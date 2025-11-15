/**
 * SMS Templates Page
 * Configure SMS notifications
 */

import { useState } from 'react';
import { useToast } from '../../components/shared/Toast';

export function SMSTemplatesPage() {
  const { showToast } = useToast();
  const [verificationSMS, setVerificationSMS] = useState('Your verification code is {code}');
  const [alertSMS, setAlertSMS] = useState('Important alert: {message}');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // TODO: Implement API call to save SMS templates
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      showToast('SMS templates saved successfully', 'success');
    } catch (error) {
      showToast('Failed to save SMS templates', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* SMS Templates Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-1">SMS Templates</h2>
          <p className="text-sm text-gray-600">Configure SMS notifications</p>
        </div>

        <div className="space-y-6">
          {/* Verification SMS */}
          <div>
            <label htmlFor="verificationSMS" className="block text-sm font-semibold text-gray-900 mb-2">
              Verification SMS
            </label>
            <textarea
              id="verificationSMS"
              value={verificationSMS}
              onChange={(e) => setVerificationSMS(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 bg-white resize-y"
              placeholder="Your verification code is {code}"
            />
            <p className="mt-2 text-xs text-gray-500">
              Use <code className="px-1.5 py-0.5 bg-gray-100 rounded">{'{code}'}</code> to insert the verification code
            </p>
          </div>

          {/* Alert SMS */}
          <div>
            <label htmlFor="alertSMS" className="block text-sm font-semibold text-gray-900 mb-2">
              Alert SMS
            </label>
            <textarea
              id="alertSMS"
              value={alertSMS}
              onChange={(e) => setAlertSMS(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 bg-white resize-y"
              placeholder="Important alert: {message}"
            />
            <p className="mt-2 text-xs text-gray-500">
              Use <code className="px-1.5 py-0.5 bg-gray-100 rounded">{'{message}'}</code> to insert the alert message
            </p>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2.5 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : 'Save SMS Templates'}
          </button>
        </div>
      </div>
    </div>
  );
}

