import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, FlatList, Text, View, ScrollView, Keyboard } from 'react-native';
import { SwipeAction } from '../../common/components/native';

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

  keyExtractor = item => item.id;

  renderItem = ({ item: { id, subject, activity, content } }) => {
    const { note, deleteNote, onNoteSelect } = this.props;
    return (
      <SwipeAction
        onPress={() =>
          onNoteSelect({
            id: id,
            subject: subject,
            activity: activity,
            content: content
          })
        }
        right={{
          text: 'Delete',
          onPress: () => this.onNoteDelete(note, deleteNote, onNoteSelect, id)
        }}
      >
        {content}
      </SwipeAction>
    );
  };

  onNoteDelete = (note, deleteNote, onNoteSelect, id) => {
    if (note.id === id) {
      onNoteSelect({ id: null, subject: '', activity: '', content: '' });
    }

    deleteNote(id);
  };

  onSubmit = (note, studentId, addNote, editNote, onNoteSelect) => values => {
    if (note.id === null) {
      addNote(values.subject, values.activity, values.content, studentId);
    } else {
      editNote(note.id, values.subject, values.activity, values.content);
    }

    onNoteSelect({ id: null, subject: '', activity: '', content: '' });
    Keyboard.dismiss();
  };

  render() {
    const { studentId, note, addNote, editNote, notes } = this.props;

    return (
      <View>
        <Text style={styles.title}>Notes</Text>
        <StudentNoteForm
          studentId={studentId}
          onSubmit={this.onSubmit(note, studentId, addNote, editNote)}
          initialValues={note}
        />
        {notes.length > 0 && (
          <ScrollView style={styles.list} keyboardDismissMode="on-drag">
            <FlatList data={notes} keyExtractor={this.keyExtractor} renderItem={this.renderItem} />
          </ScrollView>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    margin: 10
  },
  list: {
    paddingTop: 10
  }
});
