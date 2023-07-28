import { KVNamespace } from '@cloudflare/workers-types';
import { StorageService } from './storageService';

export interface Env {
  botkv: KVNamespace;
}

export class KVCloudflare implements StorageService {
  private botkv: KVNamespace;

  constructor(env: Env) {
    this.botkv = env.botkv;
  }

  async get(key: string): Promise<string | null> {
    console.log("this botkv",this.botkv);
    
    return await this.botkv.get(key);
  }

  async put(key: string, value: string): Promise<void> {
    await this.botkv.put(key, value);
  }

  async delete(key: string): Promise<void> {
    await this.botkv.delete(key);
  }
}
