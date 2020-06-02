import Dashboard from '../pages/Dashboard';
import Details from '../pages/Details';

const routes = [
  {
    name: 'Dashboard',
    component: Dashboard,
    path: '/dashboard',
    exact: true,
  },
  {
    name: 'Details',
    component: Details,
    path: '/details',
    exact: false,
  },
];

export default routes;
