import * as React from 'react';

import { IRouter, Link } from 'react-router';
import { url, submitForm } from '../../util/index';

import Input from '../form/Input';
import SelectInput from '../form/SelectInput';
import AutocompleteInput from '../form/AutocompleteInput';
import { APMService } from '../../main';
import { Digits, NotEmpty } from '../form/Constraints';

import { IInputChangeHandler, IFieldError, IError, IOwner, IRouterContext } from '../../types/index';

interface IOwnerEditorProps {
  initialOwner?: IOwner;
}

interface IOwnerEditorState {
  owner?: IOwner;
  error?: IError;
};

export default class OwnerEditor extends React.Component<IOwnerEditorProps, IOwnerEditorState> {

  context: IRouterContext;

  static contextTypes = {
    router: React.PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    this.onInputChange = this.onInputChange.bind(this);
    this.onZipChange = this.onZipChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);

    this.state = {
      owner: Object.assign({}, props.initialOwner)
    };
  }

  componentWillMount() {
    APMService.getInstance().startTransaction('OwnerEditor');
  }

  componentDidMount() {
    APMService.getInstance().endTransaction();
  }

  onSubmit(event) {
    const { owner } = this.state;
    const url = owner.isNew ? 'api/owners' : 'api/owners/' + owner.id;
    APMService.getInstance().startTransaction( owner.isNew ? 'CreateOwner' : 'UpdateOwner');
    event.preventDefault();

    submitForm(owner.isNew ? 'POST' : 'PUT', url, owner, (status, response) => {
      if (status === 204 || status === 201) {
        APMService.getInstance().endTransaction();
        const owner_id = owner.isNew ? (response as IOwner).id : owner.id;
        this.context.router.push({
          pathname: '/owners/' + owner_id
        });
      } else {
        APMService.getInstance().endTransaction();
        console.log('Error: ', response);
        this.setState({ error: response });
      }
    });
  }

  onInputChange(name: string, value: string, fieldError: IFieldError) {
    const { owner, error } = this.state;
    const modifiedOwner = Object.assign({}, owner, { [name]: value });
    const newFieldErrors = error ? Object.assign({}, error.fieldErrors, {[name]: fieldError }) : {[name]: fieldError };
    this.setState({
      owner: modifiedOwner,
      error: { fieldErrors: newFieldErrors }
    });
  }

  onZipChange(name: string, value: string) {
    console.log('zip change ' + value);
  }

  render() {
    const { owner, error } = this.state;

    const cities = [{'name': 'new_york', 'value': 'New York'}];
    const states = [{'name': 'new_york', 'value': 'New York'}];
    return (
      <span>
        <h2>{owner.isNew ? 'Add Owner' : 'Update Owner'}</h2>
        <form className='form-horizontal' method='POST' action={url(owner.isNew ? 'api/owners' : 'api/owners/' + owner.id)}>
          <div className='form-group has-feedback'>
            <Input object={owner} error={error} constraint={NotEmpty} label='First Name' name='firstName' onChange={this.onInputChange} />
            <Input object={owner} error={error} constraint={NotEmpty} label='Last Name' name='lastName' onChange={this.onInputChange} />
            <Input object={owner} error={error} constraint={NotEmpty} label='Zip Code' name='zipCode' onChange={this.onInputChange} onBlur={this.onZipChange} />
            <SelectInput object={owner} error={error} size={1} label='State' name='state' options={states} onChange={this.onInputChange} />
            <SelectInput object={owner} error={error} size={1} label='City' name='city' options={cities} onChange={this.onInputChange} />
            <Input object={owner} error={error} constraint={NotEmpty} label='Address' name='address' onChange={this.onInputChange} />
            <Input object={owner} error={error} constraint={Digits(10)} label='Telephone' name='telephone' onChange={this.onInputChange} />
          </div>
          <div className='form-group'>
            <div className='col-sm-offset-2 col-sm-10'>
              <button className='btn btn-default' type='submit' onClick={this.onSubmit}>{owner.isNew ? 'Add Owner' : 'Update Owner'}</button>
            </div>
          </div>
        </form>
      </span>
    );
  }
}
