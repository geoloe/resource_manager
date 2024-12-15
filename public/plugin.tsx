import { i18n } from '@osd/i18n';
import { AppMountParameters, CoreSetup, CoreStart, Plugin } from '../../../src/core/public';
import {
  RessourceManagerPluginSetup,
  RessourceManagerPluginStart,
  AppPluginStartDependencies,
} from './types';
import { PLUGIN_NAME } from '../common';

// Register the application
export class RessourceManagerPlugin
  implements Plugin<RessourceManagerPluginSetup, RessourceManagerPluginStart> {

  public setup(core: CoreSetup): RessourceManagerPluginSetup {
    // Register an application into the side navigation menu
    core.application.register({
      id: 'ressourceManager',
      title: PLUGIN_NAME,
      async mount(params: AppMountParameters) {
        // Load application bundle and ensure it's mounted properly
        const { renderApp } = await import('./application'); // This will render your app
        const [coreStart, depsStart] = await core.getStartServices();
        
        // Mount the app by calling renderApp and passing core services
        return renderApp(coreStart, depsStart as AppPluginStartDependencies, params);
      },
    });

    return {
      getGreeting() {
        return i18n.translate('ressourceManager.greetingText', {
          defaultMessage: 'Hello from {name}!',
          values: {
            name: PLUGIN_NAME,
          },
        });
      },
    };
  }

  public start(core: CoreStart): RessourceManagerPluginStart {
    return {};
  }

  public stop() {}
}