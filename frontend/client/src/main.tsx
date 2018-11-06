import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';

import { browserHistory as history } from 'react-router';

const initApm = require('elastic-apm-js-base/src/index').init;

require('./styles/less/petclinic.less');
import { url } from './util/index';

export class APMService {

  private static instance: APMService;
  private apm: any;
  private current_span: any;
  private ready = false;
  private open = false;
  private constructor () {

  }

  private setup_apm() {
      const requestUrl = url('config');
      const xhr = new XMLHttpRequest();
      xhr.open('GET', requestUrl, true);
      xhr.onload = function(e) {
        if (xhr.status === 200) {
            const config = JSON.parse(xhr.responseText);
            this.apm = initApm({
               serviceName: config.apm_client_service_name,
               serverUrl: config.apm_server_js,
               serviceVersion: config.apm_service_version,
               transactionThrottleLimit: 1000,
               errorThrottleLimit: 1000,
               distributedTracingOrigins: config.distributedTracingOrigins.split(',')
            });
            this.apm.setInitialPageLoadName(window.location.pathname !== '' ? window.location.pathname : 'homepage');
            this.apm.addFilter(function (payload) {
              if (payload.transactions) {
                payload.transactions.filter(function (tr) {
                  return tr.spans.some(function (span) {
                    return (span.context && span.context.http && span.context.http.url && (span.context.http.url.includes('rum/transactions')
                    || span.context.http.url.includes('rum/events')));
                  });
                });
              };
              return payload;
            });
            APMService.instance.ready = true;
        } else {
          console.log('Failed to Initialize APM');
          console.log(`Failed GET on ${requestUrl} - ${xhr.status} ${xhr.statusText}`);
        }
      }.bind(this);
      xhr.onerror = function(e) {
         console.log('Failed to Initialize APM');
         console.log(`Failed GET on ${requestUrl} - ${xhr.status} ${xhr.statusText}`);
      };
      xhr.send(null);
  }

  static getInstance() {
    if (!APMService.instance) {
        console.log('Creating APM Service');
        APMService.instance = new APMService();
        APMService.instance.setup_apm();
        console.log('Created APM Service');
    }
    return APMService.instance;
  }


  startTransaction(name) {
    if (APMService.instance.ready && !APMService.instance.open) {
      console.log('Starting transaction - ' + name + ':');
      // in case one has been opened
      if (APMService.instance.apm.getCurrentTransaction()) {
        APMService.instance.apm.getCurrentTransaction().end();
      }
      let transaction = APMService.instance.apm.startTransaction(name, 'react');
      console.log(transaction);
      APMService.instance.open = true;
    }
  }

  endTransaction() {
    if (APMService.instance.open) {
      console.log('Closing transaction');
      let transaction = APMService.instance.apm.getCurrentTransaction();
      transaction.end();
      console.log('Closed transaction:');
      console.log(transaction);
      APMService.instance.open = false;
    }
  }

  startSpan(name, type) {
    if (APMService.instance.ready && APMService.instance.open) {
      let transaction = APMService.instance.apm.getCurrentTransaction();
      APMService.instance.current_span = transaction.startSpan(name, type);
    }
  }

  endSpan() {
    if (APMService.instance.open) {
      APMService.instance.current_span.end();
    }
  }

  captureError(message) {
    if (APMService.instance.open) {
      console.log('Capturing Error');
      APMService.instance.apm.captureError(new Error(message));
    }
  }



}


/**

 **/
// The Application
import Root from './Root';

// Render Application
const mountPoint = document.getElementById('mount');
ReactDOM.render(
  <AppContainer><Root history={history}/></AppContainer>,
  mountPoint
);

declare var module: any;
if (module.hot) {
  module.hot.accept('./Root', () => {
    const NextApp = require('./Root').default;
    ReactDOM.render(
      <AppContainer>
        <NextApp history={history} />
      </AppContainer>,
      mountPoint
    );
  });
}
