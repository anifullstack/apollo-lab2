import React from 'react';
import PropTypes from 'prop-types';
import { withFormik } from 'formik';
import Field from '../../../utils/FieldAdapter';
import { Form, RenderField, Button } from '../../common/components/web';
import { required, validateForm } from '../../../../../common/validation';

const karmaFormSchema = {
  title: [required],
  content: [required]
};

const validate = values => validateForm(values, karmaFormSchema);

const KarmaForm = ({ values, handleSubmit, submitting, handleChange }) => {
  return (
    <Form name="karma" onSubmit={handleSubmit}>
      <Field
        name="title"
        component={RenderField}
        type="text"
        label="Title"
        value={values.title}
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

KarmaForm.propTypes = {
  handleSubmit: PropTypes.func,
  handleChange: PropTypes.func,
  onSubmit: PropTypes.func,
  submitting: PropTypes.bool,
  values: PropTypes.object,
  post: PropTypes.object
};

const KarmaFormWithFormik = withFormik({
  mapPropsToValues: props => ({
    title: (props.karma && props.karma.title) || '',
    content: (props.karma && props.karma.content) || ''
  }),
  validate: values => validate(values),
  handleSubmit(values, { props: { onSubmit } }) {
    onSubmit(values);
  },
  enableReinitialize: true,
  displayName: 'KarmaForm' // helps with React DevTools
});

export default KarmaFormWithFormik(KarmaForm);
