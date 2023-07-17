const { jsPDF } = require('jspdf');
require('jspdf-autotable');
  // src/worker.js
  addEventListener("fetch", (event,) => {
    event.respondWith(
      handleRequest(event.request).catch(
        (err) => new Response(err.stack, { status: 500 })
      )
    );
  });
  async function handleRequest(request) {
    const { pathname,searchParams  } = new URL(request.url);
    console.log(pathname);
    if (pathname.startsWith("/api")) {
     
      const body1 = await request.text();
      const jsonData = body1;
      const data = JSON.parse(jsonData);
      const message = data.userMessage;
      const id = data.portalId;
      console.log(message);
      const dt = await botkv.get(id);
      let arrjson = [];
      if (dt) {
        const dtjson = JSON.parse(dt);
        arrjson = dtjson;
        arrjson.push(message);
        const input = JSON.stringify(arrjson);
        console.log("newstr", input);
        await botkv.put(id, input);
      }
      else {
        arrjson.push(message);
        const input = JSON.stringify(arrjson);
        await botkv.put(id, input);
      }
      return new Response(JSON.stringify({ pathname, message }), {
        headers: { "Content-Type": "application/json" }
      });
    }


    else if (pathname.startsWith("/store")) {
      const body1 = await request.text();
      const data = JSON.parse(body1);
      const id = data.portalId;
      const dt = await botkv.get(id);

      return new Response(JSON.stringify({ dt }), {
          headers: { "Content-Type": "application/json" }
      });
     
   

    }
    else if (pathname.startsWith("/delquestion")) {
      const body1 = await request.text();
      const jsonData = body1;
      const data = JSON.parse(jsonData);
      const id = data.portalId;
      const dt2 = await botkv.get(id);
      console.log("dt2", dt2);
      let dtjson2 = JSON.parse(dt2);
      console.log("delq2", dtjson2);
    
      for (let i = dtjson2.length - 1; i >= 0; i--) {
        if (dtjson2[i].hasOwnProperty("questions") && dtjson2[i].hasOwnProperty("response")) {
          dtjson2.splice(i, 1);
          break;
        }
      }
    
      console.log(JSON.stringify(dtjson2, null, 2).replace(/\\n|\\\\/g, ""));
      await botkv.put(id, JSON.stringify(dtjson2, null, 2).replace(/\\n|\\\\/g, ""));
      
      return new Response(JSON.stringify({ dt }), {
        headers: { "Content-Type": "application/json" }
      });
    }
    

    else if (pathname.startsWith("/pdfgenerator")){
      const id = searchParams.get("id");

      const doc = new jsPDF({
        orientation: 'p',
        format: 'a4'
      })

      const pageWidth = doc.internal.pageSize.width
   
      const t = {}
      const textParams = [
        'question',
        'response',
 
      ]
      textParams.forEach(param => (t[param] = searchParams.get(param) || ''))
      const docText = (x, y, text) => {
        if (x > 0) return doc.text(x, y, text)
        return doc.text(pageWidth + x, y, text, null, null, 'right')
      }
    
      const getLines = (text, start, end) =>
        text
          .replace(/\\n/g, '\n')
          .split('\n')
          .slice(start, end)
    
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(14)
      docText(20, 24, getLines(t.question || 'Results:', 0, 1))   
     
      doc.setLineWidth(0.333)
      doc.line(20, 102, pageWidth - 20, 102)
  
      const tableHeaders = ['Question', 'Response'];
      const dt2 = await botkv.get(id);
      const dtjson2 = JSON.parse(dt2);


      const questions = [];
      const responses = [];
      
      dtjson2.forEach(item => {
        if (item.hasOwnProperty('questions')) {
          questions.push(item.questions);
        }
      
        if (item.hasOwnProperty('response')) {
          responses.push(item.response);
        }
      });
  
       doc.autoTable({
        startY: 60,  
        head: [tableHeaders],  
        body: questions.map((question, index) => [question, responses[index]])  
      });
      const output = doc.output('arraybuffer');
      const headers = new Headers();
      headers.set('Content-Type', ' application/pdf')
    
      return new Response(output, { headers });


       
      
    }
    return new Response("PUT successful");
  }
 
//# sourceMappingURL=worker.js.map
