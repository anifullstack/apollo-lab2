import React from 'react';
import PropTypes from 'prop-types';
import { withFormik } from 'formik';
import Field from '../../../utils/FieldAdapter';
import { FormView, RenderField, FormButton } from '../../common/components/native';
import { required, validateForm } from '../../../../../common/validation';

const journalFormSchema = {
  subject: [required],
  activity: [required],
  content: [required]
};

const validate = values => validateForm(values, journalFormSchema);

const StudentJournalForm = ({ values, handleSubmit, initialValues, handleChange }) => {
  let operation = 'Add';
  if (initialValues.id !== null) {
    operation = 'Edit';
  }

  return (
    <FormView>
      <Field name="subject" component={RenderField} type="text" value={values.subject} onChange={handleChange} />
      <Field name="activity" component={RenderField} type="text" value={values.activity} onChange={handleChange} />
      <Field name="content" component={RenderField} type="text" value={values.content} onChange={handleChange} />
      <FormButton onPress={handleSubmit}>{operation}</FormButton>
    </FormView>
  );
};

StudentJournalForm.propTypes = {
  handleSubmit: PropTypes.func,
  handleChange: PropTypes.func,
  initialValues: PropTypes.object,
  onSubmit: PropTypes.func,
  submitting: PropTypes.bool,
  values: PropTypes.object
};

const StudentJournalFormWithFormik = withFormik({
  mapPropsToValues: props => ({
    content: (props.journal && props.journal.content) || ''
  }),
  validate: values => validate(values),
  handleSubmit: function(values, { props: { onSubmit } }) {
    onSubmit(values);
  },
  displayName: 'JournalForm', // helps with React DevTools
  enableReinitialize: true
});

export default StudentJournalFormWithFormik(StudentJournalForm);
