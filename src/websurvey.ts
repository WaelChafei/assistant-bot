
import { Enumeration, Int, OpenAPIRoute, Str, Num, Obj } from "@cloudflare/itty-router-openapi";
import { KVNamespace } from '@cloudflare/workers-types';
import { save } from "./save";

export interface Env {
	botkv: KVNamespace;
}

interface Survey {
  name: string;
  elements: Question[];
  title: string;
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
  
   interface Question {
    type: string;
    name: string;
    title: string;
    choices?: string[];
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
        const stringjson=JSON.stringify(data.body.generatedJson);  


  
         const datas = {
            messages: [
              {
                role: "system",
                content: `
                En fonction de ces questions et réponses ${stringjson}, générer uniquement un JSON qui recommande 20 questions d'enquête pour répondre à tous les besoins en se basant sur les questions et les réponses, the format of the json is : [{"question":"","type":"","options":""}] , et le type ne peut être que text,dropdown,checkbox,rating`,
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
          
            
            console.log("resposssssse",responseData.choices[0].message.content);
            const result=responseData.choices[0].message.content;
            const jsonresult=JSON.parse(result);
            const questions: Question[] = jsonresult.map((question:any, index:any) => {
              const transformedQuestion: Question = {
                type: question.type,
                name: question.question,
                title: question.question,
                choices: Array.isArray(question.options) ? question.options : undefined,
              };
              return transformedQuestion;
            });

            const survey: Survey = {
              name: "page5",
              elements: questions,
              title: "Generated questions",
            };

          





















      
      return{survey};
    






    }



}