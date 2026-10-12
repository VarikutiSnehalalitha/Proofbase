import EmbeddedPostgres from 'embedded-postgres';
import net from 'net';

function isPortOpen(port, host = '127.0.0.1') {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(1000);
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.on('error', () => {
      resolve(false);
    });
    socket.connect(port, host);
  });
}

export async function ensureDatabase() {
  const open = await isPortOpen(5432);
  if (open) {
    console.log('✓ PostgreSQL is already running on port 5432');
    return null;
  }

  console.log('Starting embedded PostgreSQL on port 5432...');
  const pg = new EmbeddedPostgres({
    databaseDir: './.pgdata',
    port: 5432,
    user: 'postgres',
    password: 'password',
    initialDatabase: 'proofbase'
  });

  try {
    await pg.initialise();
  } catch (e) {
    // Already initialised
  }

  await pg.start();
  console.log('✓ Embedded PostgreSQL started successfully on port 5432');
  return pg;
}

// If executed directly
if (process.argv[1]?.endsWith('start-db.mjs')) {
  ensureDatabase().then((pg) => {
    if (pg) {
      console.log('PostgreSQL server is running. Press Ctrl+C to stop.');
      process.on('SIGINT', async () => {
        console.log('Stopping PostgreSQL...');
        await pg.stop();
        process.exit(0);
      });
      process.on('SIGTERM', async () => {
        await pg.stop();
        process.exit(0);
      });
    }
  }).catch(err => {
    console.error('Failed to start PostgreSQL:', err);
    process.exit(1);
  });
}
