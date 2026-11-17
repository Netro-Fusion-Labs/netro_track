/**
 * @format
 * Smoke test: Jest harness resolves React Native preset and can mount App shell.
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

jest.mock('../src/navigation/index', () => {
  const { Text } = require('react-native');
  return {
    __esModule: true,
    default: () => <Text>RootNavigator</Text>,
  };
});

jest.mock('../src/shared/utils/syncEngine', () => ({
  startSyncEngine: jest.fn(),
}));

import App from '../App';

test('renders App without crashing', async () => {
  await ReactTestRenderer.act(async () => {
    ReactTestRenderer.create(<App />);
  });
});
