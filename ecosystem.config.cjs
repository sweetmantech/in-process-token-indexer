module.exports = {
  apps: [
    {
      name: 'in-process-token-indexer',
      script: 'npm',
      args: 'run start',
      exec_mode: 'fork',
      node_args: '--max-old-space-size=512',
      max_memory_restart: '300M',
      cwd: '/root/in-process-token-indexer',
    },
  ],
};
