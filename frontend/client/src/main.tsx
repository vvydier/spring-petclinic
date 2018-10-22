import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';

import { browserHistory as history } from 'react-router';
const initApm = require('elastic-apm-js-base').init;
require('./styles/less/petclinic.less');
import { url } from './util/index';

let apm = null;
const fetchUrl = url('config');
fetch(fetchUrl)
  .then(response => response.json())
  .then(config => {
    let apm = initApm({
       serviceName: config.apm_service_name + '-react',
       serverUrl: config.apm_server_js,
       serviceVersion: config.apm_service_version
    });
    apm.setInitialPageLoadName(window.location.pathname !== '' ? window.location.pathname : 'homepage');
  });


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
