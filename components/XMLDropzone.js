import React, { useState } from 'react';
import Dropzone from 'react-dropzone';
import { parseString } from 'xml2js';
import { utils, write } from 'xlsx';
import FileViewer from 'react-file-viewer';

function MyDropzone() {
  const [xmlData, setXmlData] = useState(null);

  const handleFileUpload = async (acceptedFiles) => {
    const file = acceptedFiles[0];

    // Aquí es donde puedes utilizar la biblioteca xml2js para analizar el archivo XML y convertirlo a JSON
    const xml = await file.text();
    let jsonData;
    parseString(xml, function (err, result) {
      console.log('jsonData', JSON.stringify(result));

      const workbook = utils.book_new();
      const worksheetOrigin = utils.json_to_sheet([
        {
          Folio: result['cfdi:Comprobante'].$.Folio,
          UUID: result['cfdi:Comprobante']['cfdi:Complemento'][0][
            'tfd:TimbreFiscalDigital'
          ][0].$.UUID,
          fechaTimbrado:
            result['cfdi:Comprobante']['cfdi:Complemento'][0][
              'tfd:TimbreFiscalDigital'
            ][0].$.FechaTimbrado,
        },
      ]);
      utils.book_append_sheet(workbook, worksheetOrigin, 'XML');

      const buffer = write(workbook, { bookType: 'xlsx', type: 'buffer' });

      /*
      const fileBuffer = new ArrayBuffer(worksheet.length);
      const view = new Uint8Array(fileBuffer);
      for (let i = 0; i < worksheet.length; ++i) {
        view[i] = worksheet.charCodeAt(i) & 0xff;
      }
*/

      // Aquí es donde estableces el estado de xmlData con el archivo XML y el archivo Excel generado
      setXmlData({
        xml: file,
        excel: new Blob([buffer], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        }),
      });
    });
  };

  return (
    <>
      <Dropzone onDrop={handleFileUpload}>
        {({ getRootProps, getInputProps }) => (
          <div {...getRootProps()}>
            <input {...getInputProps()} />
            <p>Arrastra un archivo aquí o haz clic para seleccionar uno</p>
          </div>
        )}
      </Dropzone>
      {xmlData && (
        <div>
          <h3>Archivo Excel generado:</h3>
          <a href={URL.createObjectURL(xmlData.excel)} download="datos.xlsx">
            Descargar archivo Excel
          </a>
        </div>
      )}
    </>
  );
}

export default MyDropzone;
