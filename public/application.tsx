import React from 'react';
import ReactDOM from 'react-dom';
import { AppMountParameters, CoreStart } from '../../../src/core/public';
import { AppPluginStartDependencies } from './types';

// Import the ClusterResourceMonitor component
import ClusterResourceMonitor from './components/app';

export const renderApp = (
  { notifications, http }: CoreStart,
  { navigation }: AppPluginStartDependencies,
  { appBasePath, element }: AppMountParameters
) => {
  // Render the application
  ReactDOM.render(
    <div style={{ padding: '20px' }}>
      <h1>Resource Manager</h1>
      {/* Pass the 'coreStart' object as a prop to ClusterResourceMonitor */}
      <ClusterResourceMonitor coreStart={{ notifications, http }} />
    </div>,
    element
  );

  return () => ReactDOM.unmountComponentAtNode(element);
};