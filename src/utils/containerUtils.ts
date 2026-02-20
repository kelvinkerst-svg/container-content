const CONTAINER_ID_REGEX = /^C-[0-9A-Z]{4}$/;

export function validateContainerId(id: string): boolean {
  return CONTAINER_ID_REGEX.test(id);
}

export function normalizeContainerId(id: string): string {
  return id.toUpperCase().trim();
}

export function generateContainerId(): string {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let id = '';
  for (let i = 0; i < 4; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `C-${id}`;
}

export function getContainerIdError(id: string): string | null {
  if (!id) {
    return 'Container ID is required';
  }

  const normalized = normalizeContainerId(id);

  if (!normalized.startsWith('C-')) {
    return 'Container ID must start with "C-"';
  }

  if (normalized.length !== 6) {
    return 'Container ID must be exactly 6 characters (C-XXXX)';
  }

  if (!validateContainerId(normalized)) {
    return 'Container ID must follow format C-XXXX (4 characters: 0-9 and A-Z only)';
  }

  return null;
}
