export async function searchFood(query) {
  try {
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=5`;
    const response = await fetch(url);
    const data = await response.json();
    return data.products.map(p => {
      const nut = p.nutriments || {};
      return {
        name: p.product_name || 'Unknown',
        calories: nut['energy-kcal_100g'] || 0,
        carbs: nut['carbohydrates_100g'] || 0,
        protein: nut['proteins_100g'] || 0,
        fat: nut['fat_100g'] || 0,
        fiber: nut['fiber_100g'] || 0,
        sodium: nut['sodium_100g'] ? nut['sodium_100g'] * 1000 : 0
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
      return {
        name: p.product_name || 'Unknown',
        calories: nut['energy-kcal_100g'] || 0,
        carbs: nut['carbohydrates_100g'] || 0,
        protein: nut['proteins_100g'] || 0,
        fat: nut['fat_100g'] || 0,
        fiber: nut['fiber_100g'] || 0,
        sodium: nut['sodium_100g'] ? nut['sodium_100g'] * 1000 : 0
      };
    }
  } catch (e) {
    console.error(e);
  }
  return null;
}
