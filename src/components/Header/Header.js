import React from 'react';
import { withRouter, Link } from 'react-router-dom';
import './Header.scss';

import Search20 from '@carbon/icons-react/lib/search/20';
import Notification20 from '@carbon/icons-react/lib/notification/20';
import AppSwitcher20 from '@carbon/icons-react/lib/app-switcher/20';
import {
  Header as CarbonHeader,
  HeaderName,
  HeaderGlobalAction,
  HeaderGlobalBar,
  HeaderNavigation,
  HeaderMenuItem,
} from 'carbon-components-react/lib/components/UIShell';

const Header = ({ location }) => {
  return (
    <CarbonHeader aria-label="IBM Security">
      <HeaderName element={Link} to="/dashboard" prefix="IBM | ">
        {window.routes.find(({ path }) => path === location.pathname)?.name ||
          'Dashboard'}
      </HeaderName>
      <HeaderNavigation aria-label="IBM Security">
        {window.routes.map((route, key) => (
          <HeaderMenuItem element={Link} to={route.path} key={key}>
            {route.name}
          </HeaderMenuItem>
        ))}
      </HeaderNavigation>
      <HeaderGlobalBar>
        <HeaderGlobalAction aria-label="Search" onClick={() => {}}>
          <Search20 />
        </HeaderGlobalAction>
        <HeaderGlobalAction aria-label="Notifications" onClick={() => {}}>
          <Notification20 />
        </HeaderGlobalAction>
        <HeaderGlobalAction aria-label="App Switcher" onClick={() => {}}>
          <AppSwitcher20 />
        </HeaderGlobalAction>
      </HeaderGlobalBar>
    </CarbonHeader>
  );
};

export default withRouter(Header);
