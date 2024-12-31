import './index.scss';

import { ResourceManagerPlugin } from './plugin';

// This exports static code and TypeScript types,
// as well as, OpenSearch Dashboards Platform `plugin()` initializer.
export function plugin() {
  return new ResourceManagerPlugin();
}
export { ResourceManagerPluginSetup, ResourceManagerPluginStart } from './types';
