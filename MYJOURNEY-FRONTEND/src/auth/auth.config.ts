import { Configuration, LogLevel } from '@azure/msal-browser';
import { environment } from '../environments/environment';

export const msalConfig: Configuration = {
  auth: environment.msalConfig,
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false
  },
  system: {
    loggerOptions: {
      loggerCallback: (level: LogLevel, message: string) => {
        if (environment.logLevel === 'debug' || 
            (environment.logLevel === 'info' && level >= LogLevel.Info) ||
            (environment.logLevel === 'error' && level >= LogLevel.Error)) {
          console.log(message);
        }
      },
      logLevel: environment.logLevel === 'debug' ? LogLevel.Verbose :
                environment.logLevel === 'info' ? LogLevel.Info : LogLevel.Error,
      piiLoggingEnabled: false
    }
  }
};

export const loginRequest = {
  scopes: ['User.Read', 'profile', 'openid', 'email']
};

export const graphConfig = {
  graphMeEndpoint: 'https://graph.microsoft.com/v1.0/me',
  graphPhotoEndpoint: 'https://graph.microsoft.com/v1.0/me/photo/$value'
};