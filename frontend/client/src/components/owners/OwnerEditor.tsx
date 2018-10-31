import * as React from 'react';

import { IRouter, Link } from 'react-router';
import { url, submitForm, request_promise } from '../../util/index';
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
    APMService.getInstance().startSpan('POST api/find_state', 'http');
    return Promise.all(
      [
        request_promise('api/find_state', 'POST', { zip_code: this.state.owner.zipCode }),
        request_promise('api/find_city', 'POST', { zip_code: this.state.owner.zipCode, state: this.state.owner.state })
      ]
    ).then(response => {
      // TODO: Currently fails silently - maybe warn if error vs no data
      let states = response[0] && response[0].states ? response[0].states.map(state => ({ value: state, name: state })) : [];
      states.unshift({'value': '', 'name': ''});
      let cities = response[1] && response[1].cities ? response[1].cities.map(state => ({ value: state, name: state })) : [];
      cities.unshift({'value': '', 'name': ''});
      APMService.getInstance().endSpan();
      APMService.getInstance().endTransaction();
      this.setState({
        states: states,
        cities: cities
      });

    });
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
    APMService.getInstance().startSpan('POST ' + requestUrl, 'http');
    fetch(requestUrl, fetchParams)
      .then(response =>  {
          if (response.status === 200) {
              response.json().then(data => {
                  APMService.getInstance().endSpan();
                  onSuccess(data);
              });
          } else {
            APMService.getInstance().captureError(`Failed POST on ${requestUrl} - ${response.status} ${response.statusText}`);
            APMService.getInstance().endSpan();
            onSuccess(null);
          }
      });
  }

  onZipChange(name: string, value: string) {
    const { owner } = this.state;
    if (value.trim() !== '' && owner.zipCode !== value) {
      APMService.getInstance().startTransaction('OwnerEditor:ZipChange');
      const requestUrl = url('api/find_state');
      const fetchParams = this.buildParams({ zip_code: value });
      this.address_service_fetch(requestUrl, fetchParams, (data) => {
        if (data) {
          let states = data.states ? data.states.map(state => ({ value: state, name: state })) : [];
          const modifiedOwner = Object.assign({}, owner, { [name]: value, ['state']: '', ['city']: '' });
          states.unshift({'value': '', 'name': ''});
          APMService.getInstance().endTransaction();
          this.setState({
            owner: modifiedOwner,
            states: states,
            cities: [{'value': '', 'name': ''}]
          });
        } else {
          // TODO: silent failure curently. Indicate failure to user
          APMService.getInstance().endTransaction();
        }
      });
    }
  }

  onStateChange(name: string, value: string, fieldError: IFieldError) {
    APMService.getInstance().startTransaction('OwnerEditor:StateChange');
    const requestUrl = url('api/find_city');
    const { owner } = this.state;
    const fetchParams = this.buildParams({ zip_code: owner.zipCode, state: value });
    const modifiedOwner = Object.assign({}, owner, { [name]: value, ['city']: '' });
    this.setState({
      owner: modifiedOwner
    });
    this.address_service_fetch(requestUrl, fetchParams, (data) => {
      if (data) {
        let cities = data.cities ? data.cities.map(city => ({ value: city, name: city })) : [];
        cities.unshift({'value': '', 'name': ''});
        APMService.getInstance().endTransaction();
        this.setState({
          cities: cities
        });
      } else {
        // TODO: silent failure curently. Indicate failure to user
        APMService.getInstance().endTransaction();
      }

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
    APMService.getInstance().startTransaction('OwnerEditor:FindAddress');
    const requestUrl = url('api/find_address');
    const { owner } = this.state;
    const fetchParams = this.buildParams({ zip_code: owner.zipCode, state: owner.state, city: owner.city, address: value });
    this.address_service_fetch(requestUrl, fetchParams, (data) => {
      if (data) {
        onSuccess(data.addresses);
        APMService.getInstance().endTransaction();
      } else {
        // TODO: silent failure curently. Indicate failure to user
        APMService.getInstance().endTransaction();
      }
    });
  }

  onAddressChange(value: string ) {
    const { owner } = this.state;
    const modifiedOwner = Object.assign({}, owner, { ['address']: value });
    this.setState({
      owner: modifiedOwner
    });
  }

  render() {
    const { owner, error, states, cities, addresses } = this.state;
    console.log(owner);
    return (
      <span>
        <h2>{owner.isNew ? 'Add Owner' : 'Update Owner'}</h2>
        <form className='form-horizontal' method='POST' action={url(owner.isNew ? 'api/owners' : 'api/owners/' + owner.id)}>
          <div className='form-group has-feedback'>
            <Input object={owner} error={error} constraint={NotEmpty} label='First Name' name='firstName' onChange={this.onInputChange} />
            <Input object={owner} error={error} constraint={NotEmpty} label='Last Name' name='lastName' onChange={this.onInputChange} />
            <Input object={owner} error={error} constraint={NotEmpty} label='Zip Code' name='zipCode' onBlur={this.onZipChange} />
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
