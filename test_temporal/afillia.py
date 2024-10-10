import requests

# Definir la API key obtenida del portal de desarrolladores de Elsevier
api_key = 'TU_API_KEY'

# URL base para la búsqueda de afiliaciones
url = 'https://api.elsevier.com/content/search/affiliation'

# Parámetros de búsqueda
params = {
    'query': 'Ecuador',
    'apiKey': "a11695806cabc537ce8f4abca35dc118"
}

# Realizar la solicitud a la API
response = requests.get(url, params=params)

# Verificar si la solicitud fue exitosa
if response.status_code == 200:
    data = response.json()
    for affiliation in data['search-results']['entry']:
        print(f"Universidad: {affiliation['affiliation-name']}, Scopus ID: {affiliation['dc:identifier']}")
else:
    print(f"Error: {response.status_code}")
