import React from 'react';
import PropTypes from 'prop-types';
import { graphql, compose } from 'react-apollo';
import update from 'immutability-helper';

import StudentNotesView from '../components/StudentNotesView';

import ADD_COMMENT from '../graphql/AddNote.graphql';
import EDIT_COMMENT from '../graphql/EditNote.graphql';
import DELETE_COMMENT from '../graphql/DeleteNote.graphql';
import COMMENT_SUBSCRIPTION from '../graphql/NoteSubscription.graphql';
import ADD_COMMENT_CLIENT from '../graphql/AddNote.client.graphql';
import COMMENT_QUERY_CLIENT from '../graphql/NoteQuery.client.graphql';

function AddNote(prev, node) {
  // ignore if duplicate
  if (node.id !== null && prev.student.notes.some(note => node.id !== null && node.id === note.id)) {
    return prev;
  }

  return update(prev, {
    student: {
      notes: {
        $push: [node]
      }
    }
  });
}

function DeleteNote(prev, id) {
  const index = prev.student.notes.findIndex(x => x.id === id);

  // ignore if not found
  if (index < 0) {
    return prev;
  }

  return update(prev, {
    student: {
      notes: {
        $splice: [[index, 1]]
      }
    }
  });
}

class StudentNotes extends React.Component {
  static propTypes = {
    studentId: PropTypes.number.isRequired,
    notes: PropTypes.array.isRequired,
    note: PropTypes.object.isRequired,
    onNoteSelect: PropTypes.func.isRequired,
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
      this.subscribeToNoteList(nextProps.studentId);
    }
  }

  componentWillUnmount() {
    this.props.onNoteSelect({ id: null, content: '' });

    if (this.subscription) {
      // unsubscribe
      this.subscription();
    }
  }

  subscribeToNoteList = studentId => {
    const { subscribeToMore } = this.props;

    this.subscription = subscribeToMore({
      document: COMMENT_SUBSCRIPTION,
      variables: { studentId },
      updateQuery: (prev, { subscriptionData: { data: { noteUpdated: { mutation, id, node } } } }) => {
        let newResult = prev;

        if (mutation === 'CREATED') {
          newResult = AddNote(prev, node);
        } else if (mutation === 'DELETED') {
          newResult = DeleteNote(prev, id);
        }

        return newResult;
      }
    });
  };

  render() {
    return <StudentNotesView {...this.props} />;
  }
}

const StudentNotesWithApollo = compose(
  graphql(ADD_COMMENT, {
    props: ({ mutate }) => ({
      addNote: (content, studentId) =>
        mutate({
          variables: { input: { content, studentId } },
          optimisticResponse: {
            __typename: 'Mutation',
            addNote: {
              __typename: 'Note',
              id: null,
              content: content
            }
          },
          updateQueries: {
            student: (prev, { mutationResult: { data: { addNote } } }) => {
              if (prev.student) {
                prev.student.notes = prev.student.notes.filter(note => note.id);
                return AddNote(prev, addNote);
              }
            }
          }
        })
    })
  }),
  graphql(EDIT_COMMENT, {
    props: ({ ownProps: { studentId }, mutate }) => ({
      editNote: (id, content) =>
        mutate({
          variables: { input: { id, studentId, content } },
          optimisticResponse: {
            __typename: 'Mutation',
            editNote: {
              __typename: 'Note',
              id: id,
              content: content
            }
          }
        })
    })
  }),
  graphql(DELETE_COMMENT, {
    props: ({ ownProps: { studentId }, mutate }) => ({
      deleteNote: id =>
        mutate({
          variables: { input: { id, studentId } },
          optimisticResponse: {
            __typename: 'Mutation',
            deleteNote: {
              __typename: 'Note',
              id: id
            }
          },
          updateQueries: {
            student: (prev, { mutationResult: { data: { deleteNote } } }) => {
              if (prev.student) {
                return DeleteNote(prev, deleteNote.id);
              }
            }
          }
        })
    })
  }),
  graphql(ADD_COMMENT_CLIENT, {
    props: ({ mutate }) => ({
      onNoteSelect: note => {
        mutate({ variables: { note: note } });
      }
    })
  }),
  graphql(COMMENT_QUERY_CLIENT, {
    props: ({ data: { note } }) => ({ note })
  })
)(StudentNotes);

export default StudentNotesWithApollo;
