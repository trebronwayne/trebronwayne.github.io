function getPlatformSignals() {
  if (typeof navigator === 'undefined') return '';
  return [
    navigator.userAgentData?.platform,
    navigator.platform,
    navigator.userAgent
  ].filter(Boolean).join(' ');
}

export function detectVisitorDevice(platform = getPlatformSignals()) {
  if (/\bandroid\b/i.test(platform)) return 'android';
  if (/\bwindows nt\b|\bwindows\b|\bwin32\b|\bwin64\b/i.test(platform) && !/\bwindows phone\b/i.test(platform)) {
    return 'windows';
  }
  return 'web';
}
