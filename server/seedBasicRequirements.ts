
import { db } from './db';
import { complianceRequirements, frameworks } from '@shared/schema';
import { eq } from 'drizzle-orm';

export async function seedBasicRequirements() {
  console.log('🌱 Seeding basic compliance requirements...');
  
  try {
    // Get existing frameworks
    const existingFrameworks = await db.select().from(frameworks);
    
    // Basic requirements for each framework
    const basicRequirements = [
      // SOC 2 requirements
      {
        frameworkId: 'soc2',
        requirementId: 'CC6.1',
        title: 'Logical Access Controls',
        description: 'The entity implements logical access security software, infrastructure, and architectures over protected information assets to protect them from security events.',
        category: 'access_control',
        priority: 'high',
        evidenceTypes: ['access_control_policy', 'user_access_review', 'authentication_logs']
      },
      {
        frameworkId: 'soc2', 
        requirementId: 'CC6.2',
        title: 'Multi-Factor Authentication',
        description: 'Prior to issuing system credentials and granting system access, the entity registers and authorizes new internal and external users whose access is administered by the entity.',
        category: 'access_control',
        priority: 'high',
        evidenceTypes: ['mfa_policy', 'user_registration_process', 'access_provisioning']
      },
      // ISO 27001 requirements
      {
        frameworkId: 'iso27001',
        requirementId: 'A.9.2.1',
        title: 'User Registration and De-registration',
        description: 'A formal user registration and de-registration process shall be implemented to enable assignment of access rights.',
        category: 'access_control', 
        priority: 'high',
        evidenceTypes: ['user_lifecycle_policy', 'access_request_forms', 'deprovisioning_logs']
      },
      {
        frameworkId: 'iso27001',
        requirementId: 'A.12.6.1', 
        title: 'Management of Technical Vulnerabilities',
        description: 'Information about technical vulnerabilities of information systems being used shall be obtained in a timely fashion.',
        category: 'vulnerability_management',
        priority: 'medium',
        evidenceTypes: ['vulnerability_scan_reports', 'patch_management_policy', 'remediation_tracking']
      },
      // HIPAA requirements
      {
        frameworkId: 'hipaa',
        requirementId: '164.312(a)(1)',
        title: 'Access Control (Administrative Safeguards)',
        description: 'Implement technical policies and procedures for electronic information systems that maintain electronic protected health information.',
        category: 'access_control',
        priority: 'critical',
        evidenceTypes: ['hipaa_access_policy', 'ephi_access_controls', 'user_access_logs']
      },
      {
        frameworkId: 'hipaa',
        requirementId: '164.312(e)(1)',
        title: 'Transmission Security',
        description: 'Implement technical security measures to guard against unauthorized access to electronic protected health information.',
        category: 'data_protection',
        priority: 'high',
        evidenceTypes: ['encryption_policy', 'transmission_logs', 'network_security_controls']
      }
    ];

    // Insert requirements
    let insertedCount = 0;
    for (const req of basicRequirements) {
      // Check if framework exists
      const framework = existingFrameworks.find(f => f.id === req.frameworkId || f.name === req.frameworkId);
      if (!framework) {
        console.log(`Framework ${req.frameworkId} not found, skipping requirement ${req.requirementId}`);
        continue;
      }

      // Check if requirement already exists
      const existing = await db.select().from(complianceRequirements)
        .where(eq(complianceRequirements.requirementId, req.requirementId))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(complianceRequirements).values({
          ...req,
          frameworkId: framework.id // Use the actual framework ID
        });
        insertedCount++;
      }
    }

    console.log(`✅ Seeded ${insertedCount} basic compliance requirements`);
  } catch (error) {
    console.error('❌ Error seeding basic requirements:', error);
  }
}
