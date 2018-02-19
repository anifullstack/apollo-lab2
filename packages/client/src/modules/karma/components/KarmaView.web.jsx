import React from 'react';
import Helmet from 'react-helmet';
import { PageLayout } from '../../common/components/web';

const renderMetaData = () => (
  <Helmet
    title="Karma"
    meta={[
      {
        name: 'description',
        content: 'Karma page'
      }
    ]}
  />
);

const KarmaView = () => {
  return (
    <PageLayout>
      {renderMetaData()}
      <div className="text-center mt-4 mb-4">
        <p>Hello Karma v0.0.0.11</p>
      </div>
    </PageLayout>
  );
};

export default KarmaView;
