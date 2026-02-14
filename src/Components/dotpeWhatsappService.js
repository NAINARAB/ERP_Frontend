import axios from 'axios';
import { Dot_Pe_Api_Key, Dot_Pe_Number } from '../encryptionKey';

const DOTPE_API_BASE = 'https://api.dotpe.in/api/comm/public/enterprise/v1';
// const RAW_API_KEY = 'your-api-key';

const cleanApiKey = () => {
    let cleaned = Dot_Pe_Api_Key.replace(/[^\x20-\x7E]/g, '');
    cleaned = cleaned.replace(/[\u200B-\u200D\uFEFF\u00A0]/g, '');
    cleaned = cleaned.trim(); 
    return cleaned;
};

export class DotPeWhatsAppService {
    static async fetchTemplates(status = 'APPROVED') {
        try {
            const apiKey = cleanApiKey();
            
            const response = await axios.get(
                `${DOTPE_API_BASE}/templates?status=${status}`,
                {
                    headers: {
                        'Dotpe-Api-Key': apiKey,
                        'Content-Type': 'application/json',
                    },
                }
            );
     
            return {
                status: true,
                data: response.data?.data || response.data,
                message: 'Templates fetched successfully'
            };
        } catch (error) {
            console.error('Error fetching templates:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data
            });
            
            return {
                status: false,
                data: null,
                message: error.response?.data?.message || error.message || 'Failed to fetch templates'
            };
        }
    }

    static async sendTemplateMessage(payload) {
        try {
            const apiKey = cleanApiKey();
            
            const response = await axios.post(
                `${DOTPE_API_BASE}/wa/send`,
                payload,
                {
                    headers: {
                        'Dotpe-Api-Key': apiKey,
                        'Content-Type': 'application/json',
                    },
                    timeout: 30000,
                }
            );
            
            return {
                status: response.data?.status === true || response.data?.success === true,
                data: response.data,
                message: response.data?.message || 'Message sent successfully'
            };
        } catch (error) {
            console.error('Error details:', {
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                headers: error.response?.headers
            });
            
            if (error.response?.status === 422) {
                console.error('Template validation error. Likely issues:');
                console.error('1. Wrong number of parameters');
                console.error('2. Parameter names don\'t match template');
                console.error('3. Template not approved');
                console.error('4. Missing required parameters');
            }
            
            return {
                status: false,
                data: error.response?.data,
                message: error.response?.data?.message || 
                        error.response?.data?.error || 
                        error.message || 
                        'Failed to send message',
                statusCode: error.response?.status
            };
        }
    }

  
    static async sendFreeFormMessage(payload) {
        try {
            const apiKey = cleanApiKey();
            
         
            let endpoint = `${DOTPE_API_BASE}/wa/send/free-form`;
            let apiPayload = payload;
            
          
            if (payload.template) {
                endpoint = `${DOTPE_API_BASE}/wa/send`;
            }
            
            const response = await axios.post(
                endpoint,
                apiPayload,
                {
                    headers: {
                        'Dotpe-Api-Key': apiKey,
                        'Content-Type': 'application/json',
                    },
                    timeout: 30000,
                }
            );
            
            return {
                status: response.data?.status === true || response.data?.success === true,
                data: response.data,
                message: response.data?.message || 'Message sent successfully'
            };
        } catch (error) {
            console.error('Error sending free-form message:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data
            });
            
            return {
                status: false,
                data: error.response?.data,
                message: error.response?.data?.message || error.message || 'Failed to send message',
                statusCode: error.response?.status
            };
        }
    }



    static async sendInvoiceWithPDFLink(phone, invoiceId, invoiceData, order,pdfUrl) {
        try {
           
            // const apiKey = cleanApiKey();
            // const RetailerName=order?.retailerNameGet;
            const Do_Date = order?.Do_Date ?  order.Do_Date.split('T')[0].split('-').reverse().join('/') :  new Date().toLocaleDateString('en-GB');
            // const Do_Inv_No=order?.Do_Inv_No;
            // const invoiceValue=order?.Total_Invoice_value;
        
            const payload = {
  merchantId: 21640, 
  template: {
    name: "template_text",
    language: "en"
  },
//   wabaNumber: "919944888054", 
      wabaNumber:Dot_Pe_Number,
 
//    recipients: ["919944032029"],
recipients:[`91${phone}`],
  source: "crm",
   type: "document",
  clientRefId: `invoice_INV001_${Date.now()}`,
  params: {
    //  header: `http://192.168.1.39:9001/uploads/invoices/1/${invoiceId}.pdf`, 
    body: [
      `${order?.retailerNameGet}`,          
      `${order?.Do_Inv_No}`,            
      `${Do_Date}`,   
      `${order?.Total_Invoice_value}`,      
       'SM TRADERS',          
       `${pdfUrl}`
    ]
  }
};
            
           
            return await this.sendFreeFormMessage(payload);
            
        } catch (error) {
            console.error('Error sending invoice with PDF:', error);
            
            return {
                status: false,
                message: error.message || 'Failed to send invoice'
            };
        }
    }
    
    static async sendPDFAsDocument(phone, invoiceId, pdfUrl, caption) {
        try {
            // const apiKey = cleanApiKey();
            
            const payload = {
                // wabaNumber: "919944888054",
                wabaNumber:Dot_Pe_Number,
                recipient: phone,
                source: "billing_system",
                clientRefId: `pdf_${invoiceId}_${Date.now()}`,
                type: "document",
                document: {
                    link: pdfUrl,
                    caption: caption || `📄 Invoice #${invoiceId}\nClick to view/download`,
                    filename: `Invoice-${invoiceId}.pdf`
                }
            };
            
           
            return await this.sendFreeFormMessage(payload);
            
        } catch (error) {
            console.error('Error sending PDF as document:', error);
            
            return {
                status: false,
                message: error.message || 'Failed to send PDF'
            };
        }
    }
}