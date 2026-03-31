module.exports = {
  apps : [{
    name   : "randevu-system",
    script : "./server/server.js",
    cwd: "./",
    env: {
      NODE_ENV: "production",
      PORT: 5000,
    },
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    log_date_format: "YYYY-MM-DD HH:mm Z",
    error_file: "logs/err.log",
    out_file: "logs/out.log",
    merge_logs: true
  }]
}
