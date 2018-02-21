import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { Link } from 'react-router-dom';

import { PageLayout } from '../../common/components/web';
import KarmaForm from './KarmaForm';
import settings from '../../../../../../settings';

const onSubmit = (karma, addKarma, editKarma) => values => {
  if (karma) {
    editKarma(karma.id, values.title, values.content);
  } else {
    addKarma(values.title, values.content);
  }
};

const KarmaEditView = ({ loading, karma, match, location, subscribeToMore, addKarma, editKarma }) => {
  let karmaObj = karma;
  console.log('KarmaEditView', 'KarmaEditView', 'match', match, 'subscribeToMore', subscribeToMore);
  // if new karma was just added read it from router
  if (!karmaObj && location.state) {
    karmaObj = location.state.karma;
  }

  const renderMetaData = () => (
    <Helmet
      title={`${settings.app.name} - Edit Karma`}
      meta={[
        {
          name: 'description',
          content: 'Edit karma example page'
        }
      ]}
    />
  );

  if (loading && !karmaObj) {
    return (
      <PageLayout>
        {renderMetaData()}
        <div className="text-center">Loading...</div>
      </PageLayout>
    );
  } else {
    return (
      <PageLayout>
        {renderMetaData()}
        <Link id="back-button" to="/karmas">
          Back
        </Link>
        <h2>{karma ? 'Edit' : 'Create'} Karma</h2>
        <KarmaForm onSubmit={onSubmit(karmaObj, addKarma, editKarma)} karma={karma} />
        <br />
      </PageLayout>
    );
  }
};

KarmaEditView.propTypes = {
  loading: PropTypes.bool.isRequired,
  karma: PropTypes.object,
  addKarma: PropTypes.func.isRequired,
  editKarma: PropTypes.func.isRequired,
  match: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  subscribeToMore: PropTypes.func.isRequired
};

export default KarmaEditView;
