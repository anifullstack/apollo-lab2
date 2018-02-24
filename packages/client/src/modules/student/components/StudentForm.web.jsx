import React from 'react';
import PropTypes from 'prop-types';
import { withFormik } from 'formik';
import Field from '../../../utils/FieldAdapter';
import { Form, RenderField, Button } from '../../common/components/web';
import { required, validateForm } from '../../../../../common/validation';

const studentFormSchema = {
  title: [required],
  content: [required],
  firstName: [required],
  lastName: [required]
};

const validate = values => validateForm(values, studentFormSchema);

const StudentForm = ({ values, handleSubmit, submitting, handleChange }) => {
  console.log("StudentForm", "values", values);
  return (
    <Form name="student" onSubmit={handleSubmit}>
      <Field
        name="title"
        component={RenderField}
        type="text"
        label="Title"
        value={values.title}
        onChange={handleChange}
      />
      <Field
        name="firstName"
        component={RenderField}
        type="text"
        label="First Name"
        value={values.firstName}
        onChange={handleChange}
      />
      <Field
        name="lastName"
        component={RenderField}
        type="text"
        label="Last Name"
        value={values.lastName}
        onChange={handleChange}
      />
      <Field
        name="content"
        component={RenderField}
        type="text"
        label="Content"
        value={values.content}
        onChange={handleChange}
      />

      <Button color="primary" type="submit" disabled={submitting}>
        Save
      </Button>
    </Form>
  );
};

StudentForm.propTypes = {
  handleSubmit: PropTypes.func,
  handleChange: PropTypes.func,
  onSubmit: PropTypes.func,
  submitting: PropTypes.bool,
  values: PropTypes.object,
  student: PropTypes.object
};

const StudentFormWithFormik = withFormik({
  mapPropsToValues: props => ({
    title: (props.student && props.student.title) || '',
    firstName: (props.student && props.student.firstName) || '',
    lastName: (props.student && props.student.lastName) || '',
    content: (props.student && props.student.content) || ''
  }),
  validate: values => validate(values),
  handleSubmit(values, { props: { onSubmit } }) {
    onSubmit(values);
  },
  enableReinitialize: true,
  displayName: 'StudentForm' // helps with React DevTools
});

export default StudentFormWithFormik(StudentForm);
