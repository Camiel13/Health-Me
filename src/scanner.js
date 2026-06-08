import { searchFood } from './api.js';

export function initScanner() {
  const scanBtn = document.getElementById('start-scan-btn');
  const readerDiv = document.getElementById('reader');
  let html5QrcodeScanner;

  if(scanBtn) {
    scanBtn.addEventListener('click', () => {
      readerDiv.style.display = 'block';
      if(!html5QrcodeScanner) {
        html5QrcodeScanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: {width: 250, height: 100} }, false);
        html5QrcodeScanner.render(async (decodedText) => {
          html5QrcodeScanner.clear();
          readerDiv.style.display = 'none';
          document.getElementById('food-search').value = decodedText;
          alert(`Scanned: ${decodedText}`);
        }, (err) => { /* ignore */ });
      }
    });
  }
}
