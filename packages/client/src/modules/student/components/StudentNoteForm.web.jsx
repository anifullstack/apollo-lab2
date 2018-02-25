import React from 'react';
import PropTypes from 'prop-types';
import { withFormik } from 'formik';
import Field from '../../../utils/FieldAdapter';
import { Form, RenderField, Row, Col, Label, Button } from '../../common/components/web';
import { required, validateForm } from '../../../../../common/validation';

const noteFormSchema = {
  subject: [required],
  activity: [required],
  content: [required]
};

const validate = values => validateForm(values, noteFormSchema);

const StudentNoteForm = ({ values, handleSubmit, initialValues, handleChange }) => {
  return (
    <Form name="note" onSubmit={handleSubmit}>
      <Row>
        <Col xs={2}>
          <Label>{initialValues.id === null ? 'Add note' : 'Edit note'}</Label>
        </Col>
        <Col xs={8}>
          <Field name="subject" component={RenderField} type="text" value={values.subject} onChange={handleChange} />
          <Field name="activity" component={RenderField} type="text" value={values.activity} onChange={handleChange} />
          <Field name="content" component={RenderField} type="text" value={values.content} onChange={handleChange} />
        </Col>
        <Col xs={2}>
          <Button color="primary" type="submit" className="float-right">
            Save
          </Button>
        </Col>
      </Row>
    </Form>
  );
};

StudentNoteForm.propTypes = {
  handleSubmit: PropTypes.func,
  handleChange: PropTypes.func,
  initialValues: PropTypes.object,
  onSubmit: PropTypes.func,
  submitting: PropTypes.bool,
  values: PropTypes.object,
  content: PropTypes.string,
  changeContent: PropTypes.func
};

const StudentNoteFormWithFormik = withFormik({
  mapPropsToValues: props => ({
    subject: (props.note && props.note.subject) || '',
    activity: (props.note && props.note.activity) || '',
    content: (props.note && props.note.content) || ''
  }),
  async handleSubmit(values, { resetForm, props: { onSubmit } }) {
    await onSubmit(values);
    resetForm({ content: '' });
  },
  validate: values => validate(values),
  displayName: 'NoteForm', // helps with React DevTools,
  enableReinitialize: true
});

export default StudentNoteFormWithFormik(StudentNoteForm);
