import { storage } from './storage';

// Sample compliance requirements data for different frameworks
const sampleComplianceRequirements = [
  // ISO 27001 Requirements
  {
    frameworkId: 'ISO27001',
    requirementId: 'A.9.1.2',
    title: 'Access to networks and network services',
    description: 'Users shall only be provided with access to the network and network services that they have been specifically authorized to use.',
    category: 'Access Control',
    priority: 'high' as const,
    evidenceTypes: ['network_policies', 'access_logs', 'authorization_procedures'],
    controlObjective: 'To prevent unauthorized access to networks and network services'
  },
  {
    frameworkId: 'ISO27001',
    requirementId: 'A.8.2.3',
    title: 'Handling of assets',
    description: 'Procedures for handling assets shall be developed and implemented in accordance with the information classification scheme adopted by the organization.',
    category: 'Asset Management',
    priority: 'medium' as const,
    evidenceTypes: ['asset_inventory', 'handling_procedures', 'classification_scheme'],
    controlObjective: 'To ensure appropriate handling of assets in accordance with classification'
  },
  {
    frameworkId: 'ISO27001',
    requirementId: 'A.16.1.2',
    title: 'Reporting information security events',
    description: 'Information security events shall be reported through appropriate management channels as quickly as possible.',
    category: 'Incident Management',
    priority: 'critical' as const,
    evidenceTypes: ['incident_procedures', 'reporting_channels', 'response_plan'],
    controlObjective: 'To ensure information security events are communicated in a timely manner'
  },
  {
    frameworkId: 'ISO27001',
    requirementId: 'A.12.6.1',
    title: 'Management of technical vulnerabilities',
    description: 'Information about technical vulnerabilities of information systems being used shall be obtained in a timely fashion, the organizations exposure to such vulnerabilities evaluated and appropriate measures taken to address the associated risk.',
    category: 'Systems Security',
    priority: 'high' as const,
    evidenceTypes: ['vulnerability_scans', 'patch_management', 'risk_assessments'],
    controlObjective: 'To prevent exploitation of technical vulnerabilities'
  },

  // SOC 2 Requirements
  {
    frameworkId: 'SOC2',
    requirementId: 'CC6.1',
    title: 'Logical and Physical Access Controls',
    description: 'The entity implements logical and physical access controls to restrict unauthorized access to system resources, data, and vendor credentials.',
    category: 'Common Criteria',
    priority: 'critical' as const,
    evidenceTypes: ['access_controls', 'authentication_systems', 'physical_security'],
    controlObjective: 'To restrict access to authorized personnel only'
  },
  {
    frameworkId: 'SOC2',
    requirementId: 'CC7.2',
    title: 'System Monitoring',
    description: 'The entity monitors system components and the operation of controls to detect anomalies that are indicative of malicious acts, natural disasters, and errors.',
    category: 'Common Criteria',
    priority: 'high' as const,
    evidenceTypes: ['monitoring_systems', 'log_analysis', 'alert_procedures'],
    controlObjective: 'To detect and respond to anomalous activities'
  },
  {
    frameworkId: 'SOC2',
    requirementId: 'A1.1',
    title: 'Availability Monitoring',
    description: 'The entity maintains, monitors, and evaluates current processing capacity and use of system components to manage capacity demand and to enable the implementation of additional capacity.',
    category: 'Availability',
    priority: 'medium' as const,
    evidenceTypes: ['capacity_monitoring', 'performance_metrics', 'scaling_procedures'],
    controlObjective: 'To ensure system availability meets commitments'
  },

  // GDPR Requirements
  {
    frameworkId: 'GDPR',
    requirementId: 'Art.32',
    title: 'Security of processing',
    description: 'The controller and processor shall implement appropriate technical and organisational measures to ensure a level of security appropriate to the risk.',
    category: 'Security',
    priority: 'critical' as const,
    evidenceTypes: ['security_measures', 'risk_assessments', 'encryption_policies'],
    controlObjective: 'To ensure appropriate security of personal data'
  },
  {
    frameworkId: 'GDPR',
    requirementId: 'Art.33',
    title: 'Notification of a personal data breach to the supervisory authority',
    description: 'In the case of a personal data breach, the controller shall without undue delay and, where feasible, not later than 72 hours after having become aware of it, notify the personal data breach to the competent supervisory authority.',
    category: 'Breach Notification',
    priority: 'critical' as const,
    evidenceTypes: ['breach_procedures', 'notification_processes', 'incident_logs'],
    controlObjective: 'To ensure timely notification of data breaches'
  },
  {
    frameworkId: 'GDPR',
    requirementId: 'Art.25',
    title: 'Data protection by design and by default',
    description: 'The controller shall implement appropriate technical and organisational measures designed to implement data-protection principles in an effective manner.',
    category: 'Privacy by Design',
    priority: 'high' as const,
    evidenceTypes: ['privacy_policies', 'design_documentation', 'default_settings'],
    controlObjective: 'To ensure privacy protection is built into systems'
  },

  // HIPAA Requirements
  {
    frameworkId: 'HIPAA',
    requirementId: '164.312(a)(1)',
    title: 'Access Control',
    description: 'Implement technical policies and procedures for electronic information systems that maintain electronic protected health information to allow access only to those persons or software programs that have been granted access rights.',
    category: 'Technical Safeguards',
    priority: 'critical' as const,
    evidenceTypes: ['access_control_policies', 'user_authentication', 'audit_logs'],
    controlObjective: 'To control access to electronic PHI'
  },
  {
    frameworkId: 'HIPAA',
    requirementId: '164.312(b)',
    title: 'Audit controls',
    description: 'Implement hardware, software, and/or procedural mechanisms that record and examine activity in information systems that contain or use electronic protected health information.',
    category: 'Technical Safeguards',
    priority: 'high' as const,
    evidenceTypes: ['audit_systems', 'log_monitoring', 'review_procedures'],
    controlObjective: 'To monitor access and activity involving PHI'
  },
  {
    frameworkId: 'HIPAA',
    requirementId: '164.308(a)(1)(i)',
    title: 'Conduct an accurate and thorough assessment',
    description: 'Conduct an accurate and thorough assessment of the potential risks and vulnerabilities to the confidentiality, integrity, and availability of electronic protected health information held by the covered entity.',
    category: 'Administrative Safeguards',
    priority: 'high' as const,
    evidenceTypes: ['risk_assessments', 'vulnerability_assessments', 'security_evaluations'],
    controlObjective: 'To identify and assess security risks to PHI'
  }
];

export async function seedComplianceRequirements() {
  console.log('Seeding compliance requirements...');
  
  try {
    for (const requirement of sampleComplianceRequirements) {
      await storage.createComplianceRequirement(requirement);
    }
    console.log(`Seeded ${sampleComplianceRequirements.length} compliance requirements successfully.`);
  } catch (error) {
    console.error('Error seeding compliance requirements:', error);
  }
}

// Call this function when the server starts to populate sample data
if (require.main === module) {
  seedComplianceRequirements().then(() => {
    console.log('Compliance requirements seeding completed.');
    process.exit(0);
  });
}