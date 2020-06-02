import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import router from './router';
import Layout from './components/Layout';
window.routes = router;
function App() {
  return (
    <Layout>
      <Switch>
        {router.map((route, key) => (
          <Route
            key={key}
            exact={route?.exact}
            path={route?.path}
            component={route?.component}
          />
        ))}
        <Route
          path="/"
          component={() => <Redirect from="/" to="/dashboard" />}
        />
        <Route
          path="*"
          component={() => (
            <div>
              <h1>Not found</h1>
            </div>
          )}
        />
      </Switch>
    </Layout>
  );
}

export default App;
