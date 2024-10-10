const axios = require('axios');
const mongoose = require('mongoose');

// Conexión a la base de datos MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/scopusDB');
const db = mongoose.connection;

// Definición del esquema para la colección "autores"
const autorSchema = new mongoose.Schema({
  // Un campo para almacenar la respuesta JSON completa
  respuestaJSON: Object,
});

// Modelo para la colección "autores"
const Autor = mongoose.model('Autor', autorSchema);

// Función para realizar la consulta a la API y guardar los datos en MongoDB
async function consultaYGuardado(ids) {
  try {
    for (const id of ids) {
      // Realizar la consulta a la API
      const response = await axios.get(`https://api.elsevier.com/content/search/author?query=AU-ID(${id})&apiKey=7f59af901d2d86f78a1fd60c1bf9426a`);

      // Guardar la respuesta JSON completa en la base de datos
      const autor = new Autor({
        respuestaJSON: response.data,
      });
      await autor.save();
      console.log(`Respuesta JSON para el ID ${id} guardada en la base de datos.`);
    }
  } catch (error) {
    console.error('Error al realizar la consulta y guardar los datos:', error);
  } finally {
    // Cierra la conexión a la base de datos
    mongoose.disconnect();
  }
}

// Lista de IDs de autores
const ids = ['57200372107', '57541450600', '57202499664', '56496710900', '57196051499', '26667704700', '7202571211' ]; 
// Erick Cuenca, Rigoberto Fonseca, Eugenio Morocho, Rolando Armas, Gabriela Cajamarca, Sandra Hidalgo, Gema Gonzalez

// Ejecutar la función para realizar la consulta y guardar los datos
consultaYGuardado(ids);