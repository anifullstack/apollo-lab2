import React from 'react';
import PropTypes from 'prop-types';
import { graphql, compose } from 'react-apollo';

import KarmaEditView from '../components/KarmaEditView';
import { AddKarma } from './Karma';

import KARMA_QUERY from '../graphql/KarmaQuery.graphql';
import ADD_KARMA from '../graphql/AddKarma.graphql';
import EDIT_KARMA from '../graphql/EditKarma.graphql';
import KARMA_SUBSCRIPTION from '../graphql/KarmaSubscription.graphql';

class KarmaEdit extends React.Component {
  static propTypes = {
    loading: PropTypes.bool.isRequired,
    karma: PropTypes.object,
    subscribeToMore: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.subscription = null;
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.loading) {
      // Check if props have changed and, if necessary, stop the subscription
      if (this.subscription && this.props.karma.id !== nextProps.karma.id) {
        this.subscription();
        this.subscription = null;
      }

      // Subscribe or re-subscribe
      if (!this.subscription && nextProps.karma) {
        this.subscribeToKarmaEdit(nextProps.karma.id);
      }
    }
  }

  componentWillUnmount() {
    if (this.subscription) {
      // unsubscribe
      this.subscription();
    }
  }

  subscribeToKarmaEdit = karmaId => {
    const { subscribeToMore } = this.props;

    this.subscription = subscribeToMore({
      document: KARMA_SUBSCRIPTION,
      variables: { id: karmaId }
    });
  };

  render() {
    return <KarmaEditView {...this.props} />;
  }
}

export default compose(
  graphql(KARMA_QUERY, {
    options: props => {
      let id = 0;
      if (props.match) {
        id = props.match.params.id;
      } else if (props.navigation) {
        id = props.navigation.state.params.id;
      }

      return {
        variables: { id }
      };
    },
    props({ data: { loading, error, karma, subscribeToMore } }) {
      if (error) throw new Error(error);
      return { loading, karma, subscribeToMore };
    }
  }),
  graphql(ADD_KARMA, {
    props: ({ ownProps: { history, navigation }, mutate }) => ({
      addKarma: async (title, content) => {
        let karmaData = await mutate({
          variables: { input: { title, content } },
          optimisticResponse: {
            __typename: 'Mutation',
            addKarma: {
              __typename: 'Karma',
              id: null,
              title: title,
              content: content,
              comments: []
            }
          },
          updateQueries: {
            karmas: (prev, { mutationResult: { data: { addKarma } } }) => {
              return AddKarma(prev, addKarma);
            }
          }
        });

        if (history) {
          return history.push('/karma/' + karmaData.data.addKarma.id, {
            karma: karmaData.data.addKarma
          });
        } else if (navigation) {
          return navigation.setParams({
            id: karmaData.data.addKarma.id,
            karma: karmaData.data.addKarma
          });
        }
      }
    })
  }),
  graphql(EDIT_KARMA, {
    props: ({ ownProps: { history, navigation }, mutate }) => ({
      editKarma: async (id, title, content) => {
        await mutate({
          variables: { input: { id, title, content } }
        });
        if (history) {
          return history.push('/karmas');
        }
        if (navigation) {
          return navigation.goBack();
        }
      }
    })
  })
)(KarmaEdit);
