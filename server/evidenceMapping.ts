import Anthropic from '@anthropic-ai/sdk';
import { storage } from './storage';
import type { Document, ComplianceRequirement, EvidenceMapping, EvidenceGap } from '@shared/schema';

// The newest Anthropic model is "claude-sonnet-4-20250514", not "claude-3-7-sonnet-20250219", "claude-3-5-sonnet-20241022" nor "claude-3-sonnet-20240229".
const DEFAULT_MODEL_STR = "claude-sonnet-4-20250514";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface DocumentAnalysisResult {
  evidenceSnippets: string[];
  mappingConfidence: number;
  qualityScore: number;
  mappingType: 'direct' | 'partial' | 'supporting' | 'cross_reference';
  aiAnalysis: {
    summary: string;
    relevantSections: string[];
    gaps: string[];
    recommendations: string[];
    qualityFactors: {
      completeness: number;
      clarity: number;
      relevance: number;
      specificity: number;
    };
  };
}

interface GapAnalysisResult {
  gapType: 'missing_evidence' | 'insufficient_evidence' | 'outdated_evidence' | 'poor_quality';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  recommendedActions: string[];
  estimatedEffort: 'low' | 'medium' | 'high';
}

export class EvidenceMappingService {
  
  /**
   * Analyze a document against compliance requirements using AI
   */
  async analyzeDocumentForCompliance(
    documentId: string,
    userId: string,
    frameworkId?: string
  ): Promise<EvidenceMapping[]> {
    // Get document content (this would need to be implemented based on your document storage)
    const document = await storage.getDocumentById(documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    // Get compliance requirements for the framework
    const requirements = await storage.getComplianceRequirements(frameworkId);
    
    const mappings: EvidenceMapping[] = [];

    // Analyze document against each requirement
    for (const requirement of requirements) {
      const analysis = await this.analyzeDocumentAgainstRequirement(
        document, 
        requirement
      );

      if (analysis.mappingConfidence > 0.1) { // Only create mappings with reasonable confidence
        const mapping = await storage.createEvidenceMapping({
          userId,
          documentId,
          requirementId: requirement.id,
          mappingConfidence: analysis.mappingConfidence.toString(),
          qualityScore: analysis.qualityScore.toString(),
          mappingType: analysis.mappingType,
          evidenceSnippets: { snippets: analysis.evidenceSnippets },
          aiAnalysis: analysis.aiAnalysis,
          validationStatus: 'pending'
        });
        mappings.push(mapping);
      }
    }

    return mappings;
  }

  /**
   * Analyze a specific document against a specific compliance requirement
   */
  private async analyzeDocumentAgainstRequirement(
    document: Document,
    requirement: ComplianceRequirement
  ): Promise<DocumentAnalysisResult> {
    // Mock document content for demonstration - in real implementation, extract from document file
    const documentContent = this.getDocumentContent(document);

    const prompt = `
You are an expert compliance analyst. Analyze the following document content against a specific compliance requirement.

COMPLIANCE REQUIREMENT:
Framework: ${requirement.frameworkId}
ID: ${requirement.requirementId}
Title: ${requirement.title}
Description: ${requirement.description}
Category: ${requirement.category}
Priority: ${requirement.priority}
Expected Evidence Types: ${requirement.evidenceTypes?.join(', ') || 'Not specified'}

DOCUMENT TO ANALYZE:
Title: ${document.fileName}
Type: ${document.fileType}
Content: ${documentContent}

Please analyze this document and provide:

1. MAPPING ASSESSMENT:
   - Does this document provide evidence for the compliance requirement?
   - What type of evidence mapping is this? (direct, partial, supporting, cross_reference)
   - Confidence level (0.0 to 1.0) that this document addresses the requirement

2. QUALITY SCORING:
   - Overall quality score (0.0 to 1.0) based on:
     * Completeness: How complete is the evidence?
     * Clarity: How clear and well-documented?
     * Relevance: How relevant to the specific requirement?
     * Specificity: How specific vs. generic?

3. EVIDENCE EXTRACTION:
   - Extract specific text snippets that serve as evidence
   - Identify relevant sections or clauses
   - Note any gaps or missing information

4. ANALYSIS & RECOMMENDATIONS:
   - Summarize the document's value for this requirement
   - Identify what's missing or could be improved
   - Provide recommendations for strengthening evidence

Respond in JSON format:
{
  "mappingConfidence": number,
  "qualityScore": number,
  "mappingType": "direct|partial|supporting|cross_reference",
  "evidenceSnippets": ["snippet1", "snippet2"],
  "aiAnalysis": {
    "summary": "Brief summary of document relevance",
    "relevantSections": ["section1", "section2"],
    "gaps": ["gap1", "gap2"],
    "recommendations": ["rec1", "rec2"],
    "qualityFactors": {
      "completeness": number,
      "clarity": number,
      "relevance": number,
      "specificity": number
    }
  }
}
`;

    try {
      const response = await anthropic.messages.create({
        model: DEFAULT_MODEL_STR,
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }],
      });

      const result = JSON.parse((response.content[0] as any).text);
      return result;
    } catch (error) {
      console.error('Error analyzing document:', error);
      // Return default result if AI analysis fails
      return {
        evidenceSnippets: [],
        mappingConfidence: 0.0,
        qualityScore: 0.0,
        mappingType: 'supporting',
        aiAnalysis: {
          summary: 'Analysis failed - manual review required',
          relevantSections: [],
          gaps: ['AI analysis unavailable'],
          recommendations: ['Manual review required'],
          qualityFactors: {
            completeness: 0.0,
            clarity: 0.0,
            relevance: 0.0,
            specificity: 0.0
          }
        }
      };
    }
  }

  /**
   * Identify compliance gaps based on evidence mappings
   */
  async identifyComplianceGaps(
    userId: string,
    frameworkId?: string
  ): Promise<EvidenceGap[]> {
    const requirements = await storage.getComplianceRequirements(frameworkId);
    const gaps: EvidenceGap[] = [];

    for (const requirement of requirements) {
      const mappings = await storage.getEvidenceMappings({
        userId,
        requirementId: requirement.id
      });

      const gapAnalysis = await this.analyzeRequirementGaps(requirement, mappings);
      
      if (gapAnalysis) {
        const gap = await storage.createEvidenceGap({
          userId,
          requirementId: requirement.id,
          gapType: gapAnalysis.gapType,
          severity: gapAnalysis.severity,
          description: gapAnalysis.description,
          recommendedActions: gapAnalysis.recommendedActions,
          estimatedEffort: gapAnalysis.estimatedEffort,
          status: 'open'
        });
        gaps.push(gap);
      }
    }

    return gaps;
  }

  /**
   * Analyze gaps for a specific requirement
   */
  private async analyzeRequirementGaps(
    requirement: ComplianceRequirement,
    mappings: EvidenceMapping[]
  ): Promise<GapAnalysisResult | null> {
    if (mappings.length === 0) {
      return {
        gapType: 'missing_evidence',
        severity: requirement.priority === 'critical' ? 'critical' : 'high',
        description: `No evidence found for requirement: ${requirement.title}`,
        recommendedActions: [
          'Create or upload relevant documentation',
          'Implement required controls',
          'Document existing procedures'
        ],
        estimatedEffort: requirement.priority === 'critical' ? 'high' : 'medium'
      };
    }

    // Calculate average quality and confidence
    const avgQuality = mappings.reduce((sum, m) => sum + parseFloat(m.qualityScore), 0) / mappings.length;
    const avgConfidence = mappings.reduce((sum, m) => sum + parseFloat(m.mappingConfidence), 0) / mappings.length;

    if (avgQuality < 0.6 || avgConfidence < 0.6) {
      return {
        gapType: avgQuality < 0.4 ? 'poor_quality' : 'insufficient_evidence',
        severity: requirement.priority === 'critical' ? 'high' : 'medium',
        description: `Evidence quality or relevance below acceptable threshold for: ${requirement.title}`,
        recommendedActions: [
          'Improve documentation quality',
          'Add more specific evidence',
          'Clarify procedures and controls'
        ],
        estimatedEffort: 'medium'
      };
    }

    return null; // No significant gaps found
  }

  /**
   * Get cross-framework mappings for a requirement
   */
  async getCrossFrameworkMappings(requirementId: string) {
    return await storage.getCrossFrameworkMappings(requirementId);
  }

  /**
   * Create automated cross-framework mappings using AI
   */
  async createCrossFrameworkMappings(
    primaryRequirementId: string
  ): Promise<void> {
    const primaryRequirement = await storage.getComplianceRequirements();
    const primary = primaryRequirement.find(r => r.id === primaryRequirementId);
    
    if (!primary) return;

    // Get all requirements from other frameworks
    const allRequirements = await storage.getComplianceRequirements();
    const otherRequirements = allRequirements.filter(
      r => r.frameworkId !== primary.frameworkId
    );

    for (const otherReq of otherRequirements) {
      const similarity = await this.calculateRequirementSimilarity(primary, otherReq);
      
      if (similarity.confidence > 0.7) { // High confidence threshold
        await storage.createCrossFrameworkMapping({
          primaryRequirementId: primary.id,
          relatedRequirementId: otherReq.id,
          mappingType: similarity.mappingType,
          confidence: similarity.confidence.toString(),
          description: similarity.description
        });
      }
    }
  }

  /**
   * Calculate similarity between two compliance requirements
   */
  private async calculateRequirementSimilarity(
    req1: ComplianceRequirement,
    req2: ComplianceRequirement
  ): Promise<{
    confidence: number;
    mappingType: 'equivalent' | 'similar' | 'related' | 'supporting';
    description: string;
  }> {
    const prompt = `
Compare these two compliance requirements and determine their relationship:

REQUIREMENT 1:
Framework: ${req1.frameworkId}
ID: ${req1.requirementId}
Title: ${req1.title}
Description: ${req1.description}
Category: ${req1.category}

REQUIREMENT 2:
Framework: ${req2.frameworkId}
ID: ${req2.requirementId}
Title: ${req2.title}
Description: ${req2.description}
Category: ${req2.category}

Analyze the similarity and relationship between these requirements:

1. Are they addressing the same control objective?
2. Do they have similar implementation requirements?
3. What level of overlap exists?

Respond in JSON format:
{
  "confidence": number (0.0 to 1.0),
  "mappingType": "equivalent|similar|related|supporting",
  "description": "Brief explanation of the relationship"
}

Mapping types:
- equivalent: Essentially the same requirement
- similar: Very similar with minor differences
- related: Related but with notable differences
- supporting: One supports the other but not directly equivalent
`;

    try {
      const response = await anthropic.messages.create({
        model: DEFAULT_MODEL_STR,
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }],
      });

      return JSON.parse((response.content[0] as any).text);
    } catch (error) {
      console.error('Error calculating similarity:', error);
      return {
        confidence: 0.0,
        mappingType: 'related',
        description: 'Analysis failed'
      };
    }
  }

  /**
   * Mock function to get document content - replace with actual implementation
   */
  private getDocumentContent(document: Document): string {
    // In a real implementation, this would extract text from the actual document file
    // For now, return a mock based on document type and name
    return `Mock content for ${document.fileName} (${document.fileType}).\n\nThis document contains policies and procedures related to information security management. It outlines access control procedures, data protection measures, incident response protocols, and regular security training requirements for all employees.`;
  }
}

export const evidenceMappingService = new EvidenceMappingService();