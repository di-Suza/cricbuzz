import { Provider } from 'react-redux';

import AuthBootstrap from '../features/auth/store/AuthBootstrap.jsx';
import store from './store.js';

function AppProviders({ children }) {
  return (
    <Provider store={store}>
      <AuthBootstrap>{children}</AuthBootstrap>
    </Provider>
  );
}

export default AppProviders;
