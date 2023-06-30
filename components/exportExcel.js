import React from 'react';
import XLSX from 'sheetjs-style';
import * as FileSaver from "file-saver";


export const ExportExcel = ({excelData, fileName}) => {

    const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const fileExtension = '.xlsx';

    const exportToExcel = async () => {
        const workSheet = XLSX.utils.json_to_sheet(excelData);
        const workBook = {Sheets: {'Sayfa1': workSheet}, SheetNames: ['Sayfa1']};
        const excelBuffer = XLSX.write(workBook, {bookType: 'xlsx', type: 'array'});
        const data = new Blob([excelBuffer], {type: fileType});
        FileSaver.saveAs(data, fileName + fileExtension);
    }

    return (
        <>
            <label className="custom-file-upload border rounded p-2 fw-semibold cursor-pointer">
                <button className="bg-white" onClick={(e)=>exportToExcel(fileName)}><i className="fa fa-cloud-download cursor-pointer"></i>
                </button>
                İndir
            </label>
        </>
    )
}

