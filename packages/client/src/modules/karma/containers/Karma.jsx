/*eslint-disable no-unused-vars*/
import React from 'react';
import { graphql, compose } from 'react-apollo';

import KarmaView from '../components/KarmaView';

class Karma extends React.Component {
  render() {
    return <KarmaView {...this.props} />;
  }
}

const KarmaWithApollo = compose()(Karma);

export default KarmaWithApollo;
