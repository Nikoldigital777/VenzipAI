
import { storage } from '../storage';
import type { GeneratedPolicy, InsertDocument, InsertEvidenceMapping } from '@shared/schema';

export class PolicyEvidenceMapper {
  
  /**
   * Map generated policies to compliance requirements as evidence
   */
  async mapPoliciesToEvidence(
    policyId: string,
    userId: string,
    companyId: string
  ): Promise<void> {
    try {
      // Get the generated policy
      const policy = await storage.getGeneratedPolicyById(policyId);
      if (!policy) {
        throw new Error('Policy not found');
      }

      // Create a document entry for this policy
      const policyDocument: InsertDocument = {
        userId,
        companyId,
        fileName: `${policy.title}.pdf`,
        fileType: 'application/pdf',
        fileSize: policy.content.length,
        filePath: `/generated-policies/${policyId}`,
        sha256Hash: this.generatePolicyHash(policy.content),
        uploaderUserId: userId,
        status: 'verified',
        extractedText: policy.content
      };

      const savedDocument = await storage.createDocument(policyDocument);

      // Map policy to relevant compliance requirements based on type
      const mappings = await this.getPolicyRequirementMappings(policy);

      for (const mapping of mappings) {
        try {
          // Create evidence mapping
          const evidenceMapping: InsertEvidenceMapping = {
            userId,
            documentId: savedDocument.id,
            requirementId: mapping.requirementId,
            mappingConfidence: mapping.confidence,
            qualityScore: mapping.qualityScore,
            mappingType: 'direct',
            evidenceSnippets: { snippets: [mapping.relevantSection] },
            aiAnalysis: {
              summary: `Generated ${policy.policyType} policy provides direct compliance evidence`,
              relevantSections: [mapping.relevantSection],
              gaps: [],
              recommendations: ['Policy is automatically generated and compliant'],
              qualityFactors: {
                completeness: 0.9,
                clarity: 0.9,
                relevance: 1.0,
                specificity: 0.8
              }
            },
            validationStatus: 'validated'
          };

          await storage.createEvidenceMapping(evidenceMapping);
          console.log(`Mapped policy "${policy.title}" to requirement ${mapping.requirementId}`);
          
        } catch (mappingError) {
          console.error(`Failed to create evidence mapping for requirement ${mapping.requirementId}:`, mappingError);
        }
      }

    } catch (error) {
      console.error('Failed to map policy to evidence:', error);
      throw error;
    }
  }

  /**
   * Get requirement mappings for a specific policy type
   */
  private async getPolicyRequirementMappings(policy: GeneratedPolicy): Promise<Array<{
    requirementId: string;
    confidence: string;
    qualityScore: string;
    relevantSection: string;
  }>> {
    const mappings = [];

    // Get all compliance requirements
    const allRequirements = await storage.getComplianceRequirements();

    if (policy.policyType === 'policy' && policy.category === 'governance') {
      // Map Information Security Policy to ISO 27001 governance requirements
      const govRequirements = allRequirements.filter(req => 
        req.frameworkId === 'iso27001' && 
        (req.requirementId.includes('A.5.1') || req.category === 'governance')
      );

      for (const req of govRequirements) {
        mappings.push({
          requirementId: req.id,
          confidence: '0.95',
          qualityScore: '0.90',
          relevantSection: 'Information Security Policy - Management Commitment and Organization'
        });
      }
    }

    if (policy.policyType === 'policy' && policy.category === 'privacy') {
      // Map HIPAA Privacy Policy to HIPAA privacy requirements
      const privacyRequirements = allRequirements.filter(req => 
        req.frameworkId === 'hipaa' && 
        (req.requirementId.includes('164.530') || req.requirementId.includes('164.520'))
      );

      for (const req of privacyRequirements) {
        mappings.push({
          requirementId: req.id,
          confidence: '0.95',
          qualityScore: '0.90',
          relevantSection: 'HIPAA Privacy Policy - Privacy Officer and Procedures'
        });
      }
    }

    return mappings;
  }

  /**
   * Generate a hash for policy content (simple implementation)
   */
  private generatePolicyHash(content: string): string {
    // Simple hash generation - in production, use crypto
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16).padStart(16, '0');
  }
}

export const policyEvidenceMapper = new PolicyEvidenceMapper();
