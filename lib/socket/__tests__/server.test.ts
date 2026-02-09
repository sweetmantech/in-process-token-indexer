import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockOn = vi.fn();
const mockClose = vi.fn();

vi.mock('socket.io', () => ({
  Server: vi.fn(function (this: any) {
    this.on = mockOn;
    this.close = mockClose;
  }),
}));

let startSocketServer: typeof import('@/lib/socket/server').startSocketServer;
let getIO: typeof import('@/lib/socket/server').getIO;

describe('socket/server', () => {
  beforeEach(async () => {
    vi.resetModules();
    mockOn.mockReset();
    mockClose.mockReset();
    const mod = await import('@/lib/socket/server');
    startSocketServer = mod.startSocketServer;
    getIO = mod.getIO;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('creates a Server on default port 3000', async () => {
    const { Server } = await import('socket.io');
    delete process.env.SOCKET_PORT;

    startSocketServer();

    expect(Server).toHaveBeenCalledWith(3000, { cors: { origin: '*' } });
  });

  it('uses SOCKET_PORT env when set', async () => {
    const { Server } = await import('socket.io');
    process.env.SOCKET_PORT = '4000';

    startSocketServer();

    expect(Server).toHaveBeenCalledWith(4000, { cors: { origin: '*' } });
    delete process.env.SOCKET_PORT;
  });

  it('registers a connection listener', () => {
    startSocketServer();

    expect(mockOn).toHaveBeenCalledWith('connection', expect.any(Function));
  });

  it('returns the Server instance', () => {
    const server = startSocketServer();

    expect(server).toBeDefined();
    expect(server.on).toBe(mockOn);
  });

  it('is idempotent — returns the same instance on second call', () => {
    const first = startSocketServer();
    const second = startSocketServer();

    expect(first).toBe(second);
  });

  it('getIO returns null before startSocketServer is called', () => {
    expect(getIO()).toBeNull();
  });

  it('getIO returns the Server instance after start', () => {
    const server = startSocketServer();

    expect(getIO()).toBe(server);
  });
});
