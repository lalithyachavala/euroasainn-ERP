import React from 'react';
import { ComingSoonPage } from '../ComingSoon/ComingSoonPage';
import { MdVerified } from 'react-icons/md';

export function CompliancePage() {
  return (
    <ComingSoonPage
      title="Compliance & Certification"
      description="Manage regulatory compliance, certifications, and ensure your operations meet industry standards."
      icon={MdVerified}
    />
  );
}

