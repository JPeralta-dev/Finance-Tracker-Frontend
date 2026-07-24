export const environment = {
  production: true,
  apiUrl: '', // Relative URLs — auth requests go through Vercel rewrite (same-origin)
  telegramBotUrl: 'https://t.me/hormigaTrackerBot',
  posthog: {
    apiKey: 'phc_PROD_REPLACE_ME', // Replace with real PostHog project API key
    apiHost: 'https://us.i.posthog.com',
    enabled: true,
    debug: false,
    consentRequired: true,
  },
};
