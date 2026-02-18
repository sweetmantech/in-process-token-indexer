module.exports = {
  apps: [
    {
      name: 'in-process-token-indexer',
      script: 'node',
      args: '--no-warnings --max-old-space-size=512 ./dist/indexer.js',
      exec_mode: 'fork',
      kill_timeout: 10000,
      max_memory_restart: '300M',
      cwd: '/root/in-process-token-indexer',
    },
  ],
};
