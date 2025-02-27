/* ---------- 1. DATA AWAL / STATE ---------- */

let products = [];
let cart = [];

/* ---------- 2. INIT / LOAD DATA DARI LOCALSTORAGE ---------- */
function loadProductsFromLocal() {
  const saved = localStorage.getItem("products");
  if (saved) {
    products = JSON.parse(saved);
  } else {
    products = [];
  }
}

function saveProductsToLocal() {
  localStorage.setItem("products", JSON.stringify(products));
}

/* ---------- 3. FUNGSI INISIALISASI SCANNER (LIVE VIDEO) ---------- */
let quaggaStarted = false; // penanda apakah scanner sudah jalan

function startScanner() {
  // Hentikan kalau ada instance lama
  if (quaggaStarted) {
    Quagga.stop();
    quaggaStarted = false;
  }

  Quagga.init({
    inputStream: {
      name: "Live",
      type: "LiveStream",
      target: document.querySelector('#interactive'),
      constraints: {
        facingMode: "environment"
      }
    },
    decoder: {
      readers: ["ean_reader", "code_128_reader"]
    }
  }, function(err) {
    if (err) {
      console.error(err);
      alert("Inisialisasi scanner gagal: " + err);
      return;
    }
    Quagga.start();
    quaggaStarted = true;
  });

  Quagga.onDetected(onBarcodeDetected);
}

/* ---------- 4. EVENT KETIKA BARCODE TEREDETEKSI (LIVE SCAN) ---------- */
function onBarcodeDetected(data) {
  let code = data.codeResult.code;
  // Stop scanning sesaat
  Quagga.stop();
  quaggaStarted = false;

  // Cari produk
  let found = products.find(p => p.barcode === code);
  if (found) {
    showQuantityModal(found);
  } else {
    alert("Barcode " + code + " belum terdaftar!");
    // Bisa langsung restart scanner jika diinginkan:
    startScanner();
  }
}

/* ---------- 5. SCAN DARI GAMBAR (GALERI) ---------- */
function scanFromImage(file) {
  if (!file) return;

  let reader = new FileReader();
  reader.onload = function(e) {
    let dataURL = e.target.result;
    Quagga.decodeSingle({
      src: dataURL,
      decoder: {
        readers: ["ean_reader", "code_128_reader"]
      }
    }, function(result) {
      if (result && result.codeResult) {
        let code = result.codeResult.code;
        let found = products.find(p => p.barcode === code);
        if (found) {
          showQuantityModal(found);
        } else {
          alert("Barcode " + code + " belum terdaftar!");
        }
      } else {
        alert("Gagal mendeteksi barcode dari gambar.");
      }
    });
  };
  reader.readAsDataURL(file);
}

/* ---------- 6. SCAN GMBR (AMBI L FOTO) UNTUK INPUT BARCODE SAAT TAMBAH PRODUK ---------- */
function scanBarcodeForProduct(file) {
  if (!file) return;
  let reader = new FileReader();
  reader.onload = function(e) {
    let dataURL = e.target.result;
    Quagga.decodeSingle({
      src: dataURL,
      decoder: {
        readers: ["ean_reader", "code_128_reader"]
      }
    }, function(result) {
      if (result && result.codeResult) {
        let code = result.codeResult.code;
        // Set ke input product-barcode
        document.getElementById("product-barcode").value = code;
      } else {
        alert("Tidak berhasil mendeteksi barcode. Coba foto yang lebih jelas.");
      }
    });
  };
  reader.readAsDataURL(file);
}

/* ---------- 7. TAMPILKAN MODAL JUMLAH ---------- */
function showQuantityModal(product) {
  document.getElementById("modal-quantity").style.display = "block";
  document.getElementById("modal-quantity-product-name").textContent = product.name;
  document.getElementById("quantity-input").value = 1;

  let modal = document.getElementById("modal-quantity");
  modal.dataset.barcode = product.barcode;
}

/* ---------- 8. NAVIGASI ANTAR SECTION ---------- */
function showSection(sectionId) {
  // Tutup semua section
  document.querySelectorAll("section").forEach(sec => {
    sec.style.display = "none";
  });
  // Tampilkan section yang dipilih
  let target = document.getElementById(sectionId);
  if (target) target.style.display = "block";

  // Handle active nav
  document.querySelectorAll(".nav-button").forEach(btn => btn.classList.remove("active"));
  if (sectionId === "scanner-section") {
    document.getElementById("btn-nav-scanner").classList.add("active");
    startScanner();
  } else if (sectionId === "data-produk-section") {
    document.getElementById("btn-nav-data-produk").classList.add("active");
    renderProductList();
    // Berhenti dulu scanner
    if (quaggaStarted) {
      Quagga.stop();
      quaggaStarted = false;
    }
  }
}

/* ---------- 9. RENDER DATA PRODUK ---------- */
function renderProductList() {
  let listDiv = document.getElementById("product-list");
  listDiv.innerHTML = "";

  products.forEach(prod => {
    let item = document.createElement("div");
    item.classList.add("product-item");

    if (prod.img) {
      let img = document.createElement("img");
      img.src = prod.img;
      item.appendChild(img);
    }

    let info = document.createElement("div");
    info.classList.add("info");
    info.innerHTML = `
      <strong>${prod.name}</strong><br/>
      Barcode: ${prod.barcode}<br/>
      Harga: Rp ${prod.price}
    `;
    item.appendChild(info);

    // Tombol hapus
    let delBtn = document.createElement("button");
    delBtn.classList.add("delete-product-btn");
    delBtn.textContent = "Hapus";
    delBtn.addEventListener("click", () => {
      deleteProduct(prod.barcode);
    });
    item.appendChild(delBtn);

    listDiv.appendChild(item);
  });
}

/* ---------- 10. MODAL SHOW/HIDE ---------- */
function showModal(id) {
  document.getElementById(id).style.display = "block";
}

function hideModal(id) {
  document.getElementById(id).style.display = "none";
}

/* ---------- 11. KERANJANG ---------- */
function addToCart(barcode, qty) {
  let p = products.find(x => x.barcode === barcode);
  if (!p) return;

  let cartItem = cart.find(c => c.barcode === barcode);
  if (cartItem) {
    cartItem.qty += qty;
  } else {
    cart.push({
      barcode: p.barcode,
      name: p.name,
      price: p.price,
      qty: qty
    });
  }
}

function renderCart() {
  let cartDiv = document.getElementById("cart-items");
  cartDiv.innerHTML = "";

  let total = 0;
  cart.forEach(item => {
    let lineTotal = item.price * item.qty;
    total += lineTotal;

    let row = document.createElement("div");
    row.classList.add("cart-item");
    row.innerHTML = `
      <div>${item.name} (x${item.qty})</div>
      <div>Rp ${lineTotal}</div>
    `;
    cartDiv.appendChild(row);
  });

  document.getElementById("cart-total").textContent = total;
}

/* ---------- 12. FUNGSI PRODUK (TAMBAH, HAPUS, RESET, BACKUP, RESTORE) ---------- */
function addProduct(barcode, name, price, img) {
  // Cek jika barcode sudah ada
  let already = products.find(p => p.barcode === barcode);
  if (already) {
    alert("Barcode sudah terdaftar!");
    return;
  }
  products.push({ barcode, name, price, img });
  saveProductsToLocal();
}

function deleteProduct(barcode) {
  products = products.filter(p => p.barcode !== barcode);
  saveProductsToLocal();
  renderProductList();
}

function resetData() {
  // Hapus localStorage
  localStorage.removeItem("products");
  // Kosongkan array
  products = [];
  // Kosongkan cart
  cart = [];
  renderProductList();
  alert("Semua data produk & cart telah direset!");
}

/* Backup data -> unduh file JSON */
function backupData() {
  let dataStr = JSON.stringify(products, null, 2);
  let blob = new Blob([dataStr], { type: "application/json" });
  let url = URL.createObjectURL(blob);

  let a = document.createElement("a");
  a.href = url;
  a.download = "backup_produk.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/* Restore data -> upload file JSON */
function restoreData(file) {
  let reader = new FileReader();
  reader.onload = function(e) {
    try {
      let obj = JSON.parse(e.target.result);
      if (Array.isArray(obj)) {
        products = obj;
        saveProductsToLocal();
        renderProductList();
        alert("Restore data berhasil!");
      } else {
        alert("Format file tidak valid!");
      }
    } catch (err) {
      alert("Gagal parse JSON: " + err);
    }
  };
  reader.readAsText(file);
}

/* ---------- 13. EVENT LISTENERS ---------- */
document.addEventListener("DOMContentLoaded", () => {
  loadProductsFromLocal();

  // Default buka scanner
  showSection("scanner-section");

  // Bottom nav
  document.getElementById("btn-nav-scanner").addEventListener("click", () => {
    showSection("scanner-section");
  });
  document.getElementById("btn-nav-data-produk").addEventListener("click", () => {
    showSection("data-produk-section");
  });

  // Tambah produk button
  document.getElementById("btn-add-product").addEventListener("click", () => {
    showModal("modal-add-product");
  });

  // Simpan produk
  document.getElementById("btn-save-product").addEventListener("click", () => {
    let barcode = document.getElementById("product-barcode").value.trim();
    let name = document.getElementById("product-name").value.trim();
    let price = parseInt(document.getElementById("product-price").value) || 0;
    let img = document.getElementById("product-img").value.trim();

    if (!barcode || !name || !price) {
      alert("Mohon isi Barcode, Nama, dan Harga dengan benar!");
      return;
    }
    addProduct(barcode, name, price, img);
    hideModal("modal-add-product");

    // Bersihkan form
    document.getElementById("product-barcode").value = "";
    document.getElementById("product-name").value = "";
    document.getElementById("product-price").value = "";
    document.getElementById("product-img").value = "";

    // Refresh
    renderProductList();
  });

  // Batal tambah produk
  document.getElementById("btn-cancel-product").addEventListener("click", () => {
    hideModal("modal-add-product");
  });

  // Modal quantity -> add to cart
  document.getElementById("btn-add-to-cart").addEventListener("click", () => {
    let qty = parseInt(document.getElementById("quantity-input").value) || 1;
    let modal = document.getElementById("modal-quantity");
    let barcode = modal.dataset.barcode;
    addToCart(barcode, qty);

    hideModal("modal-quantity");
    modal.dataset.barcode = "";

    // Jika ingin kembali auto-scanner:
    showSection("scanner-section");
  });

  // Modal quantity -> batal
  document.getElementById("btn-cancel-quantity").addEventListener("click", () => {
    let modal = document.getElementById("modal-quantity");
    modal.dataset.barcode = "";
    hideModal("modal-quantity");
    showSection("scanner-section");
  });

  // Floating Cart
  document.getElementById("btn-cart").addEventListener("click", () => {
    renderCart();
    showModal("modal-cart");
  });

  // Tutup cart
  document.getElementById("btn-close-cart").addEventListener("click", () => {
    hideModal("modal-cart");
  });

  // Input payment -> hitung kembalian
  document.getElementById("payment-input").addEventListener("input", () => {
    let payment = parseInt(document.getElementById("payment-input").value) || 0;
    let total = parseInt(document.getElementById("cart-total").textContent) || 0;
    let change = payment - total;
    document.getElementById("change-amount").textContent = change < 0 ? 0 : change;
  });

  // Checkout
  document.getElementById("btn-checkout").addEventListener("click", () => {
    let total = parseInt(document.getElementById("cart-total").textContent) || 0;
    let payment = parseInt(document.getElementById("payment-input").value) || 0;
    if (payment < total) {
      alert("Uang dibayar kurang dari total!");
      return;
    }
    let change = payment - total;
    alert("Transaksi selesai!\nKembalian: Rp " + change);

    // Reset cart
    cart = [];
    hideModal("modal-cart");
    document.getElementById("payment-input").value = "";
    document.getElementById("change-amount").textContent = "0";
    document.getElementById("cart-total").textContent = "0";
  });

  // Scan barcode dari galeri
  document.getElementById("file-input").addEventListener("change", (e) => {
    let file = e.target.files[0];
    if (file) {
      scanFromImage(file);
    }
    e.target.value = ""; // reset input
  });

  // Ambil foto barcode di form tambah produk
  document.getElementById("btn-scan-barcode").addEventListener("click", () => {
    document.getElementById("barcode-file-input").click();
  });
  document.getElementById("barcode-file-input").addEventListener("change", (e) => {
    let file = e.target.files[0];
    if (file) {
      scanBarcodeForProduct(file);
    }
    e.target.value = "";
  });

  // Reset data
  document.getElementById("btn-reset-data").addEventListener("click", () => {
    if (confirm("Yakin reset semua data?")) {
      resetData();
      renderProductList();
    }
  });

  // Backup data
  document.getElementById("btn-backup-data").addEventListener("click", () => {
    backupData();
  });

  // Restore data
  document.getElementById("restore-file").addEventListener("change", (e) => {
    let file = e.target.files[0];
    if (file) {
      restoreData(file);
    }
    e.target.value = "";
  });
});
