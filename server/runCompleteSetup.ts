
import { runMigrations } from './runMigrations';
import { seedBasicRequirements } from './seedBasicRequirements';
import { seedPolicyTemplates } from './seedPolicyTemplates';
import { evidenceBackgroundService } from './services/evidenceBackgroundService';
import { logger } from './logger';

export async function runCompleteSetup() {
  const log = logger.child({ service: 'Setup' });
  
  try {
    log.info('🚀 Starting complete VenzipAI setup...');
    
    // 1. Run database migrations
    log.info('📄 Running database migrations...');
    await runMigrations();
    
    // 2. Seed basic compliance requirements
    log.info('🌱 Seeding compliance requirements...');
    await seedBasicRequirements();
    
    // 3. Seed policy templates
    log.info('📝 Seeding policy templates...');
    await seedPolicyTemplates();
    
    // 4. Start background services
    log.info('⚙️ Starting background services...');
    evidenceBackgroundService.start();
    
    log.info('✅ Complete setup finished successfully');
    
    return {
      success: true,
      message: 'VenzipAI setup completed successfully with evidence lifecycle and audit package generation'
    };
    
  } catch (error) {
    log.error({ error }, '❌ Setup failed');
    throw error;
  }
}
