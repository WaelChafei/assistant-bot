
import { Enumeration, Int, OpenAPIRoute, Str, Num, Obj } from "@cloudflare/itty-router-openapi";
import { PDFDocument, PDFFont, PDFPage, StandardFonts, rgb } from 'pdf-lib';
import { v4 as uuidv4 } from 'uuid';


export interface Env {
	botkv: KVNamespace;
}
 
// Define the table settings





export class pdfgenerator extends OpenAPIRoute {
 
    
  static schema = {
    tags: ['PDF-GENERATOR'],
    summary: 'pdf document generation from json or html content',

    responses: {
        '200': {
            schema: {
                response: {
                    file: 'results.pdf',
                },
            },
        },
    },
 }




    async handle(request: Request, env: Env, context: any, data: Record<string, any>) {
    
    console.log("request",{...request.body});
    const smt=request;
    const smtjson=JSON.stringify(smt);
    const jsonData = JSON.parse(smtjson);

    const actualId: string = decodeURIComponent(jsonData.params.id);

    
    
      const id = actualId;


       




        const dt2 = await env.botkv.get(id);
        if(dt2){
        const dtjson2 = JSON.parse(dt2);
  
  
        const questions:any[] = [];
        const responses:any[] = [];
        
        dtjson2.forEach((item: { hasOwnProperty: (arg0: string) => any; questions: any; response: any; }) => {
          if (item.hasOwnProperty('questions')) {
            questions.push(item.questions);
          }
        
          if (item.hasOwnProperty('response')) {
            responses.push(item.response);
          }
        });











        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage();

        const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman)

        const { width, height } = page.getSize()       
   
        const fontSize = 20;
        let qstWidth=0;
        for (let i = 0; i < questions.length; i++) {
        
          const qst = questions[i];
          const textWidthCoef= (fontSize* 72) / 96;
          const wordsArray = qst.trim().split(/\s+/);
          const filteredWordsArray = wordsArray.filter((word: string) => word !== '');
          const wordCount = filteredWordsArray.length;
          let qstWidth2=wordCount*textWidthCoef;
          if(qstWidth<=qstWidth2){ 
          qstWidth =qstWidth2;
          console.log("qstWidth",qstWidth);
        }
      } 
      const tableX = 50;
      const tableY = height - 100;
      const tableWidth = qstWidth*2;
      const tableHeight = 300;
      const cellPadding = 10;


        function drawTableCell(page: PDFPage, text: string, x: number, y: number, fontSize: number, font: PDFFont) {
          page.drawText(text, { x, y, size: fontSize, font });
      }
       
      // Function to draw the table header row
      function drawTableHeader(page: PDFPage, x: number, y: number, fontSize: number, font: PDFFont) {
          drawTableCell(page, 'Question', x, y, fontSize, font);
          drawTableCell(page, 'Response', x + (tableWidth+qstWidth)/ 2, y, fontSize, font);
      }
      
      // Function to draw the table row
      function drawTableRow(page: PDFPage, question: string, response: string, x: number, y: number, fontSize: number, font: PDFFont) {
          drawTableCell(page, question, x, y, fontSize, font);
          drawTableCell(page, response, x + (tableWidth+qstWidth) / 2, y, fontSize, font);
      }
        page.drawText('Results', {
            x: 100,
            y: height - 4 * fontSize,
            size: fontSize,
            font: timesRomanFont,
            color: rgb(0, 0.53, 0.71),
            opacity: 0.3
        })
    

      let y = tableY;
      drawTableHeader(page, tableX, y, fontSize, timesRomanFont);
      y -= fontSize + cellPadding;

      // Draw the table rows
      for (let i = 0; i < questions.length; i++) {
        
          const qst = questions[i];
          const resp = responses[i];
          console.log("qst",qst);
          console.log("resp",resp);
          const newlineCountInResp = (resp.match(/\n/g) || []).length;
          console.log("newlineCountInResp",newlineCountInResp);

          
          drawTableRow(page, qst, resp, tableX, y, fontSize - 10, timesRomanFont);
          if(newlineCountInResp>0){
          y -= fontSize*(newlineCountInResp+1)  + cellPadding;
          }else{
            y -= fontSize - 10 + cellPadding;
          }
      }
      const pdfBytes = await pdfDoc.save();


      
      // Set the response headers
      const headers = {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${uuidv4()}.pdf"`,
      };
      return new Response(pdfBytes, { headers });
    }
    return {error:"error"}

    }
  }



