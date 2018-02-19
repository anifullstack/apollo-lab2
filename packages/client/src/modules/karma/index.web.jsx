import React from 'react';
import { Route, NavLink } from 'react-router-dom';
import { MenuItem } from '../../modules/common/components/web';
import Karma from './containers/Karma';
import reducers from './reducers';

import Feature from '../connector';

export default new Feature({
  route: <Route exact path="/karma" component={Karma} />,
  navItem: (
    <MenuItem key="karma">
      <NavLink to="/karma" className="nav-link" activeClassName="active">
        Karma
      </NavLink>
    </MenuItem>
  ),
  reducer: { karma: reducers }
});
