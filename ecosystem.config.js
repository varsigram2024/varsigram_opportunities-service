// PM2 Configuration for Production Deployment
// Run with: pm2 start ecosystem.config.js

module.exports = {
  apps: [
    {
      name: 'opportunities-api',
      script: './dist/index.js',
      instances: 'max', // Use all available CPU cores
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '1G',
      
      // Graceful shutdown
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
      
      // Auto-restart on file changes (optional, remove in production)
      // watch: false,
      
      // Health check
      max_restarts: 10,
      min_uptime: '10s',
      
      // Environment-specific settings
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      env_staging: {
        NODE_ENV: 'staging',
        PORT: 3000
      }
    }
  ]
};
