export async function sendInquiry(input: Record<string, unknown>) {
  const response = await fetch('/api/inquiry', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  const result = await response.json().catch(() => null);
  if (!response.ok || result?.sent !== true) {
    throw new Error(result?.error || 'Your request could not be sent. Please try again shortly.');
  }
}
