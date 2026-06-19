import { AxiosError } from 'axios';

export function formatError(error: unknown): string {
  if (error instanceof AxiosError) {
    const status = error.response?.status;
    const data = error.response?.data;
    const message = data?.message || data?.error || error.message;

    switch (status) {
      case 401:
        return 'Session expired. Please run auth_login again.';
      case 403:
        if (typeof message === 'string' && message.toLowerCase().includes('limit')) {
          return message;
        }
        return `Permission denied. ${message || 'Check your role and workspace access.'}`;
      case 404:
        return 'Not found. Check the ID and try again.';
      case 409:
        return `Conflict: ${message}`;
      case 422:
        if (data?.errors && Array.isArray(data.errors)) {
          return `Validation failed: ${data.errors.map((e: any) => e.message || e).join(', ')}`;
        }
        return `Validation failed: ${message}`;
      default:
        if (status && status >= 500) {
          // Surface the backend's error detail when it provides one — masking
          // every 5xx as a generic string makes real bugs undiagnosable. Falls
          // back to the generic message only when there's no useful detail.
          const detail = data?.message || data?.error;
          return typeof detail === 'string' && detail
            ? `Server error (${status}): ${detail}`
            : 'Server error. Try again in a moment.';
        }
        if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
          return `Cannot reach the API. Check your connection and API URL.`;
        }
        return message || 'An unexpected error occurred.';
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred.';
}

export function toolResponse(text: string) {
  return { content: [{ type: 'text' as const, text }] };
}

export function toolJson(data: any, prefix?: string) {
  const text = prefix
    ? `${prefix}\n\n${JSON.stringify(data, null, 2)}`
    : JSON.stringify(data, null, 2);
  return { content: [{ type: 'text' as const, text }] };
}
