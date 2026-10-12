import net from 'net';

function isPortOpen(port: number, host = '127.0.0.1'): Promise<boolean> {
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

export async function ensureDatabase(): Promise<any> {
  const dbUrl = process.env.DATABASE_URL || '';
  if (dbUrl && !dbUrl.includes('localhost') && !dbUrl.includes('127.0.0.1')) {
    return null;
  }

  const open = await isPortOpen(5432);
  if (open) {
    return null;
  }

  console.log('🔄 Port 5432 not responding. Starting embedded PostgreSQL...');
  try {
    // @ts-ignore
    const EmbeddedPostgresModule = await import('embedded-postgres');
    const EmbeddedPostgres = EmbeddedPostgresModule.default || EmbeddedPostgresModule;

    const pg = new (EmbeddedPostgres as any)({
      databaseDir: './.pgdata',
      port: 5432,
      user: 'postgres',
      password: 'password',
      initialDatabase: 'proofbase',
    });

    try {
      await pg.initialise();
    } catch {
      // already initialized
    }

    await pg.start();
    console.log('✓ Embedded PostgreSQL started on port 5432');
    return pg;
  } catch (err) {
    console.warn('⚠️ Could not start embedded PostgreSQL:', err);
    return null;
  }
}
