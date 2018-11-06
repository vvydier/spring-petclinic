import * as React from 'react';

import { Link } from 'react-router';
import { IOwner } from '../../types/index';
import { request, xhr_request } from '../../util/index';
import OwnerInformation from './OwnerInformation';
import PetsTable from './PetsTable';
import { APMService } from '../../main';

interface IOwnersPageProps {
  params?: { ownerId?: string };
}

interface IOwnerPageState {
  owner?: IOwner;
}

export default class OwnersPage extends React.Component<IOwnersPageProps, IOwnerPageState> {

  constructor() {
    super();

    this.state = {};
  }

  componentWillMount() {
    APMService.getInstance().startTransaction('OwnersPage');
  }

  componentDidMount() {
    const { params } = this.props;

    if (params && params.ownerId) {
      xhr_request(`api/owners/${params.ownerId}`, (status, owner) =>  {
        this.setState({ owner });
        APMService.getInstance().endTransaction();
      });
    } else {
      APMService.getInstance().endTransaction();
    }
  }

  render() {
    const { owner } = this.state;

    if (!owner) {
      return <h2>No Owner loaded</h2>;
    }

    return (
      <span>
        <OwnerInformation owner={owner} />
        <PetsTable owner={owner} />
      </span>
    );
  }
}
