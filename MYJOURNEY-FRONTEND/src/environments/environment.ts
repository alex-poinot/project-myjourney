export const environment = {
  production: false,
  staging: false,
  apiUrl: 'http://localhost:3000/api',
  msalConfig: {
    clientId: '634d3680-46b5-48e4-bdae-b7c6ed6b218a',
    authority: 'https://login.microsoftonline.com/e1029da6-a2e7-449b-b816-9dd31f7c2d83',
    redirectUri: 'http://localhost:4200/',
    postLogoutRedirectUri: 'http://localhost:4200/'
  },
  appName: 'MyJourney - Développement',
  logLevel: 'debug'
};