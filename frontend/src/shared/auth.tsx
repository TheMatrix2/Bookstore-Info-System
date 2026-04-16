export function parseRole(token: string): string {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role ?? '';
  } catch {
    return '';
  }
}

export function parseID(token: string): string {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.user_id ?? '';
  } catch {
    return '';
  }
}