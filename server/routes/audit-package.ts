
import { Router } from "express";
import { isAuthenticated } from "../replitAuth";
import { storage } from "../storage";
import { ReportGenerator } from "../reportGenerator";
import { evidenceVersioningService } from "../services/evidenceVersioning";
import archiver from 'archiver';
import { Response } from 'express';

const router = Router();

// Generate complete audit package
router.post("/generate", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.sub;
    const { frameworkIds, includeEvidence = true, includeReports = true } = req.body;

    // Set response headers for zip download
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="audit-package.zip"');

    // Create zip archive
    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.pipe(res);

    // Add audit package manifest
    const manifest = await generateAuditManifest(userId, frameworkIds);
    archive.append(JSON.stringify(manifest, null, 2), { name: 'audit-manifest.json' });

    if (includeReports) {
      // Generate and add compliance reports
      for (const frameworkId of frameworkIds || ['all']) {
        const reportData = await prepareReportData(userId, frameworkId);
        const reportGenerator = new ReportGenerator();
        
        const complianceReport = await reportGenerator.generateReport({
          type: 'compliance_summary',
          data: reportData,
          generatedBy: userId
        });
        
        const gapReport = await reportGenerator.generateReport({
          type: 'gap_analysis', 
          data: reportData,
          generatedBy: userId
        });

        archive.append(complianceReport, { name: `reports/${frameworkId}-compliance-summary.pdf` });
        archive.append(gapReport, { name: `reports/${frameworkId}-gap-analysis.pdf` });
      }
    }

    if (includeEvidence) {
      // Add evidence documents with provenance
      const documents = await storage.getDocumentsByUserId(userId);
      const mappings = await storage.getEvidenceMappings({ userId });

      for (const doc of documents) {
        if (doc.status === 'verified') {
          // Add document with metadata and provenance
          const docMetadata = {
            fileName: doc.fileName,
            uploadedAt: doc.uploadedAt,
            sha256Hash: doc.sha256Hash,
            verifiedAt: doc.verifiedAt,
            validUntil: doc.validUntil,
            freshnessStatus: doc.isExpired ? 'expired' : 'current',
            mappings: mappings.filter(m => m.documentId === doc.id),
            provenance: {
              created: doc.uploadedAt,
              verified: doc.verifiedAt,
              lastFreshnessCheck: doc.lastFreshnessCheck
            }
          };
          
          archive.append(JSON.stringify(docMetadata, null, 2), { 
            name: `evidence/metadata/${doc.id}.json` 
          });
          
          // Include actual file if it exists
          try {
            const fs = require('fs');
            if (fs.existsSync(doc.filePath)) {
              archive.file(doc.filePath, { name: `evidence/documents/${doc.fileName}` });
            }
          } catch (error) {
            console.log(`Could not include file: ${doc.fileName}`);
          }
        }
      }
    }

    await archive.finalize();

  } catch (error) {
    console.error('Error generating audit package:', error);
    res.status(500).json({ error: 'Failed to generate audit package' });
  }
});

async function generateAuditManifest(userId: string, frameworkIds: string[]) {
  const [company, frameworks, tasks, risks, documents] = await Promise.all([
    storage.getCompanyByUserId(userId),
    storage.getAllFrameworks(),
    storage.getTasksByUserId(userId),
    storage.getRisksByUserId(userId),
    storage.getDocumentsByUserId(userId)
  ]);

  return {
    generatedAt: new Date().toISOString(),
    auditPackageVersion: '1.0',
    company: {
      name: company?.name,
      industry: company?.industry,
      size: company?.size
    },
    frameworks: frameworkIds.map(id => frameworks.find(f => f.id === id)),
    summary: {
      totalTasks: tasks.length,
      completedTasks: tasks.filter(t => t.status === 'completed').length,
      totalRisks: risks.length,
      highRisks: risks.filter(r => r.impact === 'high').length,
      evidenceDocuments: documents.filter(d => d.status === 'verified').length
    },
    compliance: {
      overallCompletionPercentage: Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100),
      lastUpdated: new Date().toISOString()
    }
  };
}

async function prepareReportData(userId: string, frameworkId: string) {
  const [company, frameworks, tasks, risks, documents] = await Promise.all([
    storage.getCompanyByUserId(userId),
    storage.getAllFrameworks(),
    storage.getTasksByUserId(userId),
    storage.getRisksByUserId(userId),
    storage.getDocumentsByUserId(userId)
  ]);

  return {
    company,
    frameworks,
    tasks: frameworkId === 'all' ? tasks : tasks.filter(t => t.frameworkId === frameworkId),
    risks: frameworkId === 'all' ? risks : risks.filter(r => r.frameworkId === frameworkId),
    documents,
    gapAnalysis: null, // This would be populated by your gap analysis logic
    velocityData: null // This would be populated by your velocity calculation
  };
}

export default router;
