
import { Enumeration, Int, OpenAPIRoute, Str, Num, Obj } from "@cloudflare/itty-router-openapi";
import { KVNamespace } from '@cloudflare/workers-types';
import { StorageService } from "./storageService";
import { KVCloudflare } from "./cloudfareKVAdapter";

export interface Env {
	botkv: KVNamespace;
}
 
const implementation= "cloudflare";

export class save extends OpenAPIRoute {
 
    
    static schema = {
        tags: ['INFO-SAVER'],
        summary: 'save information into kv',
        requestBody: {
            content: JSON,
        },
        responses: {

                '200': {
                    contentType: 'application/json',
                    schema:{
                        id:123,
                        content:{done:"done"}
                    },
                 }
        }
    }

    private storageService!: StorageService;

    async handle(request: Request, env: Env, context: any, data: Record<string, any>) {
      if (implementation === 'cloudflare') {
        this.storageService = new KVCloudflare(env);
      } else if (implementation === 'durable-objects') {
        // this.StorageService = new KVDurableObjects(namespaceId);
      } else {
        throw new Error('Invalid implementation. Choose between "cloudflare" or "durable-objects".');
      }
      const req = await data.body.content;
      const data1 = req;
      const message = data1.userMessage;
      const id = data1.portalId;
      console.log(message);
      const dt = await this.storageService.get(id);    
      console.log("dt",dt);
      console.log("env.botkv",env.botkv);
      let dtLength; 
      let arrjson:any[] = [];
      if (dt) {
        const dtjson = JSON.parse(dt);
        dtLength=dtjson.length;
        arrjson = dtjson;
        arrjson.push(message);
        const input = JSON.stringify(arrjson);  
        console.log("newstr", input);
        await  this.storageService.put(id, input);
      }
      else {
        dtLength=0;
        arrjson.push(message);
        const input = JSON.stringify(arrjson);
        await  this.storageService.put(id, input);
      }
      
      
      
      return{success:"new element added successfully"};
    






    }



}