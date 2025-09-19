
import { seedPolicyTemplates } from './seedPolicyTemplates';

async function main() {
  try {
    console.log('🌱 Running policy templates seed...');
    await seedPolicyTemplates();
    console.log('✅ Policy templates seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Policy templates seeding failed:', error);
    process.exit(1);
  }
}

main();
