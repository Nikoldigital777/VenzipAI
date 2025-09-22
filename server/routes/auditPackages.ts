import { Router } from "express";
import { auditPackageGenerator } from "../services/auditPackageGenerator";
import { insertAuditPackageSchema } from "@shared/schema";
import { isAuthenticated } from "../replitAuth";
import { createReadStream, existsSync } from "fs";
import { join } from "path";
import { z } from "zod";

const router = Router();

// Validation schemas
const generateAuditPackageSchema = z.object({
  title: z.string().min(1, "Title is required"),
  frameworkIds: z.array(z.string()).min(1, "At least one framework is required"),
  include: z.object({
    evidence: z.boolean().default(true),
    policies: z.boolean().default(true),
  }).optional(),
});

// Generate a new audit package
router.post("/generate", isAuthenticated, async (req: any, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Validate request body
    const validation = generateAuditPackageSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        error: "Invalid request data", 
        details: validation.error.issues 
      });
    }

    const { title, frameworkIds, include } = validation.data;

    // Get user's company (optional for audit packages)
    const userCompany = await import("../storage").then(({ storage }) => 
      storage.getCompanyByUserId(user.sub)
    );

    // Generate audit package
    const auditPackage = await auditPackageGenerator.generateAuditPackage({
      userId: user.sub,
      companyId: userCompany?.id,
      title,
      frameworkIds,
      include,
    });

    res.status(201).json({
      id: auditPackage.id,
      title: auditPackage.title,
      status: auditPackage.status,
      docCount: auditPackage.docCount,
      sizeBytes: auditPackage.sizeBytes,
      createdAt: auditPackage.createdAt,
    });

  } catch (error) {
    console.error("Error generating audit package:", error);
    res.status(500).json({ 
      error: "Failed to generate audit package", 
      message: error instanceof Error ? error.message : "Unknown error" 
    });
  }
});

// List user's audit packages
router.get("/", isAuthenticated, async (req: any, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const packages = await auditPackageGenerator.getAuditPackagesByUserId(user.sub);

    // Transform for response
    const response = packages.map(pkg => ({
      id: pkg.id,
      title: pkg.title,
      frameworkIds: pkg.frameworkIds,
      status: pkg.status,
      docCount: pkg.docCount,
      sizeBytes: pkg.sizeBytes,
      createdAt: pkg.createdAt,
    }));

    res.json(response);

  } catch (error) {
    console.error("Error fetching audit packages:", error);
    res.status(500).json({ 
      error: "Failed to fetch audit packages",
      message: error instanceof Error ? error.message : "Unknown error" 
    });
  }
});

// Get audit package details
router.get("/:id", isAuthenticated, async (req: any, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { id } = req.params;
    const details = await auditPackageGenerator.getAuditPackageDetails(id);

    if (!details) {
      return res.status(404).json({ error: "Audit package not found" });
    }

    // Security check: ensure user owns this package
    if (details.package.userId !== user.sub) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.json({
      package: {
        id: details.package.id,
        title: details.package.title,
        frameworkIds: details.package.frameworkIds,
        status: details.package.status,
        docCount: details.package.docCount,
        sizeBytes: details.package.sizeBytes,
        createdAt: details.package.createdAt,
      },
      items: details.items.map(item => ({
        id: item.id,
        documentId: item.documentId,
        fileName: item.fileName,
        sizeBytes: item.sizeBytes,
        includedAs: item.includedAs,
        addedAt: item.addedAt,
      })),
    });

  } catch (error) {
    console.error("Error fetching audit package details:", error);
    res.status(500).json({ 
      error: "Failed to fetch package details",
      message: error instanceof Error ? error.message : "Unknown error" 
    });
  }
});

// Download audit package ZIP file
router.get("/:id/download", isAuthenticated, async (req: any, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { id } = req.params;
    const auditPackage = await auditPackageGenerator.getAuditPackageById(id);

    if (!auditPackage) {
      return res.status(404).json({ error: "Audit package not found" });
    }

    // Security check: ensure user owns this package
    if (auditPackage.userId !== user.sub) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Check if package is sealed and has a ZIP file
    if (auditPackage.status !== "sealed" || !auditPackage.zipPath) {
      return res.status(400).json({ 
        error: "Package not ready for download",
        status: auditPackage.status 
      });
    }

    // Check if ZIP file exists
    if (!existsSync(auditPackage.zipPath)) {
      return res.status(404).json({ error: "Package file not found" });
    }

    // Set download headers
    const fileName = `${auditPackage.title.replace(/[^a-zA-Z0-9]/g, '_')}_audit_package.zip`;
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', 'application/zip');

    // Stream the file
    const fileStream = createReadStream(auditPackage.zipPath);
    fileStream.pipe(res);

    fileStream.on('error', (error) => {
      console.error("Error streaming file:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Failed to download package" });
      }
    });

  } catch (error) {
    console.error("Error downloading audit package:", error);
    if (!res.headersSent) {
      res.status(500).json({ 
        error: "Failed to download package",
        message: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  }
});

// Archive audit package (soft delete)
router.delete("/:id", isAuthenticated, async (req: any, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { id } = req.params;
    const auditPackage = await auditPackageGenerator.getAuditPackageById(id);

    if (!auditPackage) {
      return res.status(404).json({ error: "Audit package not found" });
    }

    // Security check: ensure user owns this package
    if (auditPackage.userId !== user.sub) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Update status to archived (soft delete)
    const { storage } = await import("../storage");
    const updatedPackage = await storage.updateAuditPackage(id, {
      status: "archived",
    });

    res.json({
      message: "Audit package archived successfully",
      id: updatedPackage.id,
      status: updatedPackage.status,
    });

  } catch (error) {
    console.error("Error archiving audit package:", error);
    res.status(500).json({ 
      error: "Failed to archive package",
      message: error instanceof Error ? error.message : "Unknown error" 
    });
  }
});

export default router;