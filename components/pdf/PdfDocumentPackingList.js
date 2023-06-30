import {saveAs} from 'file-saver';
import {pdf} from '@react-pdf/renderer';
import PackingList from "./PackingList"

const PdfDocumentPackingList = async (documentData, settings, bankDetails, fileName) => {
    const blobP = await pdf((
        <PackingList
            data={documentData}
            settings={settings}
            bankDetails={bankDetails}
        />
    )).toBlob();
    saveAs(blobP, fileName);
};

export default PdfDocumentPackingList;