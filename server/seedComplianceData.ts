import { db } from './db';
import { frameworks, complianceRequirements } from '@shared/schema';

// HIPAA Security Rule Controls
const hipaaControls = [
  {
    id: "hipaa-164-308a1",
    frameworkId: "hipaa",
    requirementId: "164.308(a)(1)",
    title: "Security Management Process",
    description: "Implement policies and procedures to prevent, detect, contain, and correct security violations.",
    category: "administrative_safeguard",
    priority: "high",
    evidenceTypes: ["policy", "procedure", "documentation"],
    controlObjective: "Establish security management processes for protecting ePHI",
    implementationGuidance: "Designate a security officer and implement security policies covering all workforce members."
  },
  {
    id: "hipaa-164-308a5",
    frameworkId: "hipaa",
    requirementId: "164.308(a)(5)",
    title: "Security Awareness and Training",
    description: "Implement a security awareness and training program for all members of the workforce.",
    category: "administrative_safeguard",
    priority: "high",
    evidenceTypes: ["training_records", "policy", "certification"],
    controlObjective: "Ensure workforce receives appropriate security training",
    implementationGuidance: "Conduct periodic security updates and implement training for new workforce members."
  },
  {
    id: "hipaa-164-310a1",
    frameworkId: "hipaa",
    requirementId: "164.310(a)(1)",
    title: "Facility Access Controls",
    description: "Implement policies and procedures to limit physical access to electronic information systems.",
    category: "physical_safeguard",
    priority: "medium",
    evidenceTypes: ["access_logs", "policy", "physical_security"],
    controlObjective: "Control physical access to systems containing ePHI",
    implementationGuidance: "Implement access controls, visitor logs, and workstation security measures."
  },
  {
    id: "hipaa-164-312a1",
    frameworkId: "hipaa",
    requirementId: "164.312(a)(1)",
    title: "Access Control",
    description: "Implement technical policies and procedures for electronic information systems that maintain ePHI to allow access only to authorized persons.",
    category: "technical_safeguard",
    priority: "critical",
    evidenceTypes: ["access_logs", "user_management", "authentication"],
    controlObjective: "Ensure only authorized personnel can access ePHI",
    implementationGuidance: "Implement unique user identification, emergency access procedures, and role-based access controls."
  },
  {
    id: "hipaa-164-312b",
    frameworkId: "hipaa",
    requirementId: "164.312(b)",
    title: "Audit Controls",
    description: "Implement mechanisms to record and examine activity in systems that contain or use ePHI.",
    category: "technical_safeguard",
    priority: "high",
    evidenceTypes: ["audit_logs", "monitoring", "reporting"],
    controlObjective: "Track and monitor access to ePHI systems",
    implementationGuidance: "Implement logging mechanisms and regular review of audit logs for unauthorized access."
  }
];

// SOC 2 Trust Services Criteria Controls
const soc2Controls = [
  {
    id: "soc2-cc1-1",
    frameworkId: "soc2",
    requirementId: "CC1.1",
    title: "Control Environment - Integrity and Ethical Values",
    description: "The entity demonstrates a commitment to integrity and ethical values.",
    category: "governance",
    priority: "high",
    evidenceTypes: ["policy", "code_of_conduct", "training"],
    controlObjective: "Establish tone at the top for integrity and ethical behavior",
    implementationGuidance: "Implement code of conduct, ethics training, and disciplinary measures for violations."
  },
  {
    id: "soc2-cc2-1",
    frameworkId: "soc2",
    requirementId: "CC2.1",
    title: "Communication and Information",
    description: "The entity obtains or generates and uses relevant, quality information to support internal control objectives.",
    category: "information_communication",
    priority: "medium",
    evidenceTypes: ["documentation", "reporting", "communication"],
    controlObjective: "Ensure effective information flow for control activities",
    implementationGuidance: "Establish communication channels and reporting mechanisms for control-related information."
  },
  {
    id: "soc2-cc3-1",
    frameworkId: "soc2",
    requirementId: "CC3.1",
    title: "Risk Assessment",
    description: "The entity specifies objectives with sufficient clarity to enable the identification and assessment of risks.",
    category: "risk_assessment",
    priority: "high",
    evidenceTypes: ["risk_assessment", "documentation", "procedures"],
    controlObjective: "Identify and assess risks to achieving control objectives",
    implementationGuidance: "Conduct regular risk assessments and document risk management procedures."
  },
  {
    id: "soc2-cc4-1",
    frameworkId: "soc2",
    requirementId: "CC4.1",
    title: "Monitoring Activities",
    description: "The entity selects, develops, and performs ongoing evaluations to ascertain whether components of internal control are present and functioning.",
    category: "monitoring",
    priority: "medium",
    evidenceTypes: ["monitoring_reports", "testing", "documentation"],
    controlObjective: "Monitor effectiveness of internal controls",
    implementationGuidance: "Implement ongoing monitoring activities and periodic separate evaluations."
  },
  {
    id: "soc2-cc5-1",
    frameworkId: "soc2",
    requirementId: "CC5.1",
    title: "Control Activities",
    description: "The entity selects and develops control activities that contribute to the mitigation of risks.",
    category: "control_activities",
    priority: "high",
    evidenceTypes: ["procedures", "documentation", "testing"],
    controlObjective: "Implement control activities to mitigate identified risks",
    implementationGuidance: "Design and implement control activities aligned with risk assessment results."
  }
];

export async function seedComplianceData() {
  try {
    console.log('🌱 Starting compliance data seeding...');

    // First, check if frameworks already exist
    const existingFrameworks = await db.select().from(frameworks);
    if (existingFrameworks.length > 0) {
      console.log('📊 Frameworks already seeded, skipping...');
      return;
    }

    // Seed frameworks
    await db.insert(frameworks).values([
      {
        id: "iso27001",
        name: "iso27001",
        displayName: "ISO 27001",
        description: "International standard for information security management systems",
        complexity: "high",
        estimatedTimeMonths: 12,
        totalControls: 114,
        icon: "🛡️",
        color: "#3B82F6"
      },
      {
        id: "scf",
        name: "scf",
        displayName: "Secure Controls Framework (SCF)",
        description: "Comprehensive cybersecurity framework",
        complexity: "high",
        estimatedTimeMonths: 18,
        totalControls: 200,
        icon: "🔒",
        color: "#8B5CF6"
      },
      {
        id: "hipaa",
        name: "hipaa",
        displayName: "HIPAA Security Rule",
        description: "Administrative, Physical, and Technical Safeguards for protecting ePHI",
        complexity: "medium",
        estimatedTimeMonths: 8,
        totalControls: 18,
        icon: "🏥",
        color: "#10B981"
      },
      {
        id: "soc2",
        name: "soc2",
        displayName: "SOC 2 Type II",
        description: "Trust Services Criteria for Security, Availability, Processing Integrity, Confidentiality, and Privacy",
        complexity: "high",
        estimatedTimeMonths: 10,
        totalControls: 64,
        icon: "✅",
        color: "#F59E0B"
      }
    ]);

    // Seed compliance requirements for each framework
    const allRequirements = [
      ...hipaaControls,
      ...soc2Controls
    ];

    await db.insert(complianceRequirements).values(allRequirements);

    console.log('✅ Compliance data seeded successfully.');
  } catch (error) {
    console.error('❌ Error seeding compliance data:', error);
  }
}