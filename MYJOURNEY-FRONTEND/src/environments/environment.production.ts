export const environment = {
  production: true,
  staging: false,
  apiUrl: 'https://api-myjourney.company.com/api',
  msalConfig: {
    clientId: '634d3680-46b5-48e4-bdae-b7c6ed6b218a',
    authority: 'https://login.microsoftonline.com/e1029da6-a2e7-449b-b816-9dd31f7c2d83',
    redirectUri: 'https://myjourney.company.com/',
    postLogoutRedirectUri: 'https://myjourney.company.com/'
  },
  appName: 'MyJourney - Production',
  logLevel: 'error'
};