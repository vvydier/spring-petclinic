import * as React from 'react';
const Autosuggest = require('react-autosuggest');
import { url } from '../../util/index';
import { IConstraint, IError, IInputChangeHandler } from '../../types/index';

import FieldFeedbackPanel from './FieldFeedbackPanel';

const NoConstraint: IConstraint = {
  message: '',
  validate: v => true
};

interface IAutocompleteProps {
  name: string;
  label: string;
};

interface IAutocompleteState {
  value?: '';
  suggestions?: any[];
};

export default class AutocompleteInput extends React.Component<IAutocompleteProps, IAutocompleteState> {

  constructor(props) {
    super(props);
    this.state = {
      value: '',
      suggestions: []
    };
  }

  getSuggestionValue(suggestion) {
    return suggestion;
  }

  renderSuggestion(suggestion) {
    return (
      <span>{suggestion}</span>
    );
  }

  onSuggestionsFetchRequested = ({ value }) => {

    const requestUrl = url('api/find_address');
    const fetchParams = {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        zip_code: value
      })
    };
    // APMService.getInstance().startSpan(method + requestUrl, 'http');
    fetch(requestUrl, fetchParams)
      .then(response =>  {
          if (response.status === 200) {
              // APMService.getInstance().endSpan();
              response.json().then(states => {
                  // APMService.getInstance().endSpan();
                  this.setState({
                    suggestions: states.states
                  });
                  console.log(states);
              });
          } else {
            // APMService.getInstance().captureError(`Failed ${method} to ${requestUrl} - ${response.status} ${response.statusText}`);


          }
      });
  };

  onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: []
    });
  };



  onChange = (event, { newValue, method }) => {
    this.setState({
      value: newValue
    });
  };

  render() {

    const { value, suggestions } = this.state;
    const inputProps = {
      placeholder: '',
      value,
      onChange: this.onChange
    };
    const valid = true;
    const fieldError = {
      field: '',
      message: ''
    };

    const cssGroup = `form-group`;

    return (
        <div className={cssGroup}>
          <label className='col-sm-2 control-label'>{this.props.label}</label>
          <div className='col-sm-10'>
            <Autosuggest
                className='form-control'
                suggestions={suggestions}
                onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
                onSuggestionsClearRequested={this.onSuggestionsClearRequested}
                getSuggestionValue={this.getSuggestionValue}
                renderSuggestion={this.renderSuggestion}
                inputProps={inputProps} />
            </div>
        </div>
      );
  };
}
