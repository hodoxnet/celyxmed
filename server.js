const { spawn } = require('child_process');
const path = require('path');

// Next.js production server başlat
const nextServer = spawn('npm', ['start'], {
  cwd: __dirname,
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'production',
    PORT: process.env.PORT || 3000
  }
});

nextServer.on('close', (code) => {
  console.log(`Next.js server exited with code ${code}`);
  process.exit(code);
});

nextServer.on('error', (err) => {
  console.error('Failed to start Next.js server:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  nextServer.kill('SIGTERM');
});

process.on('SIGINT', () => {
  nextServer.kill('SIGINT');
});