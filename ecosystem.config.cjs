module.exports = {
  apps: [
    {
      name: 'in-process-token-indexer',
      script: 'dist/indexer.js',
      exec_mode: 'fork',
      node_args: '--max-old-space-size=256',
      max_memory_restart: '300M',
      cwd: '/root/in-process-token-indexer',
    },
  ],
};
