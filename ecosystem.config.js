module.exports = {
  apps: [
    {
      name: 'coinpulse',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3115',
      cwd: '/var/www/coinpulse',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3115,
      },
      error_file: '/var/www/coinpulse/logs/err.log',
      out_file: '/var/www/coinpulse/logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
    },
  ],
};
