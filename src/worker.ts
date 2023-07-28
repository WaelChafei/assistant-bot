import { OpenAPIRouter } from '@cloudflare/itty-router-openapi';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import {save} from './save';
import {storage} from './storage';
import {delquestion} from './delquestion';
import {pdfgenerator} from './pdfgenerator';
import {genQuestions} from './genQuestions';

const router = OpenAPIRouter({
  schema: {
    openapi: '3.0.0',
    info: {
      title: 'My API',
      version: '3.0.0',
    },
  },
});




router.post('/save', save);
router.post('/storage', storage);
router.delete('/delquestion', delquestion);
router.get('/pdfgenerator/:id',pdfgenerator);
router.post('/genQuestions',genQuestions);



export default {
  fetch: router.handle,
};

