import { BlueTooth } from './bluetooth';
declare module '@capacitor/core' {
  interface PluginRegistry {
    Pos: PosPlugin;
  }
}

export interface PosPlugin {
  echo(options: { value: string }): Promise<{ value: string }>;
  getBT(): Promise<{ response: BlueTooth[] }>;
  connectBT(options: { value: string }): Promise<{ response: string }>;
  printBT(options: { value: string }): Promise<{ response: string }>;
}
