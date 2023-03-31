import React, { useState } from 'react';
import Dropzone from 'react-dropzone';
import { parseString } from 'xml2js';
import { utils, write } from 'xlsx';
import styled from 'styled-components';
import FileViewer from 'react-file-viewer';

const StyledDropzone = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  border-width: 2px;
  border-radius: 4px;
  border-color: #999;
  border-style: dashed;
  background-color: #fafafa;
  color: #999;
  outline: none;
  transition: border .24s ease-in-out;
  padding: 0 50px;
  margin-bottom:20px;

  &:hover {
    border-color: #333;
    color: #333;
  }
`;

async function parseXMLToString(xml) {
  return new Promise((resolve) => {
    parseString(xml, function (err, result) {
      resolve({
        'Emisor (Cenace)':
          result['cfdi:Comprobante']['cfdi:Emisor'][0].$.Nombre,
        'RFC Emisor (Cenace)':
          result['cfdi:Comprobante']['cfdi:Emisor'][0].$.Rfc,
        'Receptor (IPCO)':
          result['cfdi:Comprobante']['cfdi:Receptor'][0].$.Nombre,
        'RFC Receptor (IPCO)':
          result['cfdi:Comprobante']['cfdi:Receptor'][0].$.Rfc,
        'Tipo de Comprobante': result['cfdi:Comprobante'].$.TipoDeComprobante,
        'Fecha de Emisión': result['cfdi:Comprobante'].$.Fecha,
        'Folio Fiscal  (UUID)':
          result['cfdi:Comprobante']['cfdi:Complemento'][0][
            'tfd:TimbreFiscalDigital'
          ][0].$.UUID,
        SUBTOTAL: result['cfdi:Comprobante'].$.SubTotal,
        IVA: result['cfdi:Comprobante']['cfdi:Impuestos'][0][
          'cfdi:Traslados'
        ][0]['cfdi:Traslado'][0].$.Importe,
        TOTAL: result['cfdi:Comprobante'].$.Total,
        CODIGO_FUF: 1,
        PERIODO_ECD: 1,
      });
    });
  });
}

function MyDropzone() {
  const [xmlData, setXmlData] = useState(null);

  const handleFileUpload = async (acceptedFiles) => {
    let jsonData = [];

    for (let file of acceptedFiles) {
      // Aquí es donde puedes utilizar la biblioteca xml2js para analizar el archivo XML y convertirlo a JSON
      const xml = await file.text();
      let result = await parseXMLToString(xml);
      jsonData.push(result);
    }

    const workbook = utils.book_new();
    const worksheetOrigin = utils.json_to_sheet(jsonData);

    // Establecer el ancho de la columna A
    const column = 'Emisor (Cenace)';
    const width = 100;
    const wscols = [{ wch: width }];
    worksheetOrigin[column] = { ...worksheetOrigin[column], ...{ wscols } };

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
      excel: new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      }),
    });
  };

  return (
    <>
      <Dropzone onDrop={handleFileUpload}>
        {({ getRootProps, getInputProps }) => (
          <StyledDropzone {...getRootProps()}>
            <input {...getInputProps()} />
            <p>Arrastra un archivo aquí o haz clic para seleccionar uno</p>
          </StyledDropzone>
        )}
      </Dropzone>
      {xmlData && (
        <div>
          <a href={URL.createObjectURL(xmlData.excel)} download="datos.xlsx">
            Descargar archivo de Excel generado
          </a>
        </div>
      )}
    </>
  );
}

export default MyDropzone;
