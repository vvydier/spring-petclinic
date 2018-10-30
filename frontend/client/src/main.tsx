import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';

import { browserHistory as history } from 'react-router';
const initApm = require('elastic-apm-js-base').init;
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
      fetch(url('config')).then(response => response.json()).then(config =>  {
        this.apm = initApm({
           serviceName: config.apm_service_name + '-react',
           serverUrl: config.apm_server_js,
           serviceVersion: config.apm_service_version,
           transactionThrottleLimit: 1000,
           errorThrottleLimit: 1000
        });
        this.apm.setInitialPageLoadName(window.location.pathname !== '' ? window.location.pathname : 'homepage');
        APMService.instance.ready = true;
      });
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
