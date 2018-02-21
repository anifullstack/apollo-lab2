import React from 'react';
import { Route, NavLink } from 'react-router-dom';
import { MenuItem } from '../../modules/common/components/web';

import Karma from './containers/Karma';
import KarmaEdit from './containers/KarmaEdit';

//import resolvers from './resolvers';

import Feature from '../connector';

export default new Feature({
  route: [<Route exact path="/karmas" component={Karma} />, <Route exact path="/karma/:id" component={KarmaEdit} />],
  navItem: (
    <MenuItem key="/karmas">
      <NavLink to="/karmas" className="nav-link" activeClassName="active">
        Karmas
      </NavLink>
    </MenuItem>
  )
  //resolver: resolvers
});
