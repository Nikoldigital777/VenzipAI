
import { db } from './db';
import { policyTemplates, frameworks } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { ISO27001_INFORMATION_SECURITY_POLICY, HIPAA_PRIVACY_POLICY } from './templates/policyTemplates';

export async function seedPolicyTemplates() {
  console.log('🌱 Seeding policy templates...');

  try {
    // Check if templates already exist
    const existingTemplates = await db.select().from(policyTemplates);
    if (existingTemplates.length > 0) {
      console.log('📄 Policy templates already seeded, skipping...');
      return;
    }

    // Get frameworks - try both id and name fields for compatibility
    const existingFrameworks = await db.select().from(frameworks);
    const iso27001 = existingFrameworks.find(f => f.name === 'iso27001' || f.id === 'iso27001');
    const hipaa = existingFrameworks.find(f => f.name === 'hipaa' || f.id === 'hipaa');

    const templates = [];

    // ISO 27001 templates
    if (iso27001) {
      templates.push({
        frameworkId: iso27001.id,
        templateName: 'Information Security Policy',
        templateType: 'policy',
        category: 'governance',
        title: 'Information Security Policy',
        description: 'Comprehensive information security policy addressing ISO 27001 requirements',
        templateContent: ISO27001_INFORMATION_SECURITY_POLICY,
        requirementIds: ['A.5.1.1', 'A.5.1.2', 'A.6.1.1'],
        priority: 'high',
        version: '1.0'
      });
    }

    // HIPAA templates
    if (hipaa) {
      templates.push({
        frameworkId: hipaa.id,
        templateName: 'HIPAA Privacy Policy',
        templateType: 'policy',
        category: 'privacy',
        title: 'HIPAA Privacy Policy',
        description: 'Comprehensive privacy policy addressing HIPAA Privacy Rule requirements',
        templateContent: HIPAA_PRIVACY_POLICY,
        requirementIds: ['164.530', '164.520', '164.524'],
        priority: 'high',
        version: '1.0'
      });
    }

    if (templates.length > 0) {
      await db.insert(policyTemplates).values(templates);
      console.log(`✅ Added ${templates.length} policy templates`);
    }

  } catch (error) {
    console.error('❌ Error seeding policy templates:', error);
  }
}
