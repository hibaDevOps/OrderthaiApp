import { WebPlugin } from '@capacitor/core';
import { PosPlugin } from './definitions';

export class PosWeb extends WebPlugin implements PosPlugin {
  constructor() {
    super({
      name: 'Pos',
      platforms: ['web'],
    });
  }

  async echo(options: { value: string }): Promise<{ value: string }> {
    console.log('ECHO', options);
    return options;
  }
  async getBT(): Promise<{ response: BlueTooth[] }> {
    return {
      response: [
        new BlueTooth('0', 'BT-05')
      ]
    }
  }
  async connectBT(options: { value: string }): Promise<{ response: string }> {
    console.log(options);
    return {
      response: 'Connected'
    }
  }
  async printBT(options: { value: string }): Promise<{ response: string }> {
    console.log(options);
    return {
      response: 'printed'
    }
  }
}


const Pos = new PosWeb();

export { Pos };

import { registerWebPlugin } from '@capacitor/core';
import { BlueTooth } from './bluetooth';
registerWebPlugin(Pos);
