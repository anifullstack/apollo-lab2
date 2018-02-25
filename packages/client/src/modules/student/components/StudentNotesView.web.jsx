import React from 'react';
import PropTypes from 'prop-types';
import { Table, Button } from '../../common/components/web';
import StudentNoteForm from './StudentNoteForm';

export default class StudentNotesView extends React.PureComponent {
  static propTypes = {
    studentId: PropTypes.number.isRequired,
    notes: PropTypes.array.isRequired,
    note: PropTypes.object,
    addNote: PropTypes.func.isRequired,
    editNote: PropTypes.func.isRequired,
    deleteNote: PropTypes.func.isRequired,
    subscribeToMore: PropTypes.func.isRequired,
    onNoteSelect: PropTypes.func.isRequired
  };

  handleEditNote = (id, subject, activity, content) => {
    const { onNoteSelect } = this.props;
    onNoteSelect({ id, subject, activity, content });
  };

  handleDeleteNote = id => {
    const { note, onNoteSelect, deleteNote } = this.props;

    if (note.id === id) {
      onNoteSelect({ id: null, subject: '', activity: '', content: '' });
    }

    deleteNote(id);
  };

  onSubmit = () => values => {
    const { note, studentId, addNote, editNote, onNoteSelect } = this.props;

    if (note.id === null) {
      addNote(values.subject, values.activity, values.content, studentId);
    } else {
      editNote(note.id, values.subject, values.activity, values.content);
    }

    onNoteSelect({ id: null, subject: '', activity: '', content: '' });
  };

  render() {
    const { studentId, notes, note } = this.props;
    const columns = [
      {
        title: 'subject',
        dataIndex: 'subject',
        key: 'subject'
      },
      {
        title: 'activity',
        dataIndex: 'activity',
        key: 'activity'
      },
      {
        title: 'Content',
        dataIndex: 'content',
        key: 'content'
      },
      {
        title: 'Actions',
        key: 'actions',
        width: 120,
        render: (text, record) => (
          <div style={{ width: 120 }}>
            <Button
              color="primary"
              size="sm"
              className="edit-note"
              onClick={() => this.handleEditNote(record.id, record.content)}
            >
              Edit
            </Button>{' '}
            <Button color="primary" size="sm" className="delete-note" onClick={() => this.handleDeleteNote(record.id)}>
              Delete
            </Button>
          </div>
        )
      }
    ];

    return (
      <div>
        <h3>Notes</h3>
        <StudentNoteForm studentId={studentId} onSubmit={this.onSubmit()} initialValues={note} note={note} />
        <h1 />
        <Table dataSource={notes} columns={columns} />
      </div>
    );
  }
}
