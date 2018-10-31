import * as React from 'react';
import OwnerEditor from './OwnerEditor';
import { APMService } from '../../main';
import { IOwner } from '../../types/index';
import { url } from '../../util/index';
import { request } from '../../util/index';

interface IEditOwnerPageProps {
  params?: { ownerId?: string };
}

interface IEditOwnerPageState {
  owner: IOwner;
}

export default class EditOwnerPage extends React.Component<IEditOwnerPageProps, IEditOwnerPageState> {

  componentWillMount() {
    APMService.getInstance().startTransaction('EditOwnerPage');
  }

  componentDidMount() {
    const { params } = this.props;

    if (params && params.ownerId) {
      request(`api/owners/${params.ownerId}`, (status, owner) =>  {
        APMService.getInstance().endTransaction();
        this.setState({ owner });
      });
    } else {
      APMService.getInstance().endTransaction();
    }
  }

  render() {
    const owner = this.state && this.state.owner;
    if (owner) {
      return <OwnerEditor initialOwner={owner} />;
    }
    return null;
  }
}
