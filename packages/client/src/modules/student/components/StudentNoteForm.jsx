import React from 'react';
import PropTypes from 'prop-types';
import { withFormik } from 'formik';
import Field from '../../../utils/FieldAdapter';
import { FormView, RenderField, FormButton } from '../../common/components/native';
import { required, validateForm } from '../../../../../common/validation';

const noteFormSchema = {
  content: [required]
};

const validate = values => validateForm(values, noteFormSchema);

const StudentNoteForm = ({ values, handleSubmit, initialValues, handleChange }) => {
  let operation = 'Add';
  if (initialValues.id !== null) {
    operation = 'Edit';
  }

  return (
    <FormView>
      <Field name="content" component={RenderField} type="text" value={values.content} onChange={handleChange} />
      <FormButton onPress={handleSubmit}>{operation}</FormButton>
    </FormView>
  );
};

StudentNoteForm.propTypes = {
  handleSubmit: PropTypes.func,
  handleChange: PropTypes.func,
  initialValues: PropTypes.object,
  onSubmit: PropTypes.func,
  submitting: PropTypes.bool,
  values: PropTypes.object
};

const StudentNoteFormWithFormik = withFormik({
  mapPropsToValues: props => ({ content: (props.note && props.note.content) || '' }),
  validate: values => validate(values),
  handleSubmit: function(values, { props: { onSubmit } }) {
    onSubmit(values);
  },
  displayName: 'NoteForm', // helps with React DevTools
  enableReinitialize: true
});

export default StudentNoteFormWithFormik(StudentNoteForm);
