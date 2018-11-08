import * as React from 'react';
import { xhr_request_promise, url } from '../util/index';
import { APMService } from '../main';
interface IErrorPageState {
  error?: {
    status: string;
    message: string;
  };
}

export default class ErrorPage extends React.Component<void, IErrorPageState> {
  constructor() {
    super();
    this.state = {};
  }

  componentWillMount() {
    APMService.getInstance().startTransaction('ErrorPage');
  }

  componentDidMount() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url('api/error'), true);
    xhr.onload = function(e) {
      APMService.getInstance().captureError(JSON.parse(xhr.responseText).message);
      APMService.getInstance().endTransaction(true);
      this.setState({'error': JSON.parse(xhr.responseText)});
    }.bind(this);
    xhr.send(null);
  }

  render() {
    const { error } = this.state;

    return <span>
      <img src='/images/pets.png' />

      <h2>Something happened...</h2>
      { error ?
        <span>
          <p><b>Status:</b> {error.status}</p>
          <p><b>Message:</b> {error.message}</p>
        </span>
        :
        <p><b>Unkown error</b></p>
      }
    </span>;
  }
};
