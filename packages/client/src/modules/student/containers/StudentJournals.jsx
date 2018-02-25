import React from 'react';
import PropTypes from 'prop-types';
import { graphql, compose } from 'react-apollo';
import update from 'immutability-helper';

import StudentJournalsView from '../components/StudentJournalsView';

import ADD_COMMENT from '../graphql/AddJournal.graphql';
import EDIT_COMMENT from '../graphql/EditJournal.graphql';
import DELETE_COMMENT from '../graphql/DeleteJournal.graphql';
import COMMENT_SUBSCRIPTION from '../graphql/JournalSubscription.graphql';
import ADD_COMMENT_CLIENT from '../graphql/AddJournal.client.graphql';
import COMMENT_QUERY_CLIENT from '../graphql/JournalQuery.client.graphql';

function AddJournal(prev, node) {
  // ignore if duplicate
  if (node.id !== null && prev.student.journals.some(journal => node.id !== null && node.id === journal.id)) {
    return prev;
  }

  return update(prev, {
    student: {
      journals: {
        $push: [node]
      }
    }
  });
}

function DeleteJournal(prev, id) {
  const index = prev.student.journals.findIndex(x => x.id === id);

  // ignore if not found
  if (index < 0) {
    return prev;
  }

  return update(prev, {
    student: {
      journals: {
        $splice: [[index, 1]]
      }
    }
  });
}

class StudentJournals extends React.Component {
  static propTypes = {
    studentId: PropTypes.number.isRequired,
    journals: PropTypes.array.isRequired,
    journal: PropTypes.object.isRequired,
    onJournalSelect: PropTypes.func.isRequired,
    subscribeToMore: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.subscription = null;
  }

  componentWillReceiveProps(nextProps) {
    // Check if props have changed and, if necessary, stop the subscription
    if (this.subscription && this.props.studentId !== nextProps.studentId) {
      this.subscription = null;
    }

    // Subscribe or re-subscribe
    if (!this.subscription) {
      this.subscribeToJournalList(nextProps.studentId);
    }
  }

  componentWillUnmount() {
    this.props.onJournalSelect({
      id: null,
      subject: '',
      activity: '',
      content: ''
    });

    if (this.subscription) {
      // unsubscribe
      this.subscription();
    }
  }

  subscribeToJournalList = studentId => {
    const { subscribeToMore } = this.props;

    this.subscription = subscribeToMore({
      document: COMMENT_SUBSCRIPTION,
      variables: { studentId },
      updateQuery: (prev, { subscriptionData: { data: { journalUpdated: { mutation, id, node } } } }) => {
        let newResult = prev;

        if (mutation === 'CREATED') {
          newResult = AddJournal(prev, node);
        } else if (mutation === 'DELETED') {
          newResult = DeleteJournal(prev, id);
        }

        return newResult;
      }
    });
  };

  render() {
    return <StudentJournalsView {...this.props} />;
  }
}

const StudentJournalsWithApollo = compose(
  graphql(ADD_COMMENT, {
    props: ({ mutate }) => ({
      addJournal: (subject, activity, content, studentId) =>
        mutate({
          variables: { input: { subject, activity, content, studentId } },
          optimisticResponse: {
            __typename: 'Mutation',
            addJournal: {
              __typename: 'Journal',
              id: null,
              content: content
            }
          },
          updateQueries: {
            student: (prev, { mutationResult: { data: { addJournal } } }) => {
              if (prev.student) {
                prev.student.journals = prev.student.journals.filter(journal => journal.id);
                return AddJournal(prev, addJournal);
              }
            }
          }
        })
    })
  }),
  graphql(EDIT_COMMENT, {
    props: ({ ownProps: { studentId }, mutate }) => ({
      editJournal: (id, subject, activity, content) =>
        mutate({
          variables: { input: { id, studentId, subject, activity, content } },
          optimisticResponse: {
            __typename: 'Mutation',
            editJournal: {
              __typename: 'Journal',
              id: id,
              subject: subject,
              activity: activity,
              content: content
            }
          }
        })
    })
  }),
  graphql(DELETE_COMMENT, {
    props: ({ ownProps: { studentId }, mutate }) => ({
      deleteJournal: id =>
        mutate({
          variables: { input: { id, studentId } },
          optimisticResponse: {
            __typename: 'Mutation',
            deleteJournal: {
              __typename: 'Journal',
              id: id
            }
          },
          updateQueries: {
            student: (prev, { mutationResult: { data: { deleteJournal } } }) => {
              if (prev.student) {
                return DeleteJournal(prev, deleteJournal.id);
              }
            }
          }
        })
    })
  }),
  graphql(ADD_COMMENT_CLIENT, {
    props: ({ mutate }) => ({
      onJournalSelect: journal => {
        mutate({ variables: { journal: journal } });
      }
    })
  }),
  graphql(COMMENT_QUERY_CLIENT, {
    props: ({ data: { journal } }) => ({ journal })
  })
)(StudentJournals);

export default StudentJournalsWithApollo;
