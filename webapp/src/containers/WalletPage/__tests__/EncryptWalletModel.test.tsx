import React from 'react';
import EncryptWalletModel from '../components/EncryptWalletPage/index';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from '../../../app/rootStore';
import Enzyme from '../../../utils/testUtils/enzyme';

describe('EncryptWalletPage component', () => {
  it('should check for snapshot', () => {
    const wrapper = Enzyme.mount(
      <Router>
        <Provider store={store}>
          <EncryptWalletModel />
        </Provider>
      </Router>
    );
    expect(wrapper).toMatchSnapshot();
  });
});
