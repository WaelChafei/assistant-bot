
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
  

export class genQuestions extends OpenAPIRoute {
 
    
    static schema = {
        tags: ['GENERATE-QUESTION'],
        summary: 'generate question by openAI',
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
        const url = "https://api.openai.com/v1/chat/completions";
        const apiKey = "";
       
        const id = await data.body.portalId;
        console.log("iddddddddd",id);
        
        const dt = (await env.botkv.get(id))!;
        console.log("dt",dt);

        const dataObject = JSON.parse(dt);
        console.log("dataObject",dataObject);

        const dataArray = dataObject;
        console.log("dataArrayaaaaaaaaaaaaaaaaaaaaaaaaa",dataArray);

        const questionsArray:any[] = [];
        const responsesArray:any[] = [];
        let questionCounter = 0;
        dataArray.forEach((item: { questions: any; response: any; }) => {
            questionCounter++;
          if (questionCounter >= 8) {
          if ('questions' in item) {
            questionsArray.push(item.questions);
          }
          }
          if ('response' in item)  {
            responsesArray.push(item.response);
          }
        });

        const questionsString = questionsArray.join(',');
        const responseString = responsesArray.join(',');
        console.info(` responsessssss ${responseString}`);
        const [field, name, company, slogan, nbEmp, product, competitors] = responseString.split(',');
        const informations = {
      
          name: name,
          company: company,
          slogan: slogan,
          nb_emp: nbEmp,
          product: product,
          competitors: competitors,
        };
         const stringinformations= JSON.stringify(informations);
         console.info(`questionsString ${questionsString}`);


         const datas = {
            messages: [
              {
                role: "system",
                content: `
 generate only a json of one question of survey that ask people about the company with these informations ${stringinformations} ,
 , and give me suggestions of quick replies , the format of the json is {"message":{"text":""},quickReplies:[{"value":"","label"},{"value":"","label"}]} and ensure that
 if the question is with multiple choices to pick  give that in this format in the json after quickReplies : multipleChoices : yes else in this format multipleChoices: no,
  and finally the questions must not have the same meaning of these questions :${questionsString}
 `, // To be updated with the value of reqmkt
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
            const startIndex =
            responseData.choices[0].message.content.indexOf("{");
          const endIndex =
          responseData.choices[0].message.content.lastIndexOf("}");
          const jsonString =
          responseData.choices[0].message.content.substring(
              startIndex,
              endIndex + 1
            );

            const jsonData = JSON.parse(jsonString);
            const question = jsonData.message.text;
            console.info(jsonData);
            const quickReplies = jsonData.quickReplies;
            const multipleChoices = jsonData.multipleChoices;

            const desiredJson = {
              quickReplies: jsonData.quickReplies,
            };
            const finalquick = JSON.stringify(desiredJson);

            const quickReplies1 = jsonData.quickReplies.map((reply: { label: any; }, index: number) => `${index + 1}. ${reply.label}`).join('\n');
            const combinedString = `${quickReplies1}\n Multiple Choices :${multipleChoices}`;

            
            const result = `${question} \n \n \n${combinedString} \n \n`;
            
 
            
            const saveInstance = new save({  raiseUnknownParameters: true,
            });
            await saveInstance.handle(new Request(''), env, {}, {body: {content:{
                portalId: id,
                userMessage: { questions: String(question), response: String(combinedString) },
            }}})
                    .then((response) => {
                        console.log(response);
                    })
                    .catch((error) => {
                        console.error("Error occurred:", error);
                    });
  
              
                






            
            console.log("resposssssse",responseData.choices[0].message.content);
            



























      
      return{result};
    






    }



}
