import { storage } from './storage';
import { calculateDynamicRiskScore } from './anthropic';
import { insertRiskScoreHistorySchema, insertNotificationSchema } from '@shared/schema';

interface ScheduledJob {
  interval: number; // in milliseconds
  lastRun: Date | null;
  job: () => Promise<void>;
}

class BackgroundScheduler {
  private jobs: Map<string, ScheduledJob> = new Map();
  private isRunning = false;

  constructor() {
    // Schedule daily risk recalculation for aging tasks
    this.addJob('daily-aging-risk-check', {
      interval: 24 * 60 * 60 * 1000, // 24 hours
      lastRun: null,
      job: this.checkAgingTasksAndRecalculateRisk.bind(this)
    });

    // More frequent check for severely overdue tasks
    this.addJob('hourly-overdue-check', {
      interval: 60 * 60 * 1000, // 1 hour  
      lastRun: null,
      job: this.checkSeverelyOverdueTasks.bind(this)
    });
  }

  addJob(id: string, job: ScheduledJob) {
    this.jobs.set(id, job);
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    
    console.log('🔄 Background scheduler started');
    this.scheduleNext();
  }

  stop() {
    this.isRunning = false;
    console.log('⏹️ Background scheduler stopped');
  }

  private scheduleNext() {
    if (!this.isRunning) return;

    setTimeout(async () => {
      await this.runDueJobs();
      this.scheduleNext();
    }, 60000); // Check every minute
  }

  private async runDueJobs() {
    const now = new Date();
    
    for (const [jobId, job] of Array.from(this.jobs.entries())) {
      try {
        const shouldRun = !job.lastRun || 
          (now.getTime() - job.lastRun.getTime()) >= job.interval;
        
        if (shouldRun) {
          console.log(`🔧 Running background job: ${jobId}`);
          await job.job();
          job.lastRun = now;
          console.log(`✅ Completed background job: ${jobId}`);
        }
      } catch (error) {
        console.error(`❌ Error in background job ${jobId}:`, error);
      }
    }
  }

  // Check for aging tasks and recalculate risk scores
  private async checkAgingTasksAndRecalculateRisk() {
    try {
      console.log('🔍 Checking for aging tasks and recalculating risk scores...');
      
      // Get all users with tasks
      const allUsers = await storage.getAllUsers();
      const now = new Date();
      let processedUsers = 0;
      
      for (const user of allUsers) {
        try {
          const userTasks = await storage.getTasksByUserId(user.id);
          
          // Check if user has overdue tasks
          const overdueTasks = userTasks.filter(task => 
            task.dueDate && 
            new Date(task.dueDate) < now && 
            task.status !== 'completed'
          );

          if (overdueTasks.length > 0) {
            console.log(`📊 User ${user.email} has ${overdueTasks.length} overdue tasks, recalculating risk...`);
            
            // Get user risks for calculation context
            const userRisks = await storage.getRisksByUserId(user.id);
            
            // Calculate metrics
            const totalTasks = userTasks.length;
            const completedTasks = userTasks.filter(task => task.status === 'completed').length;
            const highRisks = userRisks.filter(risk => risk.impact === 'high' && risk.status === 'open').length;
            const mediumRisks = userRisks.filter(risk => risk.impact === 'medium' && risk.status === 'open').length;
            const lowRisks = userRisks.filter(risk => risk.impact === 'low' && risk.status === 'open').length;
            const mitigatedRisks = userRisks.filter(risk => risk.status === 'mitigated').length;

            // Calculate aging factor for overdue tasks
            const agingDays = Math.max(...overdueTasks.map(task => {
              const dueDate = new Date(task.dueDate!);
              return Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
            }));

            const recentChanges = [
              `${overdueTasks.length} tasks are overdue`,
              `Maximum overdue period: ${agingDays} days`,
              'Daily aging risk assessment'
            ];

            // Recalculate risk score with aging context
            const scoreData = await calculateDynamicRiskScore(user.id, undefined, {
              totalTasks,
              completedTasks,
              highRisks,
              mediumRisks,
              lowRisks,
              mitigatedRisks,
              recentChanges
            });

            // Save to history
            const historyData = insertRiskScoreHistorySchema.parse({
              userId: user.id,
              frameworkId: undefined,
              overallRiskScore: scoreData.overallRiskScore.toString(),
              totalTasks,
              completedTasks,
              highRisks,
              mediumRisks,
              lowRisks,
              mitigatedRisks,
              calculationFactors: scoreData.factors,
              triggeredBy: 'daily_aging_check'
            });

            await storage.createRiskScoreHistory(historyData);

            // Create notification for significantly elevated risk (75%+)
            if (scoreData.overallRiskScore >= 75) {
              const notification = insertNotificationSchema.parse({
                userId: user.id,
                type: 'risk_alert',
                title: 'Risk Score Alert: Aging Tasks Impact',
                message: `Your risk score has reached ${scoreData.overallRiskScore.toFixed(1)}/100 due to ${overdueTasks.length} overdue tasks aging over time.`,
                severity: scoreData.overallRiskScore >= 85 ? 'critical' : 'high',
                metadata: {
                  riskScore: scoreData.overallRiskScore,
                  overdueCount: overdueTasks.length,
                  maxAgingDays: agingDays,
                  triggeredBy: 'daily_aging_check'
                }
              });
              
              await storage.createNotification(notification);
            }

            processedUsers++;
          }
        } catch (userError) {
          console.error(`Error processing user ${user.id}:`, userError);
        }
      }

      console.log(`✅ Daily aging check complete. Processed ${processedUsers} users with overdue tasks.`);
    } catch (error) {
      console.error('Error in daily aging task check:', error);
    }
  }

  // Check for severely overdue tasks requiring immediate attention
  private async checkSeverelyOverdueTasks() {
    try {
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      // Get all users
      const allUsers = await storage.getAllUsers();
      
      for (const user of allUsers) {
        try {
          const userTasks = await storage.getTasksByUserId(user.id);
          
          // Find tasks overdue by more than 7 days
          const severelyOverdue = userTasks.filter(task => 
            task.dueDate && 
            new Date(task.dueDate) < sevenDaysAgo && 
            task.status !== 'completed' &&
            (task.priority === 'high' || task.priority === 'critical')
          );

          if (severelyOverdue.length > 0) {
            const notification = insertNotificationSchema.parse({
              userId: user.id,
              type: 'task_alert',
              title: 'Critical: Severely Overdue Tasks',
              message: `${severelyOverdue.length} high-priority tasks are now overdue by more than 7 days and require immediate attention.`,
              severity: 'critical',
              metadata: {
                overdueCount: severelyOverdue.length,
                taskIds: severelyOverdue.map(t => t.id),
                daysOverdue: 7
              }
            });
            
            await storage.createNotification(notification);
          }
        } catch (userError) {
          console.error(`Error checking severely overdue tasks for user ${user.id}:`, userError);
        }
      }
    } catch (error) {
      console.error('Error checking severely overdue tasks:', error);
    }
  }
}

// Create and export singleton instance
export const backgroundScheduler = new BackgroundScheduler();

// Auto-start scheduler when module is imported
if (process.env.NODE_ENV !== 'test') {
  backgroundScheduler.start();
}