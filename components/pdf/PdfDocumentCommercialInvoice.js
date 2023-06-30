import {saveAs} from 'file-saver';
import {pdf} from '@react-pdf/renderer';
import CommercialInvoice from "./CommercialInvoice";

const PdfDocumentCommercialInvoice = async (documentData, settings, bankDetails, fileName) => {
    const blob = await pdf((
        <CommercialInvoice
            data={documentData}
            settings={settings}
            bankDetails={bankDetails}
        />
    )).toBlob();
    saveAs(blob, fileName);
};

export default PdfDocumentCommercialInvoice;