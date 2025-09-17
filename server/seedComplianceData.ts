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
  },
  
  // Additional Administrative Safeguards
  {
    id: "hipaa-164-308a2",
    frameworkId: "hipaa",
    requirementId: "164.308(a)(2)",
    title: "Assigned Security Responsibility",
    description: "Assign security responsibilities to an individual or organization.",
    category: "administrative_safeguard",
    priority: "critical",
    evidenceTypes: ["policy", "job_description", "assignment_documentation"],
    controlObjective: "Ensure clear security responsibility assignment",
    implementationGuidance: "Designate a security official responsible for developing and implementing security policies."
  },
  {
    id: "hipaa-164-308a3",
    frameworkId: "hipaa",
    requirementId: "164.308(a)(3)",
    title: "Workforce Security",
    description: "Implement procedures to ensure that all members of its workforce have appropriate access to ePHI.",
    category: "administrative_safeguard",
    priority: "high",
    evidenceTypes: ["authorization_procedures", "supervision_procedures", "termination_procedures"],
    controlObjective: "Ensure appropriate workforce access and security procedures",
    implementationGuidance: "Implement procedures for authorization, supervision, clearance procedures, and termination procedures."
  },
  {
    id: "hipaa-164-308a4",
    frameworkId: "hipaa",
    requirementId: "164.308(a)(4)",
    title: "Information Access Management",
    description: "Implement policies and procedures for authorizing access to electronic protected health information.",
    category: "administrative_safeguard",
    priority: "critical",
    evidenceTypes: ["access_policy", "authorization_procedure", "access_logs"],
    controlObjective: "Control and manage access to ePHI",
    implementationGuidance: "Establish procedures for granting access to ePHI through access management."
  },
  {
    id: "hipaa-164-308a7",
    frameworkId: "hipaa",
    requirementId: "164.308(a)(7)",
    title: "Contingency Plan",
    description: "Establish procedures for responding to an emergency or other occurrence that damages systems containing ePHI.",
    category: "administrative_safeguard",
    priority: "high",
    evidenceTypes: ["contingency_plan", "backup_procedures", "recovery_testing"],
    controlObjective: "Ensure business continuity and data recovery",
    implementationGuidance: "Develop data backup plan, disaster recovery plan, and emergency mode operation procedures."
  },
  {
    id: "hipaa-164-308a6",
    frameworkId: "hipaa",
    requirementId: "164.308(a)(6)",
    title: "Security Incident Procedures",
    description: "Implement policies and procedures to address security incidents.",
    category: "administrative_safeguard",
    priority: "critical",
    evidenceTypes: ["incident_procedures", "response_plan", "incident_documentation"],
    controlObjective: "Respond to and document security incidents",
    implementationGuidance: "Implement procedures to identify, respond to, document, and mitigate security incidents."
  },
  {
    id: "hipaa-164-308a8",
    frameworkId: "hipaa",
    requirementId: "164.308(a)(8)",
    title: "Evaluation",
    description: "Conduct an accurate and thorough assessment of the potential risks and vulnerabilities to ePHI.",
    category: "administrative_safeguard",
    priority: "high",
    evidenceTypes: ["risk_assessment", "security_evaluation", "documentation"],
    controlObjective: "Regularly evaluate security measures effectiveness",
    implementationGuidance: "Perform periodic technical and non-technical evaluations of security measures."
  },

  // Additional Physical Safeguards
  {
    id: "hipaa-164-310a2ii",
    frameworkId: "hipaa",
    requirementId: "164.310(a)(2)(ii)",
    title: "Facility Security Plan",
    description: "Implement policies and procedures to safeguard the facility and equipment from unauthorized physical access.",
    category: "physical_safeguard",
    priority: "medium",
    evidenceTypes: ["facility_security_plan", "physical_access_procedures", "monitoring"],
    controlObjective: "Safeguard facility and equipment from unauthorized access",
    implementationGuidance: "Develop and implement a facility security plan to prevent unauthorized physical access to facilities."
  },
  {
    id: "hipaa-164-310b",
    frameworkId: "hipaa",
    requirementId: "164.310(b)",
    title: "Workstation Use",
    description: "Implement policies and procedures that specify the proper functions to be performed on workstations.",
    category: "physical_safeguard",
    priority: "medium",
    evidenceTypes: ["workstation_policy", "usage_procedures", "monitoring"],
    controlObjective: "Control workstation access and proper usage",
    implementationGuidance: "Define proper workstation functions and restrict access to authorized users only."
  },
  {
    id: "hipaa-164-310c",
    frameworkId: "hipaa",
    requirementId: "164.310(c)",
    title: "Workstation Security",
    description: "Implement physical safeguards for all workstations that access ePHI to restrict access to authorized users.",
    category: "physical_safeguard",
    priority: "medium",
    evidenceTypes: ["physical_security", "workstation_controls", "access_restrictions"],
    controlObjective: "Protect workstations from unauthorized physical access",
    implementationGuidance: "Restrict physical access to workstations and implement security measures to prevent unauthorized use."
  },
  {
    id: "hipaa-164-310d1",
    frameworkId: "hipaa",
    requirementId: "164.310(d)(1)",
    title: "Device and Media Controls",
    description: "Implement policies and procedures that govern the receipt and removal of hardware and electronic media.",
    category: "physical_safeguard",
    priority: "high",
    evidenceTypes: ["media_policy", "disposal_procedures", "inventory_logs"],
    controlObjective: "Control access to and disposal of ePHI media",
    implementationGuidance: "Control hardware and media containing ePHI into and out of a facility and within the facility."
  },

  // Additional Technical Safeguards
  {
    id: "hipaa-164-312c1",
    frameworkId: "hipaa",
    requirementId: "164.312(c)(1)",
    title: "Integrity",
    description: "Implement policies and procedures to protect ePHI from improper alteration or destruction.",
    category: "technical_safeguard",
    priority: "high",
    evidenceTypes: ["integrity_controls", "verification_procedures", "monitoring"],
    controlObjective: "Ensure ePHI is not improperly altered or destroyed",
    implementationGuidance: "Implement electronic mechanisms to confirm ePHI has not been improperly altered."
  },
  {
    id: "hipaa-164-312d",
    frameworkId: "hipaa",
    requirementId: "164.312(d)",
    title: "Person or Entity Authentication",
    description: "Implement procedures to verify that a person or entity seeking access to ePHI is the one claimed.",
    category: "technical_safeguard",
    priority: "critical",
    evidenceTypes: ["authentication_systems", "identity_verification", "access_logs"],
    controlObjective: "Verify identity before granting access to ePHI",
    implementationGuidance: "Implement authentication controls such as passwords, PINs, biometrics, or smart cards."
  },
  {
    id: "hipaa-164-312e1",
    frameworkId: "hipaa",
    requirementId: "164.312(e)(1)",
    title: "Transmission Security",
    description: "Implement technical security measures to guard against unauthorized access to ePHI transmitted over networks.",
    category: "technical_safeguard",
    priority: "critical",
    evidenceTypes: ["encryption", "network_security", "transmission_logs"],
    controlObjective: "Protect ePHI during transmission",
    implementationGuidance: "Implement end-to-end encryption and network controls to protect ePHI during transmission."
  },
  {
    id: "hipaa-164-312e2ii",
    frameworkId: "hipaa",
    requirementId: "164.312(e)(2)(ii)",
    title: "Encryption",
    description: "Implement an encryption mechanism to protect ePHI during transmission.",
    category: "technical_safeguard",
    priority: "critical",
    evidenceTypes: ["encryption_policy", "transmission_encryption", "key_management"],
    controlObjective: "Protect ePHI during transmission through encryption",
    implementationGuidance: "Implement encryption mechanisms to protect ePHI transmitted over networks."
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
  },

  // Additional Common Criteria Controls
  {
    id: "soc2-cc6-1",
    frameworkId: "soc2",
    requirementId: "CC6.1",
    title: "Logical and Physical Access Controls",
    description: "The entity implements logical and physical access controls to protect against threats from sources outside its system boundaries.",
    category: "access_control",
    priority: "critical",
    evidenceTypes: ["access_controls", "authentication_systems", "authorization_procedures"],
    controlObjective: "Protect against unauthorized access from external sources",
    implementationGuidance: "Implement robust authentication, authorization, and physical access controls."
  },
  {
    id: "soc2-cc6-2",
    frameworkId: "soc2",
    requirementId: "CC6.2",
    title: "Prior Authorization",
    description: "Prior to issuing system credentials and granting system access, the entity registers and authorizes new internal and external users.",
    category: "access_control",
    priority: "high",
    evidenceTypes: ["user_provisioning", "authorization_procedures", "access_reviews"],
    controlObjective: "Ensure proper authorization before granting access",
    implementationGuidance: "Implement user registration and authorization processes before granting system access."
  },
  {
    id: "soc2-cc6-3",
    frameworkId: "soc2",
    requirementId: "CC6.3",
    title: "User Access Reviews",
    description: "The entity authorizes, modifies, or removes access to data, software, functions, and other protected information assets based on roles.",
    category: "access_control",
    priority: "high",
    evidenceTypes: ["access_reviews", "role_definitions", "access_modifications"],
    controlObjective: "Manage user access based on roles and responsibilities",
    implementationGuidance: "Regularly review and update user access based on role changes and business needs."
  },
  {
    id: "soc2-cc7-1",
    frameworkId: "soc2",
    requirementId: "CC7.1",
    title: "System Operation",
    description: "To meet its objectives, the entity uses detection and monitoring procedures to identify security events.",
    category: "system_operations",
    priority: "high",
    evidenceTypes: ["monitoring_procedures", "security_events", "detection_systems"],
    controlObjective: "Detect and monitor security events",
    implementationGuidance: "Implement comprehensive monitoring and detection procedures for security events."
  },
  {
    id: "soc2-cc7-2",
    frameworkId: "soc2",
    requirementId: "CC7.2",
    title: "Security Incident Response",
    description: "The entity monitors system components and the operation of controls to detect anomalies.",
    category: "incident_response",
    priority: "critical",
    evidenceTypes: ["incident_procedures", "response_plans", "monitoring_systems"],
    controlObjective: "Respond effectively to security incidents",
    implementationGuidance: "Establish and maintain incident response procedures and monitoring capabilities."
  },

  // Security Trust Services Criteria
  {
    id: "soc2-s1-1",
    frameworkId: "soc2",
    requirementId: "S1.1",
    title: "Information Security Program",
    description: "The entity has implemented an information security program that provides reasonable assurance that the confidentiality, integrity, and availability of system information is protected.",
    category: "security_program",
    priority: "critical",
    evidenceTypes: ["security_program", "policies", "procedures"],
    controlObjective: "Establish comprehensive information security program",
    implementationGuidance: "Develop and implement a formal information security program covering all aspects of security."
  },
  {
    id: "soc2-s1-2",
    frameworkId: "soc2",
    requirementId: "S1.2",
    title: "Risk Assessment Process",
    description: "The entity has implemented a risk assessment process that identifies threats and vulnerabilities and assesses the impact should they occur.",
    category: "risk_management", 
    priority: "high",
    evidenceTypes: ["risk_assessments", "threat_analysis", "vulnerability_scans"],
    controlObjective: "Identify and assess security risks systematically",
    implementationGuidance: "Conduct regular risk assessments to identify threats, vulnerabilities, and potential impacts."
  },
  {
    id: "soc2-s1-3",
    frameworkId: "soc2",
    requirementId: "S1.3",
    title: "Security Awareness Training",
    description: "The entity provides security awareness training to personnel to enable them to fulfill their information security responsibilities.",
    category: "training",
    priority: "high",
    evidenceTypes: ["training_programs", "awareness_materials", "training_records"],
    controlObjective: "Ensure personnel understand security responsibilities",
    implementationGuidance: "Provide regular security awareness training to all personnel with access to systems."
  },

  // Availability Trust Services Criteria
  {
    id: "soc2-a1-1",
    frameworkId: "soc2",
    requirementId: "A1.1",
    title: "Availability Commitments",
    description: "The entity maintains, monitors, and evaluates current processing capacity and use of system components to manage capacity demand.",
    category: "availability",
    priority: "high",
    evidenceTypes: ["capacity_monitoring", "performance_metrics", "availability_reports"],
    controlObjective: "Manage system capacity and availability",
    implementationGuidance: "Monitor system capacity and performance to ensure availability commitments are met."
  },
  {
    id: "soc2-a1-2",
    frameworkId: "soc2",
    requirementId: "A1.2",
    title: "Business Continuity",
    description: "The entity authorizes, designs, develops or acquires, implements, operates, approves, maintains, and monitors environmental protections, software, data backup processes, and recovery infrastructure.",
    category: "business_continuity",
    priority: "critical",
    evidenceTypes: ["backup_procedures", "recovery_plans", "business_continuity_plans"],
    controlObjective: "Ensure business continuity and disaster recovery capabilities",
    implementationGuidance: "Implement comprehensive backup, recovery, and business continuity procedures."
  },

  // Processing Integrity Trust Services Criteria
  {
    id: "soc2-pi1-1",
    frameworkId: "soc2",
    requirementId: "PI1.1",
    title: "Data Processing Integrity",
    description: "The entity implements controls over inputs, processing, and outputs to meet processing integrity commitments.",
    category: "processing_integrity",
    priority: "high",
    evidenceTypes: ["input_controls", "processing_controls", "output_controls"],
    controlObjective: "Ensure accurate and complete data processing",
    implementationGuidance: "Implement controls to ensure data is processed completely, accurately, and in a timely manner."
  },

  // Confidentiality Trust Services Criteria  
  {
    id: "soc2-c1-1",
    frameworkId: "soc2",
    requirementId: "C1.1",
    title: "Confidentiality Commitments",
    description: "The entity identifies and maintains confidential information to meet the entity's objectives related to confidentiality.",
    category: "confidentiality",
    priority: "critical",
    evidenceTypes: ["data_classification", "confidentiality_policies", "access_controls"],
    controlObjective: "Protect confidential information appropriately",
    implementationGuidance: "Classify data based on confidentiality requirements and implement appropriate protection measures."
  },
  {
    id: "soc2-c1-2", 
    frameworkId: "soc2",
    requirementId: "C1.2",
    title: "Confidential Information Disposal",
    description: "The entity disposes of confidential information to meet the entity's objectives related to confidentiality.",
    category: "confidentiality",
    priority: "high",
    evidenceTypes: ["disposal_procedures", "destruction_policies", "disposal_logs"],
    controlObjective: "Securely dispose of confidential information",
    implementationGuidance: "Implement secure disposal procedures for confidential information when no longer needed."
  },

  // Privacy Trust Services Criteria
  {
    id: "soc2-p1-1",
    frameworkId: "soc2",
    requirementId: "P1.1",
    title: "Privacy Notice",
    description: "The entity provides notice to data subjects about its privacy practices to meet the entity's objectives related to privacy.",
    category: "privacy",
    priority: "high", 
    evidenceTypes: ["privacy_notices", "privacy_policies", "consent_procedures"],
    controlObjective: "Provide transparent privacy notices to data subjects",
    implementationGuidance: "Develop and maintain clear privacy notices that inform data subjects about data collection and use practices."
  },
  {
    id: "soc2-p2-1",
    frameworkId: "soc2",
    requirementId: "P2.1", 
    title: "Consent and Choice",
    description: "The entity communicates choices available regarding the collection, use, retention, disclosure, and disposal of personal information.",
    category: "privacy",
    priority: "high",
    evidenceTypes: ["consent_mechanisms", "choice_options", "opt_out_procedures"],
    controlObjective: "Provide meaningful choices regarding personal information",
    implementationGuidance: "Implement mechanisms for obtaining and managing consent and providing choices about personal information use."
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