import React from 'react';
import PropTypes from 'prop-types';
import { graphql, compose } from 'react-apollo';

import StudentEditView from '../components/StudentEditView';
import { AddStudent } from './Student';

import STUDENT_QUERY from '../graphql/StudentQuery.graphql';
import ADD_STUDENT from '../graphql/AddStudent.graphql';
import EDIT_STUDENT from '../graphql/EditStudent.graphql';
import STUDENT_SUBSCRIPTION from '../graphql/StudentSubscription.graphql';

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
      document: STUDENT_SUBSCRIPTION,
      variables: { id: studentId }
    });
  };

  render() {
    return <StudentEditView {...this.props} />;
  }
}

export default compose(
  graphql(STUDENT_QUERY, {
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
  graphql(ADD_STUDENT, {
    props: ({ ownProps: { history, navigation }, mutate }) => ({
      addStudent: async (title, firstName, lastName, content) => {
        let studentData = await mutate({
          variables: { input: { title, firstName, lastName, content } },
          optimisticResponse: {
            __typename: 'Mutation',
            addStudent: {
              __typename: 'Student',
              id: null,
              title: title,
              firstName: firstName,
              lastName: lastName,
              content: content,
              journals: []
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
  graphql(EDIT_STUDENT, {
    props: ({ ownProps: { history, navigation }, mutate }) => ({
      editStudent: async (id, title, firstName, lastName, content) => {
        await mutate({
          variables: { input: { id, title, firstName, lastName, content } }
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
