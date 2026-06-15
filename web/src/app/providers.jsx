import { Provider } from 'react-redux';

import AuthBootstrap from '../features/auth/store/AuthBootstrap.jsx';
import { ToastProvider } from '../shared/components/ToastProvider.jsx';
import store from './store.js';

function AppProviders({ children }) {
  return (
    <Provider store={store}>
      <ToastProvider>
        <AuthBootstrap>{children}</AuthBootstrap>
      </ToastProvider>
    </Provider>
  );
}

export default AppProviders;
