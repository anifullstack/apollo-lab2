import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, FlatList, Text, View, ScrollView, Keyboard } from 'react-native';
import { SwipeAction } from '../../common/components/native';

import StudentJournalForm from './StudentJournalForm';

export default class StudentJournalsView extends React.PureComponent {
  static propTypes = {
    studentId: PropTypes.number.isRequired,
    journals: PropTypes.array.isRequired,
    journal: PropTypes.object,
    addJournal: PropTypes.func.isRequired,
    editJournal: PropTypes.func.isRequired,
    deleteJournal: PropTypes.func.isRequired,
    subscribeToMore: PropTypes.func.isRequired,
    onJournalSelect: PropTypes.func.isRequired
  };

  keyExtractor = item => item.id;

  renderItem = ({ item: { id, subject, activity, content } }) => {
    const { journal, deleteJournal, onJournalSelect } = this.props;
    return (
      <SwipeAction
        onPress={() =>
          onJournalSelect({
            id: id,
            subject: subject,
            activity: activity,
            content: content
          })
        }
        right={{
          text: 'Delete',
          onPress: () => this.onJournalDelete(journal, deleteJournal, onJournalSelect, id)
        }}
      >
        {content}
      </SwipeAction>
    );
  };

  onJournalDelete = (journal, deleteJournal, onJournalSelect, id) => {
    if (journal.id === id) {
      onJournalSelect({ id: null, subject: '', activity: '', content: '' });
    }

    deleteJournal(id);
  };

  onSubmit = (journal, studentId, addJournal, editJournal, onJournalSelect) => values => {
    if (journal.id === null) {
      addJournal(values.subject, values.activity, values.content, studentId);
    } else {
      editJournal(journal.id, values.subject, values.activity, values.content);
    }

    onJournalSelect({ id: null, subject: '', activity: '', content: '' });
    Keyboard.dismiss();
  };

  render() {
    const { studentId, journal, addJournal, editJournal, journals } = this.props;

    return (
      <View>
        <Text style={styles.title}>Journals</Text>
        <StudentJournalForm
          studentId={studentId}
          onSubmit={this.onSubmit(journal, studentId, addJournal, editJournal)}
          initialValues={journal}
        />
        {journals.length > 0 && (
          <ScrollView style={styles.list} keyboardDismissMode="on-drag">
            <FlatList data={journals} keyExtractor={this.keyExtractor} renderItem={this.renderItem} />
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
