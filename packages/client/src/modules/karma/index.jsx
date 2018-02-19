import { Ionicons } from '@expo/vector-icons';
import { createTabBarIconWrapper } from '../common/components/native';
import Karma from './containers/Karma';
import reducers from './reducers';

import Feature from '../connector';

export default new Feature({
  tabItem: {
    Karma: {
      screen: Karma,
      navigationOptions: {
        tabBarIcon: createTabBarIconWrapper(Ionicons, {
          name: 'ios-browsers-outline',
          size: 30
        })
      }
    }
  },
  reducer: { karma: reducers }
});
