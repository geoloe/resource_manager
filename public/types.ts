import { NavigationPublicPluginStart } from '../../../src/plugins/navigation/public';

export interface RessourceManagerPluginSetup {
  getGreeting: () => string;
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface RessourceManagerPluginStart {}

export interface AppPluginStartDependencies {
  navigation: NavigationPublicPluginStart;
}
