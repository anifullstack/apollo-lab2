import React from 'react';
import PropTypes from 'prop-types';
import { graphql, compose } from 'react-apollo';
import update from 'immutability-helper';

import KarmaList from '../components/KarmaList';

import KARMAS_QUERY from '../graphql/KarmasQuery.graphql';
import KARMAS_SUBSCRIPTION from '../graphql/KarmasSubscription.graphql';
import DELETE_KARMA from '../graphql/DeleteKarma.graphql';

export function AddKarma(prev, node) {
  // ignore if duplicate
  if (node.id !== null && prev.karmas.edges.some(karma => node.id === karma.cursor)) {
    return prev;
  }

  const edge = {
    cursor: node.id,
    node: node,
    __typename: 'KarmaEdges'
  };

  return update(prev, {
    karmas: {
      totalCount: {
        $set: prev.karmas.totalCount + 1
      },
      edges: {
        $unshift: [edge]
      }
    }
  });
}

function DeleteKarma(prev, id) {
  const index = prev.karmas.edges.findIndex(x => x.node.id === id);

  // ignore if not found
  if (index < 0) {
    return prev;
  }

  return update(prev, {
    karmas: {
      totalCount: {
        $set: prev.karmas.totalCount - 1
      },
      edges: {
        $splice: [[index, 1]]
      }
    }
  });
}

class Karma extends React.Component {
  static propTypes = {
    loading: PropTypes.bool.isRequired,
    karmas: PropTypes.object,
    subscribeToMore: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.subscription = null;
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.loading) {
      const endCursor = this.props.karmas ? this.props.karmas.pageInfo.endCursor : 0;
      const nextEndCursor = nextProps.karmas.pageInfo.endCursor;

      // Check if props have changed and, if necessary, stop the subscription
      if (this.subscription && endCursor !== nextEndCursor) {
        this.subscription();
        this.subscription = null;
      }

      // Subscribe or re-subscribe
      if (!this.subscription) {
        this.subscribeToKarmaList(nextEndCursor);
      }
    }
  }

  componentWillUnmount() {
    if (this.subscription) {
      // unsubscribe
      this.subscription();
    }
  }

  subscribeToKarmaList = endCursor => {
    const { subscribeToMore } = this.props;

    this.subscription = subscribeToMore({
      document: KARMAS_SUBSCRIPTION,
      variables: { endCursor },
      updateQuery: (prev, { subscriptionData: { data: { karmasUpdated: { mutation, node } } } }) => {
        let newResult = prev;

        if (mutation === 'CREATED') {
          newResult = AddKarma(prev, node);
        } else if (mutation === 'DELETED') {
          newResult = DeleteKarma(prev, node.id);
        }

        return newResult;
      }
    });
  };

  render() {
    return <KarmaList {...this.props} />;
  }
}

export default compose(
  graphql(KARMAS_QUERY, {
    options: () => {
      return {
        variables: { limit: 10, after: 0 }
      };
    },
    props: ({ data }) => {
      const { loading, error, karmas, fetchMore, subscribeToMore } = data;
      const loadMoreRows = () => {
        return fetchMore({
          variables: {
            after: karmas.pageInfo.endCursor
          },
          updateQuery: (previousResult, { fetchMoreResult }) => {
            const totalCount = fetchMoreResult.karmas.totalCount;
            const newEdges = fetchMoreResult.karmas.edges;
            const pageInfo = fetchMoreResult.karmas.pageInfo;

            return {
              // By returning `cursor` here, we update the `fetchMore` function
              // to the new cursor.
              karmas: {
                totalCount,
                edges: [...previousResult.karmas.edges, ...newEdges],
                pageInfo,
                __typename: 'Karmas'
              }
            };
          }
        });
      };
      if (error) throw new Error(error);
      return { loading, karmas, subscribeToMore, loadMoreRows };
    }
  }),
  graphql(DELETE_KARMA, {
    props: ({ mutate }) => ({
      deleteKarma: id => {
        mutate({
          variables: { id },
          optimisticResponse: {
            __typename: 'Mutation',
            deleteKarma: {
              id: id,
              __typename: 'Karma'
            }
          },
          updateQueries: {
            posts: (prev, { mutationResult: { data: { deleteKarma } } }) => {
              return DeleteKarma(prev, deleteKarma.id);
            }
          }
        });
      }
    })
  })
)(Karma);
