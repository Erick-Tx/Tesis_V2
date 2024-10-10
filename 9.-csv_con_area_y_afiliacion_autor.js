const mongoose = require('mongoose');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// Conexión a MongoDB
const uri = 'mongodb://127.0.0.1:27017/scopusDB';

console.log('Conectando a MongoDB...');

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log('Conexión exitosa!');

    // Definir el esquema para los documentos en la colección autors
    const authorSchema = new mongoose.Schema({
      respuestaJSON: {
        'search-results': {
          entry: [
            {
              'dc:identifier': String,
              'preferred-name': {
                'given-name': String,
                'surname': String
              },
              'subject-area': [
                {
                  $: String
                }
              ],
              'affiliation-current': {
                'affiliation-name': String
              }
            }
          ]
        }
      }
    });

    const Author = mongoose.model('Author', authorSchema);

    console.log('Obteniendo documentos de la colección "autors"...');

    // Obtener los documentos de la colección
    Author.find({})
      .then(docs => {
        console.log(`Se encontraron ${docs.length} documentos.`);

        // Crear un arreglo con los datos que deseas
        const csvData = docs.map(doc => {
          const entry = doc.respuestaJSON['search-results'].entry[0];
          const subjectAreas = entry['subject-area'].map(area => area.$);
          const currentAffiliation = entry['affiliation-current']['affiliation-name'];

          return {
            //id: entry['dc:identifier'],
            //nombre: `${entry['preferred-name']['given-name']} ${entry['preferred-name']['surname']}`,
            subjectAreas: subjectAreas.join('|'), // Usar | como separador
            afiliacionActual: currentAffiliation
          };
        });

        console.log('Datos procesados correctamente.');

        // Crear un objeto CSV Writer
        const csvWriter = createCsvWriter({
          path: 'autores.csv',
          header: [
            { id: 'id', title: 'ID Scopus' },
            { id: 'nombre', title: 'Nombre' },
            { id: 'subjectAreas', title: 'Áreas de Investigación' },
            { id: 'afiliacionActual', title: 'Afiliación Actual' }
          ]
        });

        console.log('Escribiendo datos en el archivo CSV...');

        // Escribir los datos en el archivo CSV
        csvWriter.writeRecords(csvData)
          .then(() => {
            console.log('El archivo CSV ha sido creado exitosamente.');
            mongoose.disconnect();
          })
          .catch(err => console.error(err));
      })
      .catch(err => console.error('Error al obtener los documentos:', err));
  })
  .catch(err => console.error('Error de conexión:', err));