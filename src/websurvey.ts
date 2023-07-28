
import { Enumeration, Int, OpenAPIRoute, Str, Num, Obj } from "@cloudflare/itty-router-openapi";
import { KVNamespace } from '@cloudflare/workers-types';
import { save } from "./save";

export interface Env {
	botkv: KVNamespace;
}
interface ResponseData {
    choices: {
      index: number;
      message: {
        content: string;  
        [key: string]: any;  
      };
      finish_reason: string;
    }[];
   }
  

export class websurvey extends OpenAPIRoute {
 
    
    static schema = {
        tags: ['JSON-WEB-GENERATE-QUESTION'],
        summary: 'generate questions for web by openAI',
        requestBody: {
            generatedJson: JSON,
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
        const url = "https://api.openai.com/v1/chat/completions";
        const apiKey = "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";
        console.log("data.body.generatedJson",data.body.generatedJson);
        


  
         const datas = {
            messages: [
              {
                role: "system",
                content: `
 generate only a json of the questions of survey based on these information in this json ${data.body.generatedJson} `,
              },
            ],
            model: "gpt-3.5-turbo",
          };

          const response= await fetch(
              url,{
                method:'POST',
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
              },
              body: JSON.stringify(datas),
            });
            const responseData:ResponseData = (await response.json())!;
          
            
            console.log("resposssssse",responseData.choices[0]);
            



























      
      return{responseData};
    






    }



}