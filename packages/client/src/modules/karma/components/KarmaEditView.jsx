import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, Text, View } from 'react-native';

import KarmaForm from './KarmaForm';

const onSubmit = (karma, addKarma, editKarma) => values => {
  if (karma) {
    editKarma(karma.id, values.title, values.content);
  } else {
    addKarma(values.title, values.content);
  }
};

const KarmaEditView = ({ loading, karma, navigation, subscribeToMore, addKarma, editKarma }) => {
  let karmaObj = karma;
  console.log('KarmaEditView', 'KarmaEditView', 'subscribeToMore', subscribeToMore);

  // if new karma was just added read it from router
  if (!karmaObj && navigation.state) {
    karmaObj = navigation.state.params.karma;
  }

  if (loading && !karmaObj) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  } else {
    return (
      <View style={styles.container}>
        <KarmaForm onSubmit={onSubmit(karmaObj, addKarma, editKarma)} initialValues={karmaObj ? karmaObj : {}} />
      </View>
    );
  }
};

KarmaEditView.propTypes = {
  loading: PropTypes.bool.isRequired,
  karma: PropTypes.object,
  addKarma: PropTypes.func.isRequired,
  editKarma: PropTypes.func.isRequired,
  navigation: PropTypes.object.isRequired,
  subscribeToMore: PropTypes.func.isRequired
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column'
  }
});

export default KarmaEditView;
