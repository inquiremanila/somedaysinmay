export class InquiryError extends Error {
  constructor(message: string, public code: string) { super(message); this.name = 'InquiryError'; }
}

export async function sendInquiry(input: Record<string, unknown>) {
  let response: Response;
  try {
    response = await fetch('/api/inquiry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
  } catch {
    throw new InquiryError('Unable to connect. Please check your connection and try again.', 'NETWORK_ERROR');
  }
  const result = await response.json().catch(() => null);
  if (!response.ok || result?.sent !== true) {
    if (!result && (response.status === 404 || response.ok)) {
      throw new InquiryError('The request form is temporarily unavailable. Please contact the studio by email.', 'ENDPOINT_MISSING');
    }
    throw new InquiryError(result?.error || 'Your request could not be sent. Please try again shortly.', result?.code || `HTTP_${response.status}`);
  }
}
