import { i18n } from '@osd/i18n';
import { AppMountParameters, CoreSetup, CoreStart, Plugin } from '../../../src/core/public';
import {
  ResourceManagerPluginSetup,
  ResourceManagerPluginStart,
  AppPluginStartDependencies,
} from './types';
import { PLUGIN_NAME } from '../common';
import { renderApp } from './application';

// Register the application
export class ResourceManagerPlugin
  implements Plugin<ResourceManagerPluginSetup, ResourceManagerPluginStart> {

  public async setup(core: CoreSetup): Promise<ResourceManagerPluginSetup> {
    // Function to check if the user has the 'all_access' role
    const hasAllAccessRole = async (): Promise<boolean> => {
      return core.http
        .get('/api/cluster_resource_monitor/user_roles')
        .then((response: any) => {
          const roles = response.roles || [];
          return roles.includes('all_access'); // Check if 'all_access' role is present
        })
        .catch(() => false); // Handle errors gracefully
    };

    // Check if the user has the required role
    const hasAccess = await hasAllAccessRole();

    if (hasAccess) {
      // Register the application in the side navigation menu
      core.application.register({
        id: 'resourceManager',
        title: PLUGIN_NAME,
        async mount(params: AppMountParameters) {
          // Get start services as specified in opensearch_dashboards.json
          const [coreStart, depsStart] = await core.getStartServices();

          // Render the application
          const unmount = renderApp(coreStart, depsStart as AppPluginStartDependencies, params);

          // Return a cleanup function (AppUnmount) to be called when the app is unmounted
          return () => {
            unmount(); // Call any unmount logic from renderApp if it's provided
          };
        },
      });
    }

    return {
      getGreeting() {
        return i18n.translate('resourceManager.greetingText', {
          defaultMessage: 'Hello from {name}!',
          values: {
            name: PLUGIN_NAME,
          },
        });
      },
    };
  }

  public start(core: CoreStart): ResourceManagerPluginStart {
    return {};
  }

  public stop() {}
}