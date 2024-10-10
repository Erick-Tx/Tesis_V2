const mongoose = require('mongoose');
const fs = require('fs');
const csvWriter = require('csv-writer').createObjectCsvWriter;

// Conectar con la base de datos MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/scopusDB');

// Definir el esquema para los documentos en la colección scivaldatas
const scivalDataSchema = new mongoose.Schema({
  scopusId: String,
  scivalData: {
    publication: {
      id: String,
      authors: [{
        name: String,
        id: String
      }]
    }
  }
});

// Crear un modelo basado en el esquema para la colección scivaldatas
const ScivalData = mongoose.model('ScivalData', scivalDataSchema);

// Función para extraer los nombres de los autores, el ID del paper y los IDs de los autores de los documentos
async function extractAuthors() {
  try {
    // Consulta para obtener los documentos de la colección scivaldatas
    const documents = await ScivalData.find({}, 'scopusId scivalData.publication.id scivalData.publication.authors.name scivalData.publication.authors.id');

    const data = [];

    // Iterar sobre cada documento
    documents.forEach(document => {
      const authors = document.scivalData.publication.authors;
      const paperId = document.scivalData.publication.id.toString().padStart(10, '0'); // Convertir a cadena y rellenar con ceros

      // Generar combinaciones de autores
      for (let i = 0; i < authors.length; i++) {
        for (let j = i + 1; j < authors.length; j++) {
          data.push({
            Author1: authors[i].id,
            Author2: authors[j].id,
            PaperId: paperId
          });
        }
      }
    });

    // Definir las columnas para el archivo CSV
    const csvWriterOptions = {
      path: 'author_combinations.csv',
      header: [
        { id: 'Author1', title: 'Author1' },
        { id: 'Author2', title: 'Author2' },
        { id: 'PaperId', title: 'PaperId' }
      ]
    };

    // Crear el escritor CSV y escribir los datos en el archivo
    const writer = csvWriter(csvWriterOptions);
    await writer.writeRecords(data);

    console.log('CSV file has been written.');
  } catch (error) {
    console.error('Error retrieving documents:', error);
  } finally {
    // Cerrar la conexión con la base de datos
    mongoose.connection.close();
  }
}

// Llamar a la función para extraer los autores y escribir las combinaciones en el archivo CSV
extractAuthors();