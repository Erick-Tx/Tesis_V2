require('dotenv').config();
const axios = require('axios');
const mongoose = require('mongoose');

// Conectar a MongoDB
mongoose.connect(process.env.MONGO_URI);

// Modelo para los artículos en MongoDB
const ArticleSchema = new mongoose.Schema({
  scopusId: String,
});

const Article = mongoose.model('Article', ArticleSchema);

// Modelo para los datos de Scival en MongoDB
const ScivalDataSchema = new mongoose.Schema({
  scopusId: String,
  scivalData: mongoose.Schema.Types.Mixed
});

const ScivalData = mongoose.model('ScivalData', ScivalDataSchema);

// Función para obtener los scopusId de todos los artículos en la base de datos
const getScopusIdsFromDatabase = async () => {
  try {
    const articles = await Article.find({}, 'scopusId');
    return articles.map(article => article.scopusId);
  } catch (error) {
    console.error('Error retrieving Scopus IDs from database:', error);
    return [];
  }
};

// Función para realizar consultas a la API de Scival
const fetchScivalData = async (scopusIds) => {
  try {
    const results = [];
    for (const scopusId of scopusIds) {
      try {
        const url = `https://api.elsevier.com/analytics/scival/publication/${scopusId}?apiKey=${process.env.SCIVAL_API_KEY}`;
        const response = await axios.get(url);
        results.push({ scopusId, scivalData: response.data });
      } catch (error) {
        if (error.response && error.response.status === 404) {
          console.warn(`Scopus ID ${scopusId} not found (404). Skipping...`);
        } else {
          console.error(`Error fetching Scival data for Scopus ID ${scopusId}:`, error);
        }
      }
    }
    return results;
  } catch (error) {
    console.error('Error fetching Scival data:', error);
    return [];
  }
};

  
// Función para guardar los datos de Scival en MongoDB
const saveScivalData = async (scivalData) => {
  try {
    await ScivalData.insertMany(scivalData);
    console.log('Scival data saved successfully.');
  } catch (error) {
    console.error('Error saving Scival data:', error);
  }
};

// Ejecutar el proceso
(async () => {
  try {
    const scopusIds = await getScopusIdsFromDatabase();
    console.log('Scopus IDs:', scopusIds); // Mostrar los scopusId en la consola
    if (scopusIds.length === 0) {
      console.log('No Scopus IDs found in the database.');
      return;
    }
    const scivalData = await fetchScivalData(scopusIds);
    await saveScivalData(scivalData);
  } catch (error) {
    console.error('An error occurred:', error);
  } finally {
    mongoose.disconnect();
  }
})();
