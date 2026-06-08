export async function searchFood(query) {
  const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=5`;
  const response = await fetch(url);
  const data = await response.json();
  return data.products.map(p => ({
    name: p.product_name || 'Unknown',
    calories: p.nutriments ? p.nutriments['energy-kcal_100g'] || 0 : 0
  }));
}
