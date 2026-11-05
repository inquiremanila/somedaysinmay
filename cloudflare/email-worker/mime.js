function base64(text) {
  return btoa(Array.from(new TextEncoder().encode(text), byte => String.fromCharCode(byte)).join(''));
}
export function emailMime(payload) {
  const email = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;
  if (![payload.from, payload.to?.[0], payload.reply_to].every(value => typeof value === 'string' && email.test(value))) throw new Error('Invalid email headers.');
  return [
    `From: Somedays in May <${payload.from}>`,
    `To: ${payload.to[0]}`,
    `Reply-To: ${payload.reply_to}`,
    `Subject: =?UTF-8?B?${base64(payload.subject)}?=`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    base64(payload.text).match(/.{1,76}/g)?.join('\r\n') || '',
    '',
  ].join('\r\n');
}
