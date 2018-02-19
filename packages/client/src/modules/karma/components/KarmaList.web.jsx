import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { Link } from 'react-router-dom';
import { PageLayout, Table, Button } from '../../common/components/web';
import settings from '../../../../../../settings';

export default class KarmaList extends React.PureComponent {
  static propTypes = {
    loading: PropTypes.bool.isRequired,
    karmas: PropTypes.object,
    deleteKarma: PropTypes.func,
    loadMoreRows: PropTypes.func.isRequired
  };

  handleDeleteKarma = id => {
    const { deleteKarma } = this.props;
    deleteKarma(id);
  };

  renderLoadMore = (karmas, loadMoreRows) => {
    if (karmas.pageInfo.hasNextPage) {
      return (
        <Button id="load-more" color="primary" onClick={loadMoreRows}>
          Load more ...
        </Button>
      );
    }
  };

  renderMetaData = () => (
    <Helmet
      title={`${settings.app.name} - Karmas list`}
      meta={[
        {
          name: 'description',
          content: `${settings.app.name} - List of all karmas`
        }
      ]}
    />
  );

  render() {
    const { loading, karmas, loadMoreRows } = this.props;
    if (loading) {
      return (
        <PageLayout>
          {this.renderMetaData()}
          <div className="text-center">Loading...</div>
        </PageLayout>
      );
    } else {
      const columns = [
        {
          title: 'Title',
          dataIndex: 'title',
          key: 'title',
          render: (text, record) => (
            <Link className="karma-link" to={`/karma/${record.id}`}>
              {text}
            </Link>
          )
        },
        {
          title: 'Actions',
          key: 'actions',
          width: 50,
          render: (text, record) => (
            <Button
              color="primary"
              size="sm"
              className="delete-button"
              onClick={() => this.handleDeleteKarma(record.id)}
            >
              Delete
            </Button>
          )
        }
      ];
      return (
        <PageLayout>
          {this.renderMetaData()}
          <h2>Karmas</h2>
          <Link to="/karma/0">
            <Button color="primary">Add</Button>
          </Link>
          <h1 />
          <Table dataSource={karmas.edges.map(({ node }) => node)} columns={columns} />
          <div>
            <small>
              ({karmas.edges.length} / {karmas.totalCount})
            </small>
          </div>
          {this.renderLoadMore(karmas, loadMoreRows)}
        </PageLayout>
      );
    }
  }
}
