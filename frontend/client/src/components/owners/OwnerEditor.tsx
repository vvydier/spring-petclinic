import * as React from 'react';

import { IRouter, Link } from 'react-router';
import { url, submitForm } from '../../util/index';
import Input from '../form/Input';
import SelectInput from '../form/SelectInput';
import AutocompleteInput from '../form/AutocompleteInput';
import { APMService } from '../../main';
import { Digits, NotEmpty } from '../form/Constraints';

import { IInputChangeHandler, IFieldError, IError, IOwner, IRouterContext, ISelectOption } from '../../types/index';

interface IOwnerEditorProps {
  initialOwner?: IOwner;
}

interface IOwnerEditorState {
  owner?: IOwner;
  error?: IError;
  states?: ISelectOption[];
  cities?: ISelectOption[];
  addresses?: ISelectOption[];
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
    this.address_service_fetch = this.address_service_fetch.bind(this);
    this.buildParams = this.buildParams.bind(this);
    this.onStateChange = this.onStateChange.bind(this);
    this.onCityChange = this.onCityChange.bind(this);
    this.onAddressChange = this.onAddressChange.bind(this);
    this.onAddressFetch = this.onAddressFetch.bind(this);
    this.onSubmit = this.onSubmit.bind(this);

    this.state = {
      owner: Object.assign({}, props.initialOwner),
      states: [{'value': '', 'name': ''}],
      cities: [{'value': '', 'name': ''}],
      addresses: []
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

  buildParams(data: any) {
    return {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    };
  }


  address_service_fetch = (requestUrl: string, fetchParams: any, onSuccess: (data: any) => void) => {
    fetch(requestUrl, fetchParams)
      .then(response =>  {
          if (response.status === 200) {
              response.json().then(data => {
                  onSuccess(data);
              });
          } else {
            console.log('ERROR IMPROVE');
            return {};
          }
      });
  }

  onZipChange(name: string, value: string) {
    const { owner } = this.state;
    if (value.trim() !== '' && owner.zip_code !== value) {
      const requestUrl = url('api/find_state');
      const fetchParams = this.buildParams({ zip_code: value });
      this.address_service_fetch(requestUrl, fetchParams, (data) => {
        let states = data.states.map(state => ({ value: state, name: state }));
        const modifiedOwner = Object.assign({}, owner, { [name]: value, ['state']: '', ['city']: '' });
        states.unshift({'value': '', 'name': ''});
        this.setState({
          owner: modifiedOwner,
          states: states,
          cities: [{'value': '', 'name': ''}]
        });
      });
    }
  }

  onStateChange(name: string, value: string, fieldError: IFieldError) {
    const requestUrl = url('api/find_city');
    const { owner } = this.state;
    const fetchParams = this.buildParams({ zip_code: owner.zip_code, state: value });
    const modifiedOwner = Object.assign({}, owner, { [name]: value, ['city']: '' });
    this.setState({
      owner: modifiedOwner
    });
    this.address_service_fetch(requestUrl, fetchParams, (data) => {
      let cities = data.cities.map(city => ({ value: city, name: city }));
      cities.unshift({'value': '', 'name': ''});
      this.setState({
        cities: cities
      });
    });
  }

  onCityChange(name: string, value: string, fieldError: IFieldError) {
    const { owner } = this.state;
    const modifiedOwner = Object.assign({}, owner, { [name]: value });
    this.setState({
      owner: modifiedOwner
    });
  }

  onAddressFetch(value: string, onSuccess: (data: any) => void ) {
    console.log(value);
    const requestUrl = url('api/find_address');
    const { owner } = this.state;
    const fetchParams = this.buildParams({ zip_code: owner.zip_code, state: owner.state, city: owner.city, address: value });
    console.log(fetchParams);
    this.address_service_fetch(requestUrl, fetchParams, (data) => {
      onSuccess(data.addresses);
    });
  }

  onAddressChange(value: string ) {
    console.log('change value: ' + value);
    const { owner } = this.state;
    const modifiedOwner = Object.assign({}, owner, { ['address']: value });
    this.setState({
      owner: modifiedOwner
    });
  }

  render() {
    const { owner, error, states, cities, addresses } = this.state;
    return (
      <span>
        <h2>{owner.isNew ? 'Add Owner' : 'Update Owner'}</h2>
        <form className='form-horizontal' method='POST' action={url(owner.isNew ? 'api/owners' : 'api/owners/' + owner.id)}>
          <div className='form-group has-feedback'>
            <Input object={owner} error={error} constraint={NotEmpty} label='First Name' name='firstName' onChange={this.onInputChange} />
            <Input object={owner} error={error} constraint={NotEmpty} label='Last Name' name='lastName' onChange={this.onInputChange} />
            <Input object={owner} error={error} constraint={NotEmpty} label='Zip Code' name='zip_code' onBlur={this.onZipChange} />
            <SelectInput object={owner} size={1} label='State' name='state' options={states} onChange={this.onStateChange} disabled={states.length === 1} />
            <SelectInput object={owner} error={error} size={1} label='City' name='city' options={cities} onChange={this.onCityChange} disabled={cities.length === 1}/>
            <AutocompleteInput value={owner.address} label='Address' name='address' onFetch={this.onAddressFetch} onChange={this.onAddressChange} />
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
