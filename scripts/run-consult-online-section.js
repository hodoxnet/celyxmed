const { execSync } = require('child_process');

// ts-node veya npx ts-node kullarak scripti çalıştır
try {
  console.log('Running create-consult-online-section.ts script...');
  execSync('npx ts-node scripts/create-consult-online-section.ts', { stdio: 'inherit' });
  console.log('Script completed successfully.');
} catch (error) {
  console.error('Error running script:', error);
  process.exit(1);
}