const searchCache = {};

export async function searchFood(query, retries = 3) {
  const qClean = query.trim().toLowerCase();
  if (searchCache[qClean]) {
    return searchCache[qClean];
  }
  try {
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=50`;
    const response = await fetch(url);
    if (!response.ok) {
      if (retries > 0) {
        await new Promise(res => setTimeout(res, 500));
        return searchFood(query, retries - 1);
      }
      throw new Error('API Error');
    }
    const data = await response.json();
    
    let products = (data.products || []).filter(p => {
      if (!p.product_name) return false;
      if (!p.nutriments) return false;
      const n = p.nutriments;
      return (n['energy-kcal_100g'] > 0 || n['carbohydrates_100g'] > 0 || n['proteins_100g'] > 0 || n['fat_100g'] > 0);
    });
    
    const queryWords = query.toLowerCase().split(/\s+/);
    products.sort((a, b) => {
      let aScore = 0;
      let bScore = 0;
      const aName = a.product_name.toLowerCase();
      const bName = b.product_name.toLowerCase();
      
      queryWords.forEach(w => {
        if (aName.includes(w)) aScore += 2;
        if (bName.includes(w)) bScore += 2;
      });
      
      // bonus if starts with
      if (aName.startsWith(query.toLowerCase())) aScore += 5;
      if (bName.startsWith(query.toLowerCase())) bScore += 5;
      
      return bScore - aScore;
    });
    
    // Remove 0 calorie things or totally irrelevant items if needed, but sorting is usually enough
    
    // Remove duplicates
    const uniqueProducts = [];
    const seen = new Set();
    
    for (const p of products) {
      const nameKey = p.product_name.toLowerCase().trim();
      const calKey = p.nutriments ? Math.round(p.nutriments['energy-kcal_100g'] || 0) : 0;
      const dedupeKey = `${nameKey}-${calKey}`;
      
      if (!seen.has(dedupeKey)) {
        seen.add(dedupeKey);
        uniqueProducts.push(p);
      }
    }
    
    const finalResults = uniqueProducts.slice(0, 15).map(p => {
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
    
    searchCache[qClean] = finalResults;
    return finalResults;
  } catch(e) {
    if (retries > 0) {
      await new Promise(res => setTimeout(res, 500));
      return searchFood(query, retries - 1);
    }
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
