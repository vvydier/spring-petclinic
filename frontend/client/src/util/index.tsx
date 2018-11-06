import { IHttpMethod } from '../types/index';
export const url = (path: string): string => `/${path}`;
import { APMService } from '../main';

// as fetch isn't instrumenented yet by elastic APM
export const xhr_request = (path: string, onSuccess: (status: number, response: any) => any) => {
  const requestUrl = url(path);
  const xhr = new XMLHttpRequest();
  APMService.getInstance().startSpan('GET ' + requestUrl, 'http');
  xhr.open('GET', requestUrl, true);
  xhr.onload = function(e) {
    if (xhr.status < 400) {
        APMService.getInstance().endSpan();
        onSuccess(xhr.status, JSON.parse(xhr.responseText));
    } else {
      APMService.getInstance().captureError(`Failed GET on ${requestUrl} - ${xhr.status} ${xhr.statusText}`);
      APMService.getInstance().endSpan();
      onSuccess(xhr.status, {});
    }
  };
  xhr.onerror = function(e) {
     APMService.getInstance().captureError(`Failed GET on ${requestUrl} - ${xhr.status} ${xhr.statusText}`);
     APMService.getInstance().endSpan();
     onSuccess(xhr.status, {});
  };
  xhr.send(null);
};

export const request = (path: string, onSuccess: (status: number, response: any) => any) => {
  const requestUrl = url(path);
  APMService.getInstance().startSpan('GET ' + requestUrl, 'http');
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
  return fetch(requestUrl, fetchParams)
    .then(response =>  {
        if (response.status < 400) {
            return response.json();
        } else {
          APMService.getInstance().captureError(`Failed GET on ${requestUrl} - ${response.status} ${response.statusText}`);
          return {};
        }
    });
};

// as fetch isn't instrumenented yet by elastic APM
export const xhr_request_promise = (path: string, method = 'GET', data?: any): any => {
  const requestUrl = url(path);
  return new Promise(function (resolve, reject) {
    const xhr = new XMLHttpRequest();
    xhr.open(method, requestUrl, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Accept', 'application/json');
    xhr.onload = function(e) {
      if (xhr.status < 400) {
          resolve(JSON.parse(xhr.responseText));
      } else {
          APMService.getInstance().captureError(`Failed GET on ${requestUrl} - ${xhr.status} ${xhr.statusText}`);
          reject({});
      }
    };
    xhr.onerror = function(e) {
      APMService.getInstance().captureError(`Failed GET on ${requestUrl} - ${xhr.status} ${xhr.statusText}`);
      reject({});
    };
    if (data) {
      xhr.send(JSON.stringify(data));
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
// as fetch isn't instrumenented yet by elastic APM
export const xhr_submitForm = (method: IHttpMethod, path: string, data: any, onSuccess: (status: number, response: any) => void) => {
  const requestUrl = url(path);
  const xhr = new XMLHttpRequest();
  APMService.getInstance().startSpan(method + requestUrl, 'http');
  xhr.open(method, requestUrl, true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.setRequestHeader('Accept', 'application/json');
  xhr.onload = function(e) {
    if (xhr.status >= 400) {
        APMService.getInstance().captureError(`Failed ${method} to ${requestUrl} - ${xhr.status} ${xhr.statusText}`);
        APMService.getInstance().endSpan();
        onSuccess(xhr.status, JSON.parse(xhr.responseText));
    } else {
      if (xhr.status !== 204)  {
        APMService.getInstance().endSpan();
        onSuccess(xhr.status, JSON.parse(xhr.responseText));
      } else {
        APMService.getInstance().endSpan();
        onSuccess(xhr.status, {});
      }
    }
  };

  xhr.onerror = function(e) {
     APMService.getInstance().captureError(`Failed GET on ${requestUrl} - ${xhr.status} ${xhr.statusText}`);
     APMService.getInstance().endSpan();
     onSuccess(xhr.status, {});
  };
  xhr.send(JSON.stringify(data));
};
