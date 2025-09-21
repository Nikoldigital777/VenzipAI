
import { evidenceVersioningService } from './evidenceVersioning';
import { storage } from '../storage';
import { logger } from '../logger';
import { db } from '../db';
import { documents, notifications } from '@shared/schema';
import { eq, lt, and, or, gt } from 'drizzle-orm';

export class EvidenceBackgroundService {
  private intervalId: NodeJS.Timeout | null = null;
  private readonly CHECK_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours
  private readonly log = logger.child({ service: 'EvidenceBackgroundService' });

  /**
   * Start the background service
   */
  start(): void {
    if (this.intervalId) {
      this.log.warn('Background service already running');
      return;
    }

    this.log.info('Starting evidence freshness background service');
    
    // Run immediately on start
    this.runFreshnessCheck();
    
    // Schedule regular checks
    this.intervalId = setInterval(() => {
      this.runFreshnessCheck();
    }, this.CHECK_INTERVAL);
  }

  /**
   * Stop the background service
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      this.log.info('Evidence freshness background service stopped');
    }
  }

  /**
   * Run freshness check for all evidence
   */
  private async runFreshnessCheck(): Promise<void> {
    this.log.info('Running evidence freshness check');
    
    try {
      await evidenceVersioningService.checkEvidenceFreshness();
      await this.sendFreshnessNotifications();
      await this.cleanupOldNotifications();
      
      this.log.info('Evidence freshness check completed successfully');
    } catch (error) {
      this.log.error({ error }, 'Evidence freshness check failed');
    }
  }

  /**
   * Send notifications for evidence requiring attention
   */
  private async sendFreshnessNotifications(): Promise<void> {
    const now = new Date();
    
    // Get all verified documents
    const allDocuments = await db.select()
      .from(documents)
      .where(eq(documents.status, 'verified'));

    const upcomingExpirations = [];
    const overdueDocuments = [];

    // Process documents to find expiring/overdue ones
    for (const doc of allDocuments) {
      let validUntil = doc.validUntil ? new Date(doc.validUntil) : null;
      
      if (!validUntil && doc.freshnessMonths) {
        const uploadDate = new Date(doc.uploadedAt);
        validUntil = new Date(uploadDate.setMonth(uploadDate.getMonth() + doc.freshnessMonths));
      }
      
      if (validUntil) {
        const daysUntilExpiry = Math.ceil((validUntil.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilExpiry < 0) {
          overdueDocuments.push({ document: doc, status: { validUntil } });
        } else if (daysUntilExpiry <= 7) {
          upcomingExpirations.push({ document: doc, status: { validUntil } });
        }
      }
    }

    // Send notifications for upcoming expirations
    for (const { status, document } of upcomingExpirations) {
      const daysUntilExpiry = Math.ceil(
        (new Date(status.validUntil).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      await this.createNotificationIfNotExists(
        document.userId,
        'evidence_expiring',
        `Evidence Expiring Soon: ${document.fileName}`,
        `Your evidence document "${document.fileName}" will expire in ${daysUntilExpiry} day(s). Please update or renew this evidence to maintain compliance.`,
        'medium',
        {
          documentId: document.id,
          fileName: document.fileName,
          daysUntilExpiry,
          validUntil: status.validUntil
        }
      );
    }

    // Send notifications for overdue documents
    for (const { status, document } of overdueDocuments) {
      const daysOverdue = Math.ceil(
        (now.getTime() - new Date(status.validUntil).getTime()) / (1000 * 60 * 60 * 24)
      );

      await this.createNotificationIfNotExists(
        document.userId,
        'evidence_overdue',
        `Evidence Overdue: ${document.fileName}`,
        `Your evidence document "${document.fileName}" is ${daysOverdue} day(s) overdue. This may impact your compliance status. Please update this evidence immediately.`,
        'high',
        {
          documentId: document.id,
          fileName: document.fileName,
          daysOverdue,
          validUntil: status.validUntil
        }
      );
    }
  }

  /**
   * Create notification if it doesn't already exist
   */
  private async createNotificationIfNotExists(
    userId: string,
    type: string,
    title: string,
    message: string,
    severity: string,
    metadata: any
  ): Promise<void> {
    try {
      // Check if similar notification exists in the last 24 hours
      const existingNotification = await db.select()
        .from(notifications)
        .where(and(
          eq(notifications.userId, userId),
          eq(notifications.type, type),
          gt(notifications.createdAt, new Date(Date.now() - 24 * 60 * 60 * 1000))
        ))
        .limit(1);

      if (existingNotification.length === 0) {
        await storage.createNotification({
          userId,
          type,
          title,
          message,
          severity,
          metadata
        });
      }
    } catch (error) {
      this.log.error({ error, userId, type }, 'Failed to create notification');
    }
  }

  /**
   * Clean up old notifications
   */
  private async cleanupOldNotifications(): Promise<void> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    try {
      await db.delete(notifications)
        .where(and(
          lt(notifications.createdAt, thirtyDaysAgo),
          eq(notifications.read, true)
        ));
    } catch (error) {
      this.log.error({ error }, 'Failed to cleanup old notifications');
    }
  }

  /**
   * Get service status
   */
  getStatus(): {
    isRunning: boolean;
    nextCheckTime?: Date;
  } {
    return {
      isRunning: this.intervalId !== null,
      nextCheckTime: this.intervalId ? new Date(Date.now() + this.CHECK_INTERVAL) : undefined
    };
  }
}

export const evidenceBackgroundService = new EvidenceBackgroundService();
