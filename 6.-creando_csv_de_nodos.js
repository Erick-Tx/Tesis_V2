const fs = require('fs');
const mongoose = require('mongoose');
const ObjectsToCsv = require('objects-to-csv');

// Conectar con la base de datos MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/scopusDB');

// Definir el esquema para los documentos en la colección scivaldatas
const scivalDataSchema = new mongoose.Schema({
  scopusId: String,
  scivalData: {
    publication: {
      authors: [{
        name: String,
        id: String
      }]
    }
  }
});

// Crear un modelo basado en el esquema para la colección scivaldatas
const ScivalData = mongoose.model('ScivalData', scivalDataSchema);

// Función para extraer los nombres de los autores y sus IDs de los documentos
async function extractAuthors() {
  try {
    // Consulta para obtener los documentos de la colección scivaldatas
    const documents = await ScivalData.find({}, 'scivalData.publication.authors.name scivalData.publication.authors.id');

    // Crear un conjunto para almacenar autores y sus IDs únicos
    const uniqueAuthors = new Set();

    // Crear una matriz para almacenar los datos del archivo CSV
    const csvData = [];

    // Contador para el ID incremental
    let idCounter = 1;

    // Iterar sobre cada documento
    documents.forEach(document => {
      document.scivalData.publication.authors.forEach(author => {
        // Verificar si el autor y su ID ya existen en el conjunto
        if (!uniqueAuthors.has(author.id)) {
          // Agregar el autor y su ID al conjunto
          uniqueAuthors.add(author.id);
          
          // Agregar el autor y su ID a la matriz de datos CSV
          csvData.push({ Id: idCounter++, Label: author.name, ID_Scopus_Author: author.id });
        }
      });
    });

    // Guardar los datos únicos en un archivo CSV
    const csv = new ObjectsToCsv(csvData);
    await csv.toDisk('./nodos.csv');

    console.log('CSV file with unique authors created successfully.');
  } catch (error) {
    console.error('Error retrieving documents:', error);
  } finally {
    // Cerrar la conexión con la base de datos
    mongoose.connection.close();
  }
}

// Llamar a la función para extraer los autores
extractAuthors();
