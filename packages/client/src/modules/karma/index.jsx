import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-native';
import { StackNavigator } from 'react-navigation';
import { Ionicons } from '@expo/vector-icons';

import { createTabBarIconWrapper } from '../common/components/native';

import Karma from './containers/Karma';
import KarmaEdit from './containers/KarmaEdit';

import resolvers from './resolvers';

import Feature from '../connector';

class KarmaListScreen extends React.Component {
  static navigationOptions = ({ navigation }) => ({
    title: 'Karma list',
    headerRight: <Button title="Add" onPress={() => navigation.navigate('KarmaEdit', { id: 0 })} />
  });
  render() {
    return <Karma navigation={this.props.navigation} />;
  }
}

KarmaListScreen.propTypes = {
  navigation: PropTypes.object
};

class KarmaEditScreen extends React.Component {
  static navigationOptions = ({ navigation }) => ({
    title: `${navigation.state.params.id === 0 ? 'Create' : 'Edit'} karma`
  });
  render() {
    return <KarmaEdit navigation={this.props.navigation} />;
  }
}

KarmaEditScreen.propTypes = {
  navigation: PropTypes.object
};

const KarmaNavigator = StackNavigator({
  KarmaList: { screen: KarmaListScreen },
  KarmaEdit: { screen: KarmaEditScreen }
});

export default new Feature({
  tabItem: {
    Karma: {
      screen: KarmaNavigator,
      navigationOptions: {
        tabBarIcon: createTabBarIconWrapper(Ionicons, {
          name: 'ios-book-outline',
          size: 30
        })
      }
    }
  },
  resolver: resolvers
});
