import { db } from "./db";
import { frameworks, complianceRequirements } from "@shared/schema";

interface Framework {
  id: string;
  name: string;
  displayName: string;
  description: string;
  complexity: string;
  estimatedTimeMonths: number;
  totalControls: number;
  icon: string;
  color: string;
}

const frameworksData: Framework[] = [
  {
    id: 'soc2',
    name: 'soc2',
    displayName: 'SOC 2',
    description: 'System and Organization Controls for service organizations, focusing on security, availability, processing integrity, confidentiality, and privacy.',
    complexity: 'medium',
    estimatedTimeMonths: 6,
    totalControls: 64,
    icon: '🛡️',
    color: '#4ECDC4'
  },
  {
    id: 'iso27001',
    name: 'iso27001',
    displayName: 'ISO 27001',
    description: 'International standard for information security management systems (ISMS), providing a systematic approach to managing sensitive information.',
    complexity: 'high',
    estimatedTimeMonths: 12,
    totalControls: 114,
    icon: '📜',
    color: '#44D9E8'
  },
  {
    id: 'hipaa',
    name: 'hipaa',
    displayName: 'HIPAA',
    description: 'Health Insurance Portability and Accountability Act, ensuring the protection of sensitive patient health information.',
    complexity: 'medium',
    estimatedTimeMonths: 4,
    totalControls: 18,
    icon: '🏥',
    color: '#52E5A3'
  },
  {
    id: 'scf',
    name: 'scf',
    displayName: 'SCF (Secure Controls Framework)',
    description: 'Comprehensive cybersecurity control framework covering multiple domains of security controls.',
    complexity: 'high',
    estimatedTimeMonths: 10,
    totalControls: 200,
    icon: '🔐',
    color: '#FF8C42'
  }
];

// Sample compliance requirements for each framework
const sampleRequirements = [
  // SOC 2 Requirements
  {
    id: 'soc2-cc1-1',
    frameworkId: 'soc2',
    requirementId: 'CC1.1',
    title: 'Control Environment - Integrity and Ethical Values',
    description: 'The entity demonstrates a commitment to integrity and ethical values.',
    category: 'governance',
    priority: 'high'
  },
  {
    id: 'soc2-cc2-1',
    frameworkId: 'soc2',
    requirementId: 'CC2.1',
    title: 'Communication and Information',
    description: 'The entity obtains or generates and uses relevant, quality information to support internal control objectives.',
    category: 'information_communication',
    priority: 'medium'
  },
  {
    id: 'soc2-cc3-1',
    frameworkId: 'soc2',
    requirementId: 'CC3.1',
    title: 'Risk Assessment',
    description: 'The entity specifies objectives with sufficient clarity to enable the identification and assessment of risks.',
    category: 'risk_assessment',
    priority: 'high'
  },

  // ISO 27001 Requirements
  {
    id: 'iso27001-a5-1-1',
    frameworkId: 'iso27001',
    requirementId: 'A.5.1.1',
    title: 'Information Security Policy',
    description: 'A set of policies for information security shall be defined, approved by management, published and communicated to employees and relevant external parties.',
    category: 'organizational_controls',
    priority: 'critical'
  },
  {
    id: 'iso27001-a8-1-1',
    frameworkId: 'iso27001',
    requirementId: 'A.8.1.1',
    title: 'Inventory of Assets',
    description: 'Assets associated with information and information processing facilities shall be identified and an inventory of these assets shall be drawn up and maintained.',
    category: 'asset_management',
    priority: 'high'
  },

  // HIPAA Requirements
  {
    id: 'hipaa-164-308a1',
    frameworkId: 'hipaa',
    requirementId: '164.308(a)(1)',
    title: 'Security Management Process',
    description: 'Implement policies and procedures to prevent, detect, contain, and correct security violations.',
    category: 'administrative_safeguard',
    priority: 'critical'
  },
  {
    id: 'hipaa-164-312a1',
    frameworkId: 'hipaa',
    requirementId: '164.312(a)(1)',
    title: 'Access Control',
    description: 'Implement technical policies and procedures for electronic information systems that maintain ePHI to allow access only to authorized persons.',
    category: 'technical_safeguard',
    priority: 'critical'
  },

  // SCF Requirements
  {
    id: 'scf-iac-01',
    frameworkId: 'scf',
    requirementId: 'IAC-01',
    title: 'Identity & Access Management',
    description: 'Mechanisms exist to facilitate the implementation of access control policies and supporting business processes.',
    category: 'identity_access',
    priority: 'high'
  },
  {
    id: 'scf-dcm-01',
    frameworkId: 'scf',
    requirementId: 'DCM-01',
    title: 'Data Classification',
    description: 'Mechanisms exist to classify data in accordance with classification scheme that is based on criticality and sensitivity.',
    category: 'data_management',
    priority: 'medium'
  }
];

export async function seedFrameworks() {
  console.log('🌱 Seeding frameworks...');

  try {
    // Check if frameworks already exist
    const existingFrameworks = await db.select().from(frameworks);

    if (existingFrameworks.length > 0) {
      console.log('📊 Frameworks already exist, skipping seed');
      return existingFrameworks;
    }

    // Insert all frameworks
    const insertedFrameworks = await db.insert(frameworks).values(frameworksData).returning();

    console.log(`✅ Successfully seeded ${insertedFrameworks.length} frameworks`);
    return insertedFrameworks;
  } catch (error) {
    console.error('❌ Error seeding frameworks:', error);
    throw error;
  }
}

export async function seedComplianceRequirements() {
  console.log('🌱 Seeding compliance requirements...');

  try {
    // Check if requirements already exist
    const existingRequirements = await db.select().from(complianceRequirements);

    if (existingRequirements.length > 0) {
      console.log('📋 Compliance requirements already exist, skipping seed');
      return;
    }

    // Insert all requirements
    await db.insert(complianceRequirements).values(sampleRequirements);

    console.log(`✅ Successfully seeded ${sampleRequirements.length} compliance requirements`);
  } catch (error) {
    console.error('❌ Error seeding compliance requirements:', error);
    throw error;
  }
}

// Main seed function
export async function runSeeds() {
  console.log('🚀 Starting database seeding...');

  await seedFrameworks();
  await seedComplianceRequirements();

  console.log('🎉 Database seeding completed');
}

// Run seeds if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runSeeds()
    .then(() => {
      console.log('✅ Seeding finished successfully');
      // Don't call process.exit() to prevent premature server shutdown
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      // Only exit on error, not on success
      process.exit(1);
    });
}