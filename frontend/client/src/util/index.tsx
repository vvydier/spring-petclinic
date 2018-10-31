import { IHttpMethod } from '../types/index';
export const url = (path: string): string => `/${path}`;
import { APMService } from '../main';

export const request = (path: string, onSuccess: (status: number, response: any) => any) => {
  const requestUrl = url(path);
  APMService.getInstance().startSpan('GET ' + requestUrl, 'http');
  console.log('Fetching from ' + requestUrl);
  return fetch(requestUrl)
    .then(response =>  {
        if (response.status < 400) {
            response.json().then(result => {
                APMService.getInstance().endSpan();
                onSuccess(response.status, result);
            });
        } else {
          APMService.getInstance().captureError(`Failed GET on ${requestUrl} - ${response.status} ${response.statusText}`);
          APMService.getInstance().endSpan();
          onSuccess(response.status, {});
        }
    });
};

export const request_promise = (path: string, method = 'GET', data?: any): any => {
  const requestUrl = url(path);
  let fetchParams = {
    method: method,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  };
  if (data) {
    fetchParams['body'] = JSON.stringify(data);
  }
  console.log(fetchParams);
  console.log('Fetching from ' + requestUrl);
  return fetch(requestUrl, fetchParams)
    .then(response =>  {
        if (response.status < 400) {
            return response.json();
        } else {
          APMService.getInstance().captureError(`Failed GET on ${requestUrl} - ${response.status} ${response.statusText}`);
          return null;
        }
    });
};

/**
 * path: relative PATH without host and port (i.e. '/api/123')
 * data: object that will be passed as request body
 * onSuccess: callback handler if request succeeded. Succeeded means it could technically be handled (i.e. valid json is returned)
 * regardless of the HTTP status code.
 */
export const submitForm = (method: IHttpMethod, path: string, data: any, onSuccess: (status: number, response: any) => void) => {
  const requestUrl = url(path);

  const fetchParams = {
    method: method,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  };
  APMService.getInstance().startSpan(method + requestUrl, 'http');
  console.log('Submitting to ' + method + ' ' + requestUrl);
  return fetch(requestUrl, fetchParams)
    .then(response =>  {
        if (response.status >= 400) {
            APMService.getInstance().captureError(`Failed ${method} to ${requestUrl} - ${response.status} ${response.statusText}`);
            APMService.getInstance().endSpan();
            onSuccess(response.status, `Failed ${method} to ${requestUrl} - ${response.status} ${response.statusText}`);
        } else {
          if (response.status !== 204)  {
            response.json().then(result => {
                APMService.getInstance().endSpan();
                onSuccess(response.status, result);
            });
          } else {
            APMService.getInstance().endSpan();
            onSuccess(response.status, {});
          }
        }
    });
};
