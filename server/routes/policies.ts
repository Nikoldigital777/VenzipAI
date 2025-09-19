import { Router } from "express";
import { isAuthenticated } from "../replitAuth";
import { policyGenerator } from "../services/policyGenerator";
import { storage } from "../storage";

const router = Router();

// Get available policy templates
router.get("/templates", isAuthenticated, async (req: any, res) => {
  try {
    const { framework } = req.query;

    if (framework) {
      const templates = await policyGenerator.getTemplatesForFramework(framework);
      res.json(templates);
    } else {
      const allTemplates = await storage.getAllPolicyTemplates();
      res.json(allTemplates);
    }
  } catch (error) {
    console.error("Error fetching templates:", error);
    res.status(500).json({ error: "Failed to fetch templates" });
  }
});

// Generate a policy from template
router.post("/generate", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.sub;
    const { templateId, customVariables } = req.body;

    // Get user's company
    const company = await storage.getCompanyByUserId(userId);
    if (!company) {
      return res.status(400).json({ error: "Company profile required" });
    }

    const generatedPolicy = await policyGenerator.generatePolicy(
      templateId,
      userId,
      company.id,
      customVariables
    );

    res.json(generatedPolicy);
  } catch (error) {
    console.error('Error generating policy:', error);
    res.status(500).json({ 
      error: 'Failed to generate policy',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get generated policies for user's company
router.get("/generated", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.sub;

    const company = await storage.getCompanyByUserId(userId);
    if (!company) {
      return res.status(400).json({ error: "Company profile required" });
    }

    const policies = await policyGenerator.getCompanyPolicies(company.id);
    res.json(policies);
  } catch (error) {
    console.error("Error fetching policies:", error);
    res.status(500).json({ error: "Failed to fetch policies" });
  }
});

// Get specific generated policy
router.get("/generated/:id", isAuthenticated, async (req: any, res) => {
  try {
    const { id } = req.params;
    const policy = await storage.getGeneratedPolicyById(id);

    if (!policy) {
      return res.status(404).json({ error: "Policy not found" });
    }

    res.json(policy);
  } catch (error) {
    console.error("Error fetching policy:", error);
    res.status(500).json({ error: "Failed to fetch policy" });
  }
});

// Update policy status (approve, etc.)
router.put("/generated/:id/status", isAuthenticated, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.sub;

    const updateData: any = { status };

    if (status === 'approved') {
      updateData.approvedBy = userId;
      updateData.approvedAt = new Date();
    }

    const updatedPolicy = await storage.updateGeneratedPolicy(id, updateData);
    res.json(updatedPolicy);
  } catch (error) {
    console.error("Error updating policy status:", error);
    res.status(500).json({ error: "Failed to update policy status" });
  }
});

export default router;