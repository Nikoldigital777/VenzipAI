import { storage } from "../storage";
import { createHash } from "crypto";
import { createWriteStream, createReadStream, statSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import archiver from "archiver";
import type { 
  InsertAuditPackage, 
  InsertAuditPackageItem,
  AuditPackage,
  Document,
  EvidenceMapping,
  GeneratedPolicy 
} from "@shared/schema";

export interface GenerateAuditPackageRequest {
  userId: string;
  companyId?: string;
  title: string;
  frameworkIds: string[];
  include?: {
    evidence?: boolean;
    policies?: boolean;
  };
}

export interface AuditPackageManifest {
  packageInfo: {
    id: string;
    title: string;
    frameworkIds: string[];
    generatedAt: string;
    generatedBy: string;
    companyId?: string;
    docCount: number;
    totalSizeBytes: number;
  };
  frameworks: {
    id: string;
    name: string;
    documentCount: number;
  }[];
  documents: {
    id: string;
    fileName: string;
    filePath: string;
    sha256: string;
    sizeBytes: number;
    includedAs: "evidence" | "policy" | "other";
    frameworkId?: string;
    requirementId?: string;
    uploadedAt: string;
  }[];
  integrity: {
    manifestHash: string;
    totalDocuments: number;
    totalSizeBytes: number;
  };
}

export class AuditPackageGenerator {
  private readonly uploadsDir = "./uploads";
  private readonly packagesDir = "./uploads/audit-packages";

  constructor() {
    // Ensure directories exist
    mkdirSync(this.packagesDir, { recursive: true });
  }

  async generateAuditPackage(request: GenerateAuditPackageRequest): Promise<AuditPackage> {
    const { userId, companyId, title, frameworkIds, include = { evidence: true, policies: true } } = request;

    // Create package record
    const packageData: InsertAuditPackage = {
      userId,
      companyId,
      title,
      frameworkIds,
      status: "generating",
    };

    const auditPackage = await storage.createAuditPackage(packageData);

    try {
      // Collect documents
      const collectedDocs = await this.collectDocuments(userId, frameworkIds, include);
      
      // Create manifest
      const manifest = await this.createManifest(auditPackage, collectedDocs, frameworkIds);
      
      // Create ZIP package
      const { zipPath, manifestPath } = await this.createZipPackage(auditPackage.id, manifest, collectedDocs);
      
      // Add items to database
      const packageItems: InsertAuditPackageItem[] = collectedDocs.map(doc => ({
        packageId: auditPackage.id,
        documentId: doc.id,
        requirementId: doc.requirementId || null,
        fileName: doc.fileName,
        filePath: doc.filePathInBundle,
        sha256: doc.sha256,
        sizeBytes: doc.sizeBytes,
        includedAs: doc.includedAs,
      }));

      await storage.addAuditPackageItems(packageItems);

      // Update package with final details
      const updatedPackage = await storage.updateAuditPackage(auditPackage.id, {
        status: "sealed",
        docCount: collectedDocs.length,
        sizeBytes: collectedDocs.reduce((total, doc) => total + doc.sizeBytes, 0),
        zipPath,
        manifestPath,
      });

      return updatedPackage;

    } catch (error) {
      // Mark package as failed
      await storage.updateAuditPackage(auditPackage.id, {
        status: "archived", // Use archived for failed packages in MVP
      });
      throw error;
    }
  }

  private async collectDocuments(
    userId: string, 
    frameworkIds: string[], 
    include: { evidence?: boolean; policies?: boolean }
  ): Promise<CollectedDocument[]> {
    const collectedDocs: CollectedDocument[] = [];

    // Collect evidence documents if requested
    if (include.evidence) {
      const evidenceDocs = await this.collectEvidenceDocuments(userId, frameworkIds);
      collectedDocs.push(...evidenceDocs);
    }

    // Collect policy documents if requested
    if (include.policies) {
      const policyDocs = await this.collectPolicyDocuments(userId, frameworkIds);
      collectedDocs.push(...policyDocs);
    }

    // Remove duplicates based on document ID
    const uniqueDocs = this.removeDuplicateDocuments(collectedDocs);

    return uniqueDocs;
  }

  private async collectEvidenceDocuments(userId: string, frameworkIds: string[]): Promise<CollectedDocument[]> {
    const collectedDocs: CollectedDocument[] = [];

    // Get all evidence mappings for the user and frameworks
    for (const frameworkId of frameworkIds) {
      const mappings = await storage.getEvidenceMappings({
        userId,
        // Note: We'd need to add frameworkId filter to the storage method in a real implementation
      });

      // Get documents with their frameworks
      const documentsWithMappings = await storage.getDocumentsWithMappingsByUserId(userId);
      
      // Filter by framework and collect documents
      const frameworkDocs = documentsWithMappings.filter(doc => 
        doc.frameworkId === frameworkId && doc.status === 'verified'
      );

      for (const doc of frameworkDocs) {
        try {
          const fileStats = statSync(doc.filePath);
          const fileHash = await this.calculateFileHash(doc.filePath);
          
          collectedDocs.push({
            id: doc.id,
            fileName: doc.fileName,
            originalPath: doc.filePath,
            filePathInBundle: `evidence/${frameworkId}/${doc.fileName}`,
            sha256: fileHash,
            sizeBytes: fileStats.size,
            includedAs: "evidence",
            frameworkId,
            requirementId: doc.requirementId,
            uploadedAt: doc.uploadedAt,
          });
        } catch (error) {
          console.warn(`Failed to process document ${doc.fileName}:`, error);
          // Continue with other documents
        }
      }
    }

    return collectedDocs;
  }

  private async collectPolicyDocuments(userId: string, frameworkIds: string[]): Promise<CollectedDocument[]> {
    const collectedDocs: CollectedDocument[] = [];

    // Get generated policies for the user's company
    const userCompany = await storage.getCompanyByUserId(userId);
    if (!userCompany) return collectedDocs;

    const policies = await storage.getGeneratedPolicies(userCompany.id);

    for (const policy of policies) {
      // In MVP, we'll create a temporary file path for the policy content
      // In production, you'd want to save policy as actual files
      const fileName = `${policy.policyType}_${policy.title.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
      const tempPath = join(this.packagesDir, "temp", fileName);
      
      // Ensure temp directory exists
      mkdirSync(dirname(tempPath), { recursive: true });
      
      // Write policy content to temp file
      const fs = await import("fs/promises");
      await fs.writeFile(tempPath, policy.content, "utf8");
      
      try {
        const fileStats = statSync(tempPath);
        const fileHash = await this.calculateFileHash(tempPath);
        
        collectedDocs.push({
          id: policy.id,
          fileName,
          originalPath: tempPath,
          filePathInBundle: `policies/${fileName}`,
          sha256: fileHash,
          sizeBytes: fileStats.size,
          includedAs: "policy",
          uploadedAt: policy.createdAt?.toISOString() || new Date().toISOString(),
        });
      } catch (error) {
        console.warn(`Failed to process policy ${policy.title}:`, error);
      }
    }

    return collectedDocs;
  }

  private removeDuplicateDocuments(docs: CollectedDocument[]): CollectedDocument[] {
    const uniqueMap = new Map<string, CollectedDocument>();
    
    for (const doc of docs) {
      if (!uniqueMap.has(doc.id)) {
        uniqueMap.set(doc.id, doc);
      }
    }
    
    return Array.from(uniqueMap.values());
  }

  private async createManifest(
    auditPackage: AuditPackage, 
    documents: CollectedDocument[], 
    frameworkIds: string[]
  ): Promise<AuditPackageManifest> {
    // Get framework information
    const frameworks = await storage.getFrameworksByIds(frameworkIds);
    
    const manifest: AuditPackageManifest = {
      packageInfo: {
        id: auditPackage.id,
        title: auditPackage.title,
        frameworkIds: auditPackage.frameworkIds,
        generatedAt: new Date().toISOString(),
        generatedBy: auditPackage.userId,
        companyId: auditPackage.companyId || undefined,
        docCount: documents.length,
        totalSizeBytes: documents.reduce((total, doc) => total + doc.sizeBytes, 0),
      },
      frameworks: frameworks.map(framework => ({
        id: framework.id,
        name: framework.name,
        documentCount: documents.filter(doc => doc.frameworkId === framework.id).length,
      })),
      documents: documents.map(doc => ({
        id: doc.id,
        fileName: doc.fileName,
        filePath: doc.filePathInBundle,
        sha256: doc.sha256,
        sizeBytes: doc.sizeBytes,
        includedAs: doc.includedAs,
        frameworkId: doc.frameworkId,
        requirementId: doc.requirementId || undefined,
        uploadedAt: doc.uploadedAt,
      })),
      integrity: {
        manifestHash: "", // Will be calculated after manifest is created
        totalDocuments: documents.length,
        totalSizeBytes: documents.reduce((total, doc) => total + doc.sizeBytes, 0),
      },
    };

    // Calculate manifest hash
    const manifestJson = JSON.stringify(manifest, null, 2);
    manifest.integrity.manifestHash = createHash("sha256").update(manifestJson).digest("hex");

    return manifest;
  }

  private async createZipPackage(
    packageId: string, 
    manifest: AuditPackageManifest, 
    documents: CollectedDocument[]
  ): Promise<{ zipPath: string; manifestPath: string }> {
    const zipPath = join(this.packagesDir, `${packageId}.zip`);
    const manifestPath = join(this.packagesDir, `${packageId}_manifest.json`);

    // Save manifest to file
    const fs = await import("fs/promises");
    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));

    // Create ZIP archive
    const output = createWriteStream(zipPath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    return new Promise((resolve, reject) => {
      output.on("close", () => {
        resolve({ zipPath, manifestPath });
      });

      archive.on("error", (err) => {
        reject(err);
      });

      archive.pipe(output);

      // Add manifest to ZIP
      archive.file(manifestPath, { name: "manifest.json" });

      // Add all documents to ZIP
      for (const doc of documents) {
        try {
          archive.file(doc.originalPath, { name: doc.filePathInBundle });
        } catch (error) {
          console.warn(`Failed to add ${doc.fileName} to ZIP:`, error);
        }
      }

      archive.finalize();
    });
  }

  private async calculateFileHash(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const hash = createHash("sha256");
      const stream = createReadStream(filePath);
      
      stream.on("data", (data) => hash.update(data));
      stream.on("end", () => resolve(hash.digest("hex")));
      stream.on("error", reject);
    });
  }

  async getAuditPackagesByUserId(userId: string): Promise<AuditPackage[]> {
    return storage.getAuditPackagesByUserId(userId);
  }

  async getAuditPackageById(id: string): Promise<AuditPackage | null> {
    return storage.getAuditPackageById(id);
  }

  async getAuditPackageDetails(id: string) {
    const auditPackage = await storage.getAuditPackageById(id);
    if (!auditPackage) return null;

    const items = await storage.getAuditPackageItems(id);
    
    return {
      package: auditPackage,
      items,
    };
  }
}

interface CollectedDocument {
  id: string;
  fileName: string;
  originalPath: string;
  filePathInBundle: string;
  sha256: string;
  sizeBytes: number;
  includedAs: "evidence" | "policy" | "other";
  frameworkId?: string;
  requirementId?: string | null;
  uploadedAt: string;
}

export const auditPackageGenerator = new AuditPackageGenerator();