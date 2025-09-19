
import express from "express";
import { db } from "../db";
import { frameworks, tasks, complianceRequirements, companies, frameworkProgress } from "@shared/schema";
import { eq, inArray } from "drizzle-orm";

const router = express.Router();

router.post("/complete", async (req, res) => {
  try {
    const { company, frameworks: selectedFrameworks, aiEnabled } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // 1. Create/update company profile
    const [companyRecord] = await db.insert(companies).values({
      ...company,
      userId,
      selectedFrameworks,
      onboardingCompleted: true
    }).onConflictDoUpdate({
      target: companies.userId,
      set: {
        ...company,
        selectedFrameworks,
        onboardingCompleted: true,
        updatedAt: new Date()
      }
    }).returning();

    // 2. Generate tasks from compliance requirements
    const requirements = await db.select()
      .from(complianceRequirements)
      .where(inArray(complianceRequirements.frameworkId, selectedFrameworks));

    const tasksToCreate = requirements.map(req => ({
      title: req.title,
      description: req.description,
      category: req.category,
      priority: req.priority,
      frameworkId: req.frameworkId,
      userId,
      companyId: companyRecord.id,
      complianceRequirement: req.requirementId,
      evidenceRequired: true,
      status: "not_started" as const
    }));

    const createdTasks = await db.insert(tasks).values(tasksToCreate).returning();

    // 3. Initialize framework progress
    const frameworkRecords = await db.select()
      .from(frameworks)
      .where(inArray(frameworks.id, selectedFrameworks));

    const progressRecords = frameworkRecords.map(fw => ({
      userId,
      frameworkId: fw.id,
      totalControls: fw.totalControls,
      completedControls: 0,
      progressPercentage: "0.00"
    }));

    await db.insert(frameworkProgress).values(progressRecords).onConflictDoNothing();

    res.json({
      success: true,
      totalTasks: createdTasks.length,
      company: companyRecord
    });

  } catch (error) {
    console.error("Onboarding completion error:", error);
    res.status(500).json({ error: "Failed to complete onboarding" });
  }
});

router.post("/preview-tasks", async (req, res) => {
  try {
    const { frameworks: selectedFrameworks } = req.body;
    
    const sampleTasks = await db.select()
      .from(complianceRequirements)
      .where(inArray(complianceRequirements.frameworkId, selectedFrameworks))
      .limit(6);

    res.json({ tasks: sampleTasks });
  } catch (error) {
    console.error("Failed to fetch preview tasks:", error);
    res.status(500).json({ error: "Failed to fetch preview tasks" });
  }
});

export default router;
