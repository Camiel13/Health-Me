export async function searchFood(query) {
  try {
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=15`;
    const response = await fetch(url);
    const data = await response.json();
    return data.products.map(p => {
      const nut = p.nutriments || {};
      const sq = parseFloat(p.serving_quantity) || parseFloat(p.product_quantity) || null;
      return {
        name: p.product_name || 'Unknown',
        calories: nut['energy-kcal_100g'] || 0,
        carbs: nut['carbohydrates_100g'] || 0,
        protein: nut['proteins_100g'] || 0,
        fat: nut['fat_100g'] || 0,
        fiber: nut['fiber_100g'] || 0,
        sodium: nut['sodium_100g'] ? nut['sodium_100g'] * 1000 : 0,
        serving_quantity: sq,
        serving_size: p.serving_size || ''
      };
    });
  } catch(e) {
    console.error(e);
    return [];
  }
}

export async function searchBarcode(barcode) {
  try {
    const url = `https://world.openfoodfacts.org/api/v0/product/${encodeURIComponent(barcode)}.json`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.status === 1 && data.product) {
      const p = data.product;
      const nut = p.nutriments || {};
      const sq = parseFloat(p.serving_quantity) || parseFloat(p.product_quantity) || null;
      return {
        name: p.product_name || 'Unknown',
        calories: nut['energy-kcal_100g'] || 0,
        carbs: nut['carbohydrates_100g'] || 0,
        protein: nut['proteins_100g'] || 0,
        fat: nut['fat_100g'] || 0,
        fiber: nut['fiber_100g'] || 0,
        sodium: nut['sodium_100g'] ? nut['sodium_100g'] * 1000 : 0,
        serving_quantity: sq,
        serving_size: p.serving_size || ''
      };
    }
  } catch (e) {
    console.error(e);
  }
  return null;
}
