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
  const hasRequiredRole = async (): Promise<boolean> => {
    return core.http
      .get('/api/cluster_resource_monitor/user_roles')
      .then((response: any) => {
        const roles = response.roles || [];
        const rolePattern = /^cu-role-.*$/; // Regex to match roles starting with 'cu-' and ending with '-role'
        return roles.some((role: string) => rolePattern.test(role)); // Check if any role matches the pattern
      })
      .catch(() => false); // Handle errors gracefully
  };

    // Check if the user has the required role
    const isUnauthorizedUser = await hasRequiredRole();

    if (!isUnauthorizedUser) {
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