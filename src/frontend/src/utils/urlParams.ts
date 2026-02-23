export function getHashParam(key: string): string | null {
  if (typeof window === 'undefined') return null;
  
  const hash = window.location.hash.substring(1);
  const params = new URLSearchParams(hash);
  return params.get(key);
}

export function setHashParam(key: string, value: string): void {
  if (typeof window === 'undefined') return;
  
  const hash = window.location.hash.substring(1);
  const params = new URLSearchParams(hash);
  params.set(key, value);
  window.location.hash = params.toString();
}

export function removeHashParam(key: string): void {
  if (typeof window === 'undefined') return;
  
  const hash = window.location.hash.substring(1);
  const params = new URLSearchParams(hash);
  params.delete(key);
  window.location.hash = params.toString();
}

export function getInvitationTokenFromURL(): string | null {
  return getHashParam('invite');
}

export function clearInvitationTokenFromURL(): void {
  removeHashParam('invite');
}

export function getSecretParameter(key: string): string | null {
  return getHashParam(key);
}
