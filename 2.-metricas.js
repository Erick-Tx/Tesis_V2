const axios = require('axios');
const mongoose = require('mongoose');

// Conexión a la base de datos MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/scopusDB');
const db = mongoose.connection;

// Definición del esquema para la colección "metricas_de_autores"
const metricasAutorSchema = new mongoose.Schema({
  // Un campo para almacenar la respuesta JSON completa
  respuestaJSON: Object,
});

// Modelo para la colección "metricas_de_autores"
const MetricasAutor = mongoose.model('autors_metrics', metricasAutorSchema);

// Función para realizar la consulta a la API y guardar los datos en MongoDB
async function consultaYGuardadoMetricas(autorIds) {
  try {
    for (const autorId of autorIds) {
      // Realizar la consulta a la API
      const response = await axios.get(`https://api.elsevier.com/analytics/scival/author/metrics?metricTypes=ScholarlyOutput%2CCitedPublications&authors=${autorId}&yearRange=5yrs&includeSelfCitations=true&byYear=true&includedDocs=AllPublicationTypes&journalImpactType=CiteScore&showAsFieldWeighted=false&indexType=hIndex&apiKey=7f59af901d2d86f78a1fd60c1bf9426a`);

      // Guardar la respuesta JSON completa en la base de datos
      const metricasAutor = new MetricasAutor({
        respuestaJSON: response.data,
      });
      await metricasAutor.save();
      console.log(`Respuesta JSON de métricas de autores para el ID ${autorId} guardada en la base de datos.`);
    }
  } catch (error) {
    console.error('Error al realizar la consulta y guardar los datos de métricas de autores:', error);
  } finally {
    // Cierra la conexión a la base de datos
    mongoose.disconnect();
  }
}

// Lista de IDs de autores
const autorIds = ['57200372107', '57541450600', '57202499664', '56496710900', '57196051499', '26667704700', '7202571211' ]; 

// Ejecutar la función para realizar la consulta y guardar los datos
consultaYGuardadoMetricas(autorIds);