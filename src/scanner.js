import { searchBarcode } from './api.js';

export function initScanner() {
  const scanBtn = document.getElementById('start-scan-btn');
  const readerDiv = document.getElementById('reader');
  let html5QrcodeScanner;

  if(scanBtn) {
    scanBtn.addEventListener('click', () => {
      readerDiv.style.display = 'block';
      if(!html5QrcodeScanner) {
        html5QrcodeScanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: {width: 300, height: 250} }, false);
        html5QrcodeScanner.render(async (decodedText) => {
          html5QrcodeScanner.clear();
          readerDiv.style.display = 'none';
          document.getElementById('food-search').value = 'Searching barcode...';
          
          const food = await searchBarcode(decodedText);
          if (food && window.promptAndAddFood) {
            window.promptAndAddFood(food);
          } else {
            alert(`Product not found for barcode: ${decodedText}`);
            document.getElementById('food-search').value = '';
          }
        }, (err) => { /* ignore */ });
      }
    });
  }
}
