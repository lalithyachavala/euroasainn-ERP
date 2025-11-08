/**
 * Email Templates Page
 * Customize automated emails
 */

import { useState } from 'react';
import { useToast } from '../../components/shared/Toast';

export function EmailTemplatesPage() {
  const { showToast } = useToast();
  const [welcomeEmail, setWelcomeEmail] = useState('Welcome to {platform_name}...');
  const [invoiceEmail, setInvoiceEmail] = useState('Your invoice for {month}...');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // TODO: Implement API call to save email templates
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      showToast('Email templates saved successfully', 'success');
    } catch (error) {
      showToast('Failed to save email templates', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Email Templates Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Email Templates</h2>
          <p className="text-sm text-gray-600">Customize automated emails</p>
        </div>

        <div className="space-y-6">
          {/* Welcome Email Template */}
          <div>
            <label htmlFor="welcomeEmail" className="block text-sm font-semibold text-gray-900 mb-2">
              Welcome Email Template
            </label>
            <textarea
              id="welcomeEmail"
              value={welcomeEmail}
              onChange={(e) => setWelcomeEmail(e.target.value)}
              rows={8}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 bg-white resize-y"
              placeholder="Welcome to {platform_name}..."
            />
            <p className="mt-2 text-xs text-gray-500">
              Use <code className="px-1.5 py-0.5 bg-gray-100 rounded">{'{platform_name}'}</code> to insert the platform name
            </p>
          </div>

          {/* Invoice Email Template */}
          <div>
            <label htmlFor="invoiceEmail" className="block text-sm font-semibold text-gray-900 mb-2">
              Invoice Email Template
            </label>
            <textarea
              id="invoiceEmail"
              value={invoiceEmail}
              onChange={(e) => setInvoiceEmail(e.target.value)}
              rows={8}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 bg-white resize-y"
              placeholder="Your invoice for {month}..."
            />
            <p className="mt-2 text-xs text-gray-500">
              Use <code className="px-1.5 py-0.5 bg-gray-100 rounded">{'{month}'}</code> to insert the month
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
            {isSaving ? 'Saving...' : 'Save Templates'}
          </button>
        </div>
      </div>
    </div>
  );
}

