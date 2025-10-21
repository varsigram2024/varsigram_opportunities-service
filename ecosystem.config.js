module.exports = {
  apps: [
    {
      name: 'opp-staging',
      script: './src/index.ts', // or your entry point
      cwd: '/var/www/opportunity-service/staging/',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'development',
        PORT: 3001
      },
      error_file: '/var/www/opportunity-service/staging/logs/error.log',
      out_file: '/var/www/opportunity-service/staging/logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      max_memory_restart: '500M',
      autorestart: true,
      watch: false
    },
    {
      name: 'opp-prod',
      script: './src/index.ts', // or your entry point
      cwd: '/var/www/opportunity-service/prod/',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3002
      },
      error_file: '/var/www/opportunity-service/prod/logs/error.log',
      out_file: '/var/www/opportunity-service/prod/logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      max_memory_restart: '1G',
      autorestart: true,
      watch: false
    }
  ]
};