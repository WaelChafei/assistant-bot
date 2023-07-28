
import { Enumeration, Int, OpenAPIRoute, Str, Num, Obj } from "@cloudflare/itty-router-openapi";
import { KVNamespace } from '@cloudflare/workers-types';

export interface Env {
	botkv: KVNamespace;
}
 

export class delquestion extends OpenAPIRoute {
 
    
    static schema = {
        tags: ['DELETE-QUESTION'],
        summary: 'delete question',
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
     
       
        const body1 = await data.body;
        console.log("body1",body1);
        
        const id = await data.body.portalId;
        const dt2 = await env.botkv.get(id);
        if(dt2!=null){
        let dtjson2 = JSON.parse(dt2);
        
        console.log("delq2", dtjson2);
      
        for (let i = dtjson2.length - 1; i >= 0; i--) {
          if (dtjson2[i].hasOwnProperty("questions") && dtjson2[i].hasOwnProperty("response")) {
            dtjson2.splice(i, 1);
            break;
          }
        }
      
        console.log(JSON.stringify(dtjson2, null, 2).replace(/\\n|\\\\/g, ""));
        await env.botkv.put(id, JSON.stringify(dtjson2, null, 2).replace(/\\n|\\\\/g, ""));
        
    }
 
         
     
      
      return{done:"done"};
    






    }



}