const fs = require('fs');
const csvParser = require('csv-parser');

// Leer los datos del archivo CSV
const data = [];
fs.createReadStream('aristas.csv')
  .pipe(csvParser())
  .on('data', (row) => {
    data.push(row);
  })
  .on('end', () => {
    // Procesar los datos
    const processedData = {};

    for (const row of data.slice(1)) { // Omitir la fila de encabezado
      const [source, target, label] = Object.values(row);
      const key = `${source},${target}`;

      if (processedData[key]) {
        processedData[key].labels.add(label);
        processedData[key].count += 1;
      } else {
        processedData[key] = {
          labels: new Set([label]),
          count: 1,
        };
      }
    }

    // Escribir los datos procesados en un nuevo archivo CSV
    const outputData = [];
    outputData.push(['Source', 'Target', 'Label', 'Conteo']);

    for (const [key, value] of Object.entries(processedData)) {
      const [source, target] = key.split(',');
      const label = Array.from(value.labels).join('|');
      const count = value.count;
      outputData.push([source, target, label, count]);
    }

    const outputCsv = outputData.map((row) => row.join(',')).join('\n');
    fs.writeFileSync('aristas_sumadas.csv', outputCsv);
  });