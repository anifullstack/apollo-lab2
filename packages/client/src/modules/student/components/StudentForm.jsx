import React from 'react';
import PropTypes from 'prop-types';
import { withFormik } from 'formik';
import Field from '../../../utils/FieldAdapter';
import { FormView, RenderField, FormButton } from '../../common/components/native';
import { required, validateForm } from '../../../../../common/validation';

const studentFormSchema = {
  title: [required],
  firstName: [required],
  lastName: [required],
  content: [required]
};

const validate = values => validateForm(values, studentFormSchema);

const StudentForm = ({ values, handleSubmit, valid, onSubmit, handleChange }) => {
  
  return (
    <FormView>
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
        label="firstName"
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
      <FormButton onPress={handleSubmit(onSubmit)} disabled={!valid}>
        Save
      </FormButton>
    </FormView>
  );
};

StudentForm.propTypes = {
  handleSubmit: PropTypes.func,
  onSubmit: PropTypes.func,
  valid: PropTypes.bool,
  values: PropTypes.object,
  handleChange: PropTypes.func
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
  displayName: 'StudentForm' // helps with React DevTools
});

export default StudentFormWithFormik(StudentForm);
