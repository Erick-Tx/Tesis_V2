require('dotenv').config();
const axios = require('axios');
const mongoose = require('mongoose');

// Definición del esquema para los artículos
const ArticleSchema = new mongoose.Schema({
  authorId: String, // Campo para almacenar el ID del autor
  scopusId: { type: String, unique: true, index: true },
  metadata: mongoose.Schema.Types.Mixed
});

// Creación del modelo de Mongoose
const Article = mongoose.model('Article', ArticleSchema);

// Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB.'))
  .catch(err => console.error('Database connection failed:', err));

// Función para obtener publicaciones de la API de Scopus
const fetchPublications = async (authorId) => {
  try {
    const url = `https://api.elsevier.com/content/search/scopus`;
    const apikey = process.env.SCOPUS_API_KEY;
    let allEntries = [];
    let start = 0;
    let count = 25;

    while (true) {
      const params = {
        query: `AU-ID(${authorId})`,
        apikey,
        start,
        count
      };

      const response = await axios.get(url, { params });
      const entries = response.data['search-results'].entry;

      if (!entries || entries.length === 0) {
        break;
      }

      allEntries = [...allEntries, ...entries];
      start += count;
    }

    return allEntries;
  } catch (error) {
    console.error('Error fetching data:', error);
    return [];
  }
};

// Función para guardar artículos en MongoDB
const saveArticles = async (articles, authorId) => {
  for (const article of articles) {
    const { 'dc:identifier': scopusId, ...metadata } = article;
    const identifier = scopusId.split(':')[1]; // Extraer el ID de Scopus
    await Article.updateOne({ scopusId: identifier }, { $set: { authorId, metadata } }, { upsert: true });
    console.log('Article updated or inserted:', identifier);
  }
};

// Función para ejecutar el script cada minuto
function ejecutarScript() {
  (async () => {
    try {
      const authorIds = ['57200372107', '57541450600', '57202499664', '56496710900', '57196051499', '26667704700', '7202571211']; // Lista de IDs de autores

      for (const authorId of authorIds) {
        const articles = await fetchPublications(authorId);
        if (articles && articles.length > 0) {
          await saveArticles(articles, authorId);
        } else {
          console.log(`No articles found or error occurred for author ID: ${authorId}.`);
        }
      }
    } catch (error) {
      console.error('An error occurred:', error);
    }

    setTimeout(ejecutarScript, 60000); // Espera 1 minuto (60000 milisegundos)
    console.log("Actualizado")
  })();
}

// Ejecutar el script inicialmente
ejecutarScript();