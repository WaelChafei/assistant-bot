
import { Enumeration, Int, OpenAPIRoute, Str, Num, Obj } from "@cloudflare/itty-router-openapi";
import { KVNamespace } from '@cloudflare/workers-types';

export interface Env {
	botkv: KVNamespace;
}
 

export class storage extends OpenAPIRoute {
 
    
    static schema = {
        tags: ['INFO-GETTER'],
        summary: 'get information from kv',
        requestBody: {
            portalId: Str,
        },
        responses: {

                '200': {
                    contentType: 'application/json',
                    schema:{
                        content:{done:"done"}
                    },
                 }
        }
    }



    async handle(request: Request, env: Env, context: any, data: Record<string, any>) {
     
       
        const id = await data.body.portalId;
        const dt = await env.botkv.get(id);
         
     
      
      return{dt};
    






    }



}