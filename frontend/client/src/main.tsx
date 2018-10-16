import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';

import { browserHistory as history } from 'react-router';
const initApm = require('elastic-apm-js-base').init;
require('./styles/less/petclinic.less');

/**
let apm = initApm({
   serviceName: __APM_SERVICE_NAME__,
   serverUrl: __APM_SERVER_URL__,
   serviceVersion: __APM_SERVICE_VERSION__
});
apm.setInitialPageLoadName(window.location.pathname.split('/')[1]);
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
