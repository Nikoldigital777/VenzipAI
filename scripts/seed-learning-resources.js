// Seed script to populate learning resources
// This would normally be run once to populate the database with sample content

const { sql } = require("drizzle-orm");

const sampleResources = [
  // SOC 2 Resources
  {
    title: "SOC 2 Type I vs Type II: Understanding the Differences",
    description: "Learn the key differences between SOC 2 Type I and Type II audits, their requirements, and which one is right for your organization.",
    resourceType: "pdf",
    frameworkId: "soc2",
    category: "Fundamentals",
    difficulty: "beginner",
    duration: 15,
    resourceUrl: "https://example.com/soc2-types.pdf",
    thumbnailUrl: null,
    tags: ["audit", "compliance", "fundamentals"],
    isPublic: true,
    sortOrder: 1
  },
  {
    title: "SOC 2 Trust Service Criteria Deep Dive",
    description: "A comprehensive video walkthrough of all five SOC 2 trust service criteria: Security, Availability, Processing Integrity, Confidentiality, and Privacy.",
    resourceType: "video",
    frameworkId: "soc2",
    category: "Trust Service Criteria",
    difficulty: "intermediate",
    duration: 45,
    resourceUrl: "https://example.com/soc2-criteria.mp4",
    thumbnailUrl: null,
    tags: ["TSC", "security", "availability", "privacy"],
    isPublic: true,
    sortOrder: 2
  },
  {
    title: "Building Your SOC 2 Control Environment",
    description: "Step-by-step guide to establishing and maintaining an effective control environment for SOC 2 compliance.",
    resourceType: "course",
    frameworkId: "soc2",
    category: "Implementation",
    difficulty: "advanced",
    duration: 120,
    resourceUrl: "https://example.com/soc2-controls-course",
    thumbnailUrl: null,
    tags: ["controls", "implementation", "management"],
    isPublic: true,
    sortOrder: 3
  },
  
  // ISO 27001 Resources
  {
    title: "ISO 27001:2022 Overview and Changes",
    description: "Understand the latest version of ISO 27001 and the key changes from the 2013 version.",
    resourceType: "pdf",
    frameworkId: "iso27001",
    category: "Standards Overview",
    difficulty: "beginner",
    duration: 20,
    resourceUrl: "https://example.com/iso27001-2022.pdf",
    thumbnailUrl: null,
    tags: ["ISO", "2022", "changes", "overview"],
    isPublic: true,
    sortOrder: 4
  },
  {
    title: "Risk Assessment for ISO 27001",
    description: "Master the risk assessment process required for ISO 27001 certification with practical examples and templates.",
    resourceType: "video",
    frameworkId: "iso27001",
    category: "Risk Management",
    difficulty: "intermediate",
    duration: 60,
    resourceUrl: "https://example.com/iso27001-risk-assessment.mp4",
    thumbnailUrl: null,
    tags: ["risk", "assessment", "templates"],
    isPublic: true,
    sortOrder: 5
  },
  {
    title: "Annex A Controls Implementation Guide",
    description: "Comprehensive guide to implementing ISO 27001 Annex A controls in your organization.",
    resourceType: "course",
    frameworkId: "iso27001",
    category: "Controls",
    difficulty: "advanced",
    duration: 180,
    resourceUrl: "https://example.com/iso27001-annexa-course",
    thumbnailUrl: null,
    tags: ["Annex A", "controls", "implementation"],
    isPublic: true,
    sortOrder: 6
  },
  
  // HIPAA Resources
  {
    title: "HIPAA Privacy Rule Fundamentals",
    description: "Essential knowledge about the HIPAA Privacy Rule, covered entities, and protected health information (PHI).",
    resourceType: "pdf",
    frameworkId: "hipaa",
    category: "Privacy",
    difficulty: "beginner",
    duration: 25,
    resourceUrl: "https://example.com/hipaa-privacy-rule.pdf",
    thumbnailUrl: null,
    tags: ["privacy", "PHI", "covered entities"],
    isPublic: true,
    sortOrder: 7
  },
  {
    title: "HIPAA Security Rule Technical Safeguards",
    description: "Learn about technical safeguards required under the HIPAA Security Rule including access controls, audit logs, and encryption.",
    resourceType: "video",
    frameworkId: "hipaa",
    category: "Security",
    difficulty: "intermediate",
    duration: 40,
    resourceUrl: "https://example.com/hipaa-technical-safeguards.mp4",
    thumbnailUrl: null,
    tags: ["security", "technical safeguards", "encryption"],
    isPublic: true,
    sortOrder: 8
  },
  {
    title: "HIPAA Breach Response and Notification",
    description: "Complete guide to handling HIPAA breaches, notification requirements, and remediation steps.",
    resourceType: "article",
    frameworkId: "hipaa",
    category: "Incident Response",
    difficulty: "advanced",
    duration: 30,
    resourceUrl: "https://example.com/hipaa-breach-response",
    thumbnailUrl: null,
    tags: ["breach", "notification", "incident response"],
    isPublic: true,
    sortOrder: 9
  },
  
  // GDPR Resources
  {
    title: "GDPR for Non-EU Companies",
    description: "Understanding GDPR requirements for companies outside the EU that process European personal data.",
    resourceType: "pdf",
    frameworkId: "gdpr",
    category: "Applicability",
    difficulty: "beginner",
    duration: 30,
    resourceUrl: "https://example.com/gdpr-non-eu.pdf",
    thumbnailUrl: null,
    tags: ["territorial scope", "non-EU", "applicability"],
    isPublic: true,
    sortOrder: 10
  },
  {
    title: "Data Subject Rights Under GDPR",
    description: "Comprehensive overview of the eight data subject rights under GDPR and how to handle requests.",
    resourceType: "video",
    frameworkId: "gdpr",
    category: "Data Subject Rights",
    difficulty: "intermediate",
    duration: 50,
    resourceUrl: "https://example.com/gdpr-data-subject-rights.mp4",
    thumbnailUrl: null,
    tags: ["data subject", "rights", "requests"],
    isPublic: true,
    sortOrder: 11
  },
  {
    title: "GDPR Data Protection Impact Assessments",
    description: "Learn when and how to conduct Data Protection Impact Assessments (DPIAs) under GDPR.",
    resourceType: "course",
    frameworkId: "gdpr",
    category: "Privacy by Design",
    difficulty: "advanced",
    duration: 90,
    resourceUrl: "https://example.com/gdpr-dpia-course",
    thumbnailUrl: null,
    tags: ["DPIA", "privacy by design", "assessment"],
    isPublic: true,
    sortOrder: 12
  },
  
  // General Compliance Resources
  {
    title: "Building a Compliance Culture in Your Organization",
    description: "Strategies for creating and maintaining a strong compliance culture that goes beyond just checking boxes.",
    resourceType: "article",
    frameworkId: null,
    category: "Culture & Management",
    difficulty: "beginner",
    duration: 20,
    resourceUrl: "https://example.com/compliance-culture",
    thumbnailUrl: null,
    tags: ["culture", "management", "leadership"],
    isPublic: true,
    sortOrder: 13
  },
  {
    title: "Third-Party Risk Management Best Practices",
    description: "How to assess, monitor, and manage third-party vendors to maintain compliance across multiple frameworks.",
    resourceType: "video",
    frameworkId: null,
    category: "Risk Management",
    difficulty: "intermediate",
    duration: 35,
    resourceUrl: "https://example.com/third-party-risk.mp4",
    thumbnailUrl: null,
    tags: ["third-party", "vendor", "risk management"],
    isPublic: true,
    sortOrder: 14
  },
  {
    title: "Compliance Automation and GRC Tools",
    description: "Explore tools and technologies that can help automate compliance monitoring and reporting.",
    resourceType: "course",
    frameworkId: null,
    category: "Technology",
    difficulty: "advanced",
    duration: 150,
    resourceUrl: "https://example.com/compliance-automation-course",
    thumbnailUrl: null,
    tags: ["automation", "GRC", "tools", "technology"],
    isPublic: true,
    sortOrder: 15
  }
];

// This would be called by a migration or setup script
console.log("Sample learning resources for seeding:");
console.log(JSON.stringify(sampleResources, null, 2));

module.exports = { sampleResources };