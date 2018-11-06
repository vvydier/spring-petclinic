import * as React from 'react';

import { Router, Link } from 'react-router';
import { request, xhr_request } from '../../util/index';
import { IVet } from '../../types/index';
import { APMService } from '../../main';
interface IVetsPageState {
  vets: IVet[];
}

export default class VetsPage extends React.Component<void, IVetsPageState> {
  constructor() {
    super();

    this.state = { vets: [] };
  }
  componentWillMount() {
    APMService.getInstance().startTransaction('VetsPage');
  }

  componentDidMount() {
    xhr_request('api/vets', (status, vets) =>  {
      console.log(vets);
      this.setState({ vets });
      APMService.getInstance().endTransaction();
    });
  }

  render() {
    const { vets } = this.state;

    if (!vets) {
      return <h2>Veterinarians</h2>;
    }

    return (
      <span>
        <h2>Veterinarians</h2>
        <table className='table table-striped'>
          <thead>
            <tr>
              <th>Name</th>
              <th>Specialties</th>
            </tr>
          </thead>
          <tbody>

            {vets.map(vet => (
              <tr key={vet.id}>
                <td>{vet.firstName} {vet.lastName}</td>
                <td>{vet.specialties.length > 0 ? vet.specialties.map(specialty => specialty.name).join(', ') : 'none'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </span>
    );
  }
}
