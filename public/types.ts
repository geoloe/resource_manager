import { NavigationPublicPluginStart } from '../../../src/plugins/navigation/public';

export interface ResourceManagerPluginSetup {
  getGreeting: () => string;
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ResourceManagerPluginStart {}

export interface AppPluginStartDependencies {
  navigation: NavigationPublicPluginStart;
}
