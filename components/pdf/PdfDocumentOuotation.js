import {saveAs} from 'file-saver';
import {pdf} from '@react-pdf/renderer';
import Quotation from './Quotation';

const PdfDocumentQuotation = async (documentData, settings, bankDetails, pdfTitle, fileName) => {
    const blob = await pdf((
        <Quotation
            data={documentData}
            settings={settings}
            bankDetails={bankDetails}
            pdfTitle={pdfTitle}
        />
    )).toBlob();
    saveAs(blob, fileName);
};

export default PdfDocumentQuotation;
