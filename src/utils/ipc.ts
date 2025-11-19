export function extractSubclass(ipc: string): string | null {
  ipc = ipc.trim();
  const match = ipc.match(/^([A-H][0-9]{2}[A-Z])/);
  return match ? match[1] : null;
}
