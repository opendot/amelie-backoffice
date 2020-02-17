import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import store from './state';
import AppRoutes from './components/AppRoutes';
import Navbar from './components/Navbar';
import GlobalErrors from './components/GlobalErrors';

const App = () => (
  <Provider store={store}>
    <Router basename={process.env.PUBLIC_URL}>
      <React.Fragment>
        <Navbar />
        <AppRoutes />
        <GlobalErrors/>
      </React.Fragment>
    </Router>
  </Provider>
);

export default App;
