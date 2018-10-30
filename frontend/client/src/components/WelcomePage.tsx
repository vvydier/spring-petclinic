import * as React from 'react';
import { APMService } from '../main';
export default class WelcomePage extends React.Component<any, any> {

  componentWillMount() {
    APMService.getInstance().startTransaction('WelcomePage');
  }

  componentDidMount() {
    APMService.getInstance().endTransaction();
  }

  render() {
    return (
      <span>
        <h2>Welcome</h2>
        <div className='row'>
          <div className='col-md-12'>
            <img className='img-responsive' src='/images/pets.png' />
          </div>
        </div>
      </span>
    );
  }

}
