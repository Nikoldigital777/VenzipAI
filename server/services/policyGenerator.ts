
import Anthropic from '@anthropic-ai/sdk';
import { storage } from '../storage';
import type { Company, PolicyTemplate, GeneratedPolicy } from '@shared/schema';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export class PolicyGenerator {
  
  /**
   * Generate a policy from template with company data
   */
  async generatePolicy(
    templateId: string,
    userId: string,
    companyId: string,
    customVariables?: Record<string, any>
  ): Promise<GeneratedPolicy> {
    
    // Get template
    const template = await storage.getPolicyTemplate(templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    // Get company information
    const company = await storage.getCompanyById(companyId);
    if (!company) {
      throw new Error('Company not found');
    }

    // Prepare template variables
    const variables = await this.prepareTemplateVariables(company, customVariables);
    
    // Generate policy content
    const content = await this.populateTemplate(template.templateContent, variables);
    
    // Enhance with AI if needed
    const enhancedContent = await this.enhanceWithAI(content, template, company);
    
    // Save generated policy
    const generatedPolicy = await storage.createGeneratedPolicy({
      companyId,
      templateId,
      userId,
      title: template.title,
      policyType: template.templateType,
      category: template.category,
      content: enhancedContent,
      variables: variables,
      status: 'draft',
      version: '1.0'
    });

    return generatedPolicy;
  }

  /**
   * Prepare template variables from company data
   */
  private async prepareTemplateVariables(
    company: Company, 
    customVariables?: Record<string, any>
  ): Promise<Record<string, any>> {
    
    const currentDate = new Date();
    const reviewDate = new Date();
    reviewDate.setFullYear(currentDate.getFullYear() + 1);

    const variables = {
      // Company information
      companyName: company.name || 'Your Organization',
      legalEntity: company.legalEntity || company.name,
      industry: company.industry || 'Technology',
      region: company.region || 'United States',
      companySize: company.size || 'Medium',
      
      // Contact information
      contactName: company.contactName || 'Chief Executive Officer',
      contactEmail: company.contactEmail || 'admin@company.com',
      contactRole: company.contactRole || 'CEO',
      
      // Default officers (can be overridden)
      ceoName: company.contactName || 'Chief Executive Officer',
      securityOfficer: customVariables?.securityOfficer || 'Information Security Officer',
      privacyOfficer: customVariables?.privacyOfficer || 'Privacy Officer',
      privacyOfficerTitle: customVariables?.privacyOfficerTitle || 'Privacy Officer',
      privacyOfficerEmail: customVariables?.privacyOfficerEmail || company.contactEmail || 'privacy@company.com',
      privacyOfficerPhone: customVariables?.privacyOfficerPhone || '(555) 123-4567',
      
      // Dates
      createdDate: currentDate.toLocaleDateString(),
      effectiveDate: currentDate.toLocaleDateString(),
      reviewDate: reviewDate.toLocaleDateString(),
      nextReviewDate: reviewDate.toLocaleDateString(),
      
      // Versioning
      version: '1.0',
      
      // Merge any custom variables
      ...customVariables
    };

    return variables;
  }

  /**
   * Populate template with variables
   */
  private async populateTemplate(
    templateContent: string, 
    variables: Record<string, any>
  ): Promise<string> {
    
    let content = templateContent;
    
    // Simple template variable replacement
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      content = content.replace(regex, String(value));
    }
    
    return content;
  }

  /**
   * Enhance policy content with AI
   */
  private async enhanceWithAI(
    content: string,
    template: PolicyTemplate,
    company: Company
  ): Promise<string> {
    
    if (!process.env.ANTHROPIC_API_KEY) {
      return content; // Return as-is if no AI available
    }

    try {
      const prompt = `
You are a compliance expert helping to enhance a ${template.templateType} document for ${company.name}, a ${company.industry} company in the ${company.region} region.

The document should be:
- Professional and legally appropriate
- Specific to ${company.industry} industry requirements
- Compliant with ${company.region} regulations
- Appropriate for a ${company.size} company size

Current document:
${content}

Please enhance this document by:
1. Adding industry-specific considerations for ${company.industry}
2. Ensuring regional compliance for ${company.region}
3. Adjusting complexity for ${company.size} organization
4. Maintaining professional legal language
5. Keeping all existing structure and sections

Return only the enhanced document content, no additional commentary.
`;

      const response = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 4000,
        messages: [{ role: 'user', content: prompt }],
      });

      return (response.content[0] as any).text;
      
    } catch (error) {
      console.error('AI enhancement failed:', error);
      return content; // Return original if AI fails
    }
  }

  /**
   * Get available templates for a framework
   */
  async getTemplatesForFramework(frameworkId: string): Promise<PolicyTemplate[]> {
    return await storage.getPolicyTemplates(frameworkId);
  }

  /**
   * Get generated policies for a company
   */
  async getCompanyPolicies(companyId: string): Promise<GeneratedPolicy[]> {
    return await storage.getGeneratedPolicies(companyId);
  }
}

export const policyGenerator = new PolicyGenerator();
