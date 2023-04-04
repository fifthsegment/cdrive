module.exports = {
    apps: [
      {
        name: 'Cdrive',
        script: './bin/app.js', // Or the path to your main server file
        instances: 1,
        autorestart: true,
        watch: false,
        max_memory_restart: '0.5G',
        env: {
          NODE_ENV: 'development',
        },
        env_production: {
          NODE_ENV: 'production',
        },
      },
    ],
  };
  