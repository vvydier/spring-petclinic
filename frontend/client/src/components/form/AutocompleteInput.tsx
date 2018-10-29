import * as React from 'react';
const Autosuggest = require('react-autosuggest');

import { IConstraint, IError, IInputChangeHandler } from '../../types/index';

import FieldFeedbackPanel from './FieldFeedbackPanel';

const languages = [
  {
    name: 'C',
    year: 1972
  },
  {
    name: 'C#',
    year: 2000
  },
  {
    name: 'C++',
    year: 1983
  },
  {
    name: 'Clojure',
    year: 2007
  },
  {
    name: 'Elm',
    year: 2012
  },
  {
    name: 'Go',
    year: 2009
  },
  {
    name: 'Haskell',
    year: 1990
  },
  {
    name: 'Java',
    year: 1995
  },
  {
    name: 'Javascript',
    year: 1995
  },
  {
    name: 'Perl',
    year: 1987
  },
  {
    name: 'PHP',
    year: 1995
  },
  {
    name: 'Python',
    year: 1991
  },
  {
    name: 'Ruby',
    year: 1995
  },
  {
    name: 'Scala',
    year: 2003
  }
];

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

  escapeRegexCharacters(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  getSuggestions (value) {
    const escapedValue = this.escapeRegexCharacters(value.trim());
    if (escapedValue === '') {
      return [];
    }
    const regex = new RegExp('^' + escapedValue, 'i');
    return languages.filter(language => regex.test(language.name));
  };

  getSuggestionValue(suggestion) {
    return suggestion.name;
  }

  renderSuggestion(suggestion) {
    return (
      <span>{suggestion.name}</span>
    );
  }

  onSuggestionsFetchRequested = ({ value }) => {
    const suggestions = this.getSuggestions(value);
    this.setState({
      suggestions: suggestions
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
