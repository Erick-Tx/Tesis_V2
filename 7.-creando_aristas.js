const fs = require('fs');
const csv = require('csv-parser');

// Nombre del archivo de salida
const outputFileName = 'aristas.csv';

// Cargar datos del primer archivo CSV (authors_unique.csv)
const authorsData = [];
const authorsStream = fs.createReadStream('nodos.csv')
  .pipe(csv())
  .on('data', (row) => {
    // Convertir el campo 'Id' a número
    row.Id = parseInt(row.Id);
    row.ID_Scopus_Author = parseInt(row.ID_Scopus_Author);
    authorsData.push(row);
  });

// Cargar datos del segundo archivo CSV (author_combinations.csv)
const combinationsData = [];
const combinationsStream = fs.createReadStream('author_combinations.csv')
  .pipe(csv())
  .on('data', (row) => {
    // Convertir los campos 'Author1' y 'Author2' a números
    row.Author1 = parseInt(row.Author1);
    row.Author2 = parseInt(row.Author2);
    combinationsData.push(row);
  });

// Esperar a que ambas corrientes terminen de leer los archivos CSV
Promise.all([
  new Promise((resolve) => authorsStream.on('end', resolve)),
  new Promise((resolve) => combinationsStream.on('end', resolve))
]).then(() => {
  // Combinar datos
  const combinedData = combinationsData.map(combination => {
    const author1 = authorsData.find(author => author.ID_Scopus_Author === combination.Author1);
    const author2 = authorsData.find(author => author.ID_Scopus_Author === combination.Author2);
    return `${author1 ? author1.Id : null},${author2 ? author2.Id : null},${combination.PaperId}`;
  });

  // Encabezados de columna
  const headers = 'Source,Target,Label\n';

  // Escribir datos en un nuevo archivo CSV
  fs.writeFile(outputFileName, headers, (err) => {
    if (err) {
      console.error('Error al escribir el archivo CSV:', err);
      return;
    }
    combinedData.forEach(line => {
      fs.appendFileSync(outputFileName, line + '\n');
    });
    console.log(`Los datos combinados se han guardado en el archivo ${outputFileName}`);
  });
});
