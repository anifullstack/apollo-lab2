import React from 'react';
import PropTypes from 'prop-types';
import { graphql, compose } from 'react-apollo';

import StudentEditView from '../components/StudentEditView';
import { AddStudent } from './Student';

import POST_QUERY from '../graphql/StudentQuery.graphql';
import ADD_POST from '../graphql/AddStudent.graphql';
import EDIT_POST from '../graphql/EditStudent.graphql';
import POST_SUBSCRIPTION from '../graphql/StudentSubscription.graphql';

class StudentEdit extends React.Component {
  static propTypes = {
    loading: PropTypes.bool.isRequired,
    student: PropTypes.object,
    subscribeToMore: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.subscription = null;
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.loading) {
      // Check if props have changed and, if necessary, stop the subscription
      if (this.subscription && this.props.student.id !== nextProps.student.id) {
        this.subscription();
        this.subscription = null;
      }

      // Subscribe or re-subscribe
      if (!this.subscription && nextProps.student) {
        this.subscribeToStudentEdit(nextProps.student.id);
      }
    }
  }

  componentWillUnmount() {
    if (this.subscription) {
      // unsubscribe
      this.subscription();
    }
  }

  subscribeToStudentEdit = studentId => {
    const { subscribeToMore } = this.props;

    this.subscription = subscribeToMore({
      document: POST_SUBSCRIPTION,
      variables: { id: studentId }
    });
  };

  render() {
    return <StudentEditView {...this.props} />;
  }
}

export default compose(
  graphql(POST_QUERY, {
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
    props({ data: { loading, error, student, subscribeToMore } }) {
      if (error) throw new Error(error);
      return { loading, student, subscribeToMore };
    }
  }),
  graphql(ADD_POST, {
    props: ({ ownProps: { history, navigation }, mutate }) => ({
      addStudent: async (title, content) => {
        let studentData = await mutate({
          variables: { input: { title, content } },
          optimisticResponse: {
            __typename: 'Mutation',
            addStudent: {
              __typename: 'Student',
              id: null,
              title: title,
              content: content,
              notes: []
            }
          },
          updateQueries: {
            students: (prev, { mutationResult: { data: { addStudent } } }) => {
              return AddStudent(prev, addStudent);
            }
          }
        });

        if (history) {
          return history.push('/student/' + studentData.data.addStudent.id, {
            student: studentData.data.addStudent
          });
        } else if (navigation) {
          return navigation.setParams({
            id: studentData.data.addStudent.id,
            student: studentData.data.addStudent
          });
        }
      }
    })
  }),
  graphql(EDIT_POST, {
    props: ({ ownProps: { history, navigation }, mutate }) => ({
      editStudent: async (id, title, content) => {
        await mutate({
          variables: { input: { id, title, content } }
        });
        if (history) {
          return history.push('/students');
        }
        if (navigation) {
          return navigation.goBack();
        }
      }
    })
  })
)(StudentEdit);