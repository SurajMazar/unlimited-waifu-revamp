export function checkClipboardSupport(): boolean {
  return 'clipboard' in navigator && 'read' in navigator.clipboard;
}

export async function readImageFromClipboard(): Promise<Blob | null> {
  try {
    const items = await navigator.clipboard.read();
    for (const item of items) {
      const mime = item.types.find((type) => type.startsWith('image/'));
      if (mime) {
        return await item.getType(mime);
      }
    }
  } catch (e) {
    console.warn(e);
  }
  return null;
}

export function uuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
