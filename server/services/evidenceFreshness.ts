
import { storage } from '../storage';
import { db } from '../db';
import { documents } from '@shared/schema';
import { eq, lt, isNull, or } from 'drizzle-orm';

export class EvidenceFreshnessService {
  
  /**
   * Check and update expired evidence
   */
  async checkEvidenceFreshness(): Promise<void> {
    const now = new Date();
    
    // Find documents that have expired
    const expiredDocs = await db.select()
      .from(documents)
      .where(
        or(
          lt(documents.validUntil, now),
          isNull(documents.validUntil) // Handle legacy documents without freshness data
        )
      );

    for (const doc of expiredDocs) {
      // Calculate expiration date if not set
      let validUntil = doc.validUntil;
      if (!validUntil && doc.freshnessMonths) {
        const uploadDate = new Date(doc.uploadedAt);
        validUntil = new Date(uploadDate.setMonth(uploadDate.getMonth() + doc.freshnessMonths));
      }

      const isExpired = validUntil ? validUntil < now : false;

      // Update document status
      await storage.updateDocument(doc.id, {
        isExpired,
        validUntil: validUntil?.toISOString(),
        lastFreshnessCheck: now
      });

      // Create notification for expired evidence
      if (isExpired && doc.status === 'verified') {
        await storage.createNotification({
          userId: doc.userId,
          type: 'document_expired',
          title: 'Evidence Document Expired',
          message: `Document "${doc.fileName}" has expired and needs to be updated to maintain compliance.`,
          severity: 'high',
          metadata: {
            documentId: doc.id,
            fileName: doc.fileName,
            expiredAt: validUntil?.toISOString()
          }
        });
      }
    }
  }

  /**
   * Get freshness status for user's evidence
   */
  async getEvidenceFreshnessStatus(userId: string) {
    const userDocs = await storage.getDocumentsByUserId(userId);
    const now = new Date();
    
    const statusCounts = {
      fresh: 0,
      expiringSoon: 0, // Expires within 30 days
      expired: 0
    };

    const expiringDocs = [];
    const expiredDocs = [];

    for (const doc of userDocs) {
      if (doc.status !== 'verified') continue;

      let validUntil = doc.validUntil ? new Date(doc.validUntil) : null;
      
      // Calculate expiration if not set
      if (!validUntil && doc.freshnessMonths) {
        const uploadDate = new Date(doc.uploadedAt);
        validUntil = new Date(uploadDate.setMonth(uploadDate.getMonth() + doc.freshnessMonths));
      }

      if (!validUntil) {
        statusCounts.fresh++; // No expiration set
        continue;
      }

      const daysUntilExpiry = Math.ceil((validUntil.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (daysUntilExpiry < 0) {
        statusCounts.expired++;
        expiredDocs.push({ ...doc, daysOverdue: Math.abs(daysUntilExpiry) });
      } else if (daysUntilExpiry <= 30) {
        statusCounts.expiringSoon++;
        expiringDocs.push({ ...doc, daysUntilExpiry });
      } else {
        statusCounts.fresh++;
      }
    }

    return {
      statusCounts,
      expiringDocs: expiringDocs.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry),
      expiredDocs: expiredDocs.sort((a, b) => b.daysOverdue - a.daysOverdue),
      totalDocuments: userDocs.filter(d => d.status === 'verified').length
    };
  }
}

export const evidenceFreshnessService = new EvidenceFreshnessService();
