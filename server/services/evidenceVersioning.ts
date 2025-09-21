
import { db } from '../db';
import { 
  documents 
} from '@shared/schema';
import { eq, desc, and, lt, lte, isNull, or, sql } from 'drizzle-orm';
import { createHash } from 'crypto';
import { storage } from '../storage';

export interface EvidenceVersion {
  id: string;
  documentId: string;
  versionNumber: number;
  previousVersionId?: string;
  changeType: 'create' | 'update' | 'replace' | 'supersede';
  changeReason?: string;
  changedBy: string;
  changeTimestamp: Date;
  filePath: string;
  fileHash: string;
  fileSize: number;
  metadataChanges?: any;
  isCurrent: boolean;
  retentionUntil?: Date;
  legalHold: boolean;
}

export interface ProvenanceEvent {
  id: string;
  documentId: string;
  eventType: 'created' | 'uploaded' | 'analyzed' | 'verified' | 'superseded' | 'expired' | 'accessed' | 'modified';
  eventTimestamp: Date;
  actorId: string;
  actorType: 'user' | 'system' | 'ai';
  eventData: any;
  sourceSystem?: string;
  chainHash: string;
  previousChainHash?: string;
}

export class EvidenceVersioningService {
  
  /**
   * Record provenance event in chain
   */
  async recordProvenanceEvent(
    documentId: string,
    eventType: ProvenanceEvent['eventType'],
    actorId: string,
    actorType: ProvenanceEvent['actorType'],
    eventData: any,
    sourceSystem?: string
  ): Promise<ProvenanceEvent> {
    try {
      // Calculate chain hash
      const chainData = {
        documentId,
        eventType,
        eventTimestamp: new Date(),
        actorId,
        actorType,
        eventData,
        previousChainHash: null
      };
      
      const chainHash = createHash('sha256')
        .update(JSON.stringify(chainData))
        .digest('hex');
      
      // For now, return a mock event until tables are created
      const event: ProvenanceEvent = {
        id: `prov_${Date.now()}`,
        documentId,
        eventType,
        eventTimestamp: new Date(),
        actorId,
        actorType,
        eventData,
        sourceSystem,
        chainHash,
        previousChainHash: null
      };
      
      console.log(`📋 Provenance recorded: ${eventType} for document ${documentId}`);
      return event;
      
    } catch (error) {
      console.error('Failed to record provenance event:', error);
      throw error;
    }
  }
  
  /**
   * Get freshness dashboard data
   */
  async getFreshnessDashboard(userId: string): Promise<{
    summary: {
      fresh: number;
      warning: number;
      expired: number;
      overdue: number;
    };
    expiringNext30Days: any[];
    expiredDocuments: any[];
  }> {
    // For now, use existing freshness data from documents table
    const userDocs = await storage.getDocumentsByUserId(userId);
    const now = new Date();
    
    const summary = {
      fresh: 0,
      warning: 0,
      expired: 0,
      overdue: 0
    };
    
    const expiringNext30Days: any[] = [];
    const expiredDocuments: any[] = [];
    
    userDocs.forEach(doc => {
      if (doc.status !== 'verified') return;
      
      let validUntil = doc.validUntil ? new Date(doc.validUntil) : null;
      
      if (!validUntil && doc.freshnessMonths) {
        const uploadDate = new Date(doc.uploadedAt);
        validUntil = new Date(uploadDate.setMonth(uploadDate.getMonth() + doc.freshnessMonths));
      }
      
      if (!validUntil) {
        summary.fresh++;
        return;
      }
      
      const daysUntilExpiry = Math.ceil((validUntil.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilExpiry < 0) {
        const daysOverdue = Math.abs(daysUntilExpiry);
        if (daysOverdue > 30) {
          summary.overdue++;
        } else {
          summary.expired++;
        }
        expiredDocuments.push({ ...doc, daysOverdue });
      } else if (daysUntilExpiry <= 30) {
        summary.warning++;
        expiringNext30Days.push({ ...doc, daysUntilExpiry });
      } else {
        summary.fresh++;
      }
    });
    
    return {
      summary,
      expiringNext30Days: expiringNext30Days.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry),
      expiredDocuments: expiredDocuments.sort((a, b) => b.daysOverdue - a.daysOverdue)
    };
  }
}

export const evidenceVersioningService = new EvidenceVersioningService();
