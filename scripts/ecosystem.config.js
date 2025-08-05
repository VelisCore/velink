// PM2 Ecosystem Configuration for Velink
// Optimized for Ubuntu/Linux production deployment

module.exports = {
  apps: [
    {
      name: 'velink',
      script: './server/index.js',
      cwd: '/opt/velink',
      
      // Instance management
      instances: 'max', // Use all CPU cores
      exec_mode: 'cluster',
      
      // Environment configuration
      env: {
        NODE_ENV: 'development',
        PORT: 80,
        LOG_LEVEL: 'debug'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 80,
        LOG_LEVEL: 'info',
        MAX_MEMORY_RESTART: '512M'
      },
      
      // Process management
      max_memory_restart: '512M',
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 5000,
      
      // Auto restart settings
      watch: false, // Disable in production
      ignore_watch: [
        'node_modules',
        'logs',
        'backups',
        '.git',
        '*.log'
      ],
      
      // Logging
      log_file: './server/logs/combined.log',
      out_file: './server/logs/out.log',
      error_file: './server/logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      
      // Health monitoring
      health_check_grace_period: 30000,
      health_check_fatal_exceptions: true,
      
      // Advanced settings
      kill_timeout: 5000,
      listen_timeout: 10000,
      shutdown_with_message: true,
      
      // Node.js specific
      node_args: '--max-old-space-size=512 --optimize-for-size',
      
      // Source map support
      source_map_support: false,
      
      // Ubuntu-specific optimizations
      vizion: false, // Disable git metadata
      autorestart: true,
      
      // Cron restart (optional - restart daily at 3 AM)
      cron_restart: '0 3 * * *'
    }
  ],
  
  // Deployment configuration
  deploy: {
    production: {
      user: 'velink',
      host: ['your-ubuntu-server.com'],
      ref: 'origin/main',
      repo: 'https://github.com/Velyzo/velink.git',
      path: '/opt/velink',
      'post-deploy': 'npm install && chmod +x update.sh && ./update.sh --skip-backup --force --auto-start && pm2 reload ecosystem.config.js --env production',
      'pre-setup': 'sudo apt update && sudo apt install -y git nodejs npm',
      'post-setup': 'sudo chown -R velink:velink /opt/velink'
    },
    staging: {
      user: 'velink',
      host: ['staging-server.com'],
      ref: 'origin/develop',
      repo: 'https://github.com/Velyzo/velink.git',
      path: '/opt/velink-staging',
      'post-deploy': 'npm install && chmod +x update.sh && ./update.sh --skip-backup --force --auto-start && pm2 reload ecosystem.config.js --env staging'
    }
  }
};
