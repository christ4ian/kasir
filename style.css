/* ======= GLOBAL STATE ======= */
let products = [];
let cart = [];
let lastDetectedCode = ""; // Menyimpan barcode terakhir

/* ======= LOAD & SAVE KE LOCALSTORAGE ======= */
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

/* ======= SCANNER SETUP (Quagga) ======= */
let quaggaInitialized = false;

function initScanner() {
  if (quaggaInitialized) {
    return; // Sudah diinit
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
      readers: ["ean_reader","code_128_reader"]
    }
  }, function(err) {
    if (err) {
      console.error(err);
      alert("Gagal inisialisasi scanner: " + err);
      return;
    }
    Quagga.start();
    quaggaInitialized = true;
  });

  Quagga.onDetected((data) => {
    let code = data.codeResult.code;
    // Untuk meminimalisir "bergetar" / repeated detection, kita cek apakah sama dengan lastDetectedCode
    if (code !== lastDetectedCode) {
      lastDetectedCode = code;
      document.getElementById("detected-code").value = code;
    }
  });
}

/* ======= NAVIGASI ANTAR SECTION ======= */
function showSection(sectionId) {
  document.querySelectorAll("section").forEach(sec => sec.style.display = "none");
  document.getElementById(sectionId).style.display = "block";

  // Update nav-button active
  document.querySelectorAll(".nav-button").forEach(btn => btn.classList.remove("active"));

  if (sectionId === "scanner-section") {
    document.getElementById("btn-nav-scanner").classList.add("active");
    initScanner();
  } else if (sectionId === "data-produk-section") {
    document.getElementById("btn-nav-data-produk").classList.add("active");
    renderProductList();
  } else if (sectionId === "settings-section") {
    document.getElementById("btn-nav-settings").classList.add("active");
  }
}

/* ======= SCAN DARI GALERI (decodeSingle) ======= */
function scanFromImage(file) {
  let reader = new FileReader();
  reader.onload = function(e) {
    Quagga.decodeSingle({
      src: e.target.result,
      decoder: { readers: ["ean_reader","code_128_reader"] }
    }, (result) => {
      if (result && result.codeResult) {
        document.getElementById("detected-code").value = result.codeResult.code;
        lastDetectedCode = result.codeResult.code;
      } else {
        alert("Gagal mendeteksi barcode dari gambar.");
      }
    });
  };
  reader.readAsDataURL(file);
}

/* ======= SCAN BARCODE (IMAGE) UNTUK INPUT PRODUK ======= */
function scanBarcodeForProduct(file) {
  let reader = new FileReader();
  reader.onload = function(e) {
    Quagga.decodeSingle({
      src: e.target.result,
      decoder: { readers: ["ean_reader","code_128_reader"] }
    }, (result) => {
      if (result && result.codeResult) {
        // taruh ke #product-barcode
        document.getElementById("product-barcode").value = result.codeResult.code;
      } else {
        alert("Gagal mendeteksi barcode dari foto. Pastikan fokus & jelas!");
      }
    });
  };
  reader.readAsDataURL(file);
}

/* ======= TAMBAH PRODUK & HAPUS PRODUK ======= */
function addProduct(barcode, name, price, imgBase64) {
  // Cek barcode ganda
  let already = products.find(p => p.barcode === barcode);
  if (already) {
    alert("Barcode sudah ada!");
    return;
  }
  products.push({ barcode, name, price, img: imgBase64 });
  saveProductsToLocal();
}

function deleteProduct(barcode) {
  products = products.filter(p => p.barcode !== barcode);
  saveProductsToLocal();
  renderProductList();
}

/* ======= TAMPIL LIST PRODUK ======= */
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
    delBtn.textContent = "Hapus";
    delBtn.classList.add("delete-product-btn");
    delBtn.addEventListener("click", () => {
      if (confirm("Hapus produk ini?")) {
        deleteProduct(prod.barcode);
      }
    });
    item.appendChild(delBtn);

    listDiv.appendChild(item);
  });
}

/* ======= KERANJANG ======= */
function addToCart(barcode, qty) {
  let p = products.find(x => x.barcode === barcode);
  if (!p) return;

  let existing = cart.find(c => c.barcode === barcode);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ barcode: p.barcode, name: p.name, price: p.price, qty });
  }
}

function renderCart() {
  let cartItemsDiv = document.getElementById("cart-items");
  cartItemsDiv.innerHTML = "";
  let total = 0;
  cart.forEach(item => {
    let lineTotal = item.price * item.qty;
    total += lineTotal;
    let row = document.createElement("div");
    row.classList.add("cart-item");
    row.innerHTML = `<div>${item.name} (x${item.qty})</div><div>Rp ${lineTotal}</div>`;
    cartItemsDiv.appendChild(row);
  });
  document.getElementById("cart-total").textContent = total;
}

/* ======= MODAL ======= */
function showModal(id) {
  document.getElementById(id).style.display = "block";
}
function hideModal(id) {
  document.getElementById(id).style.display = "none";
}

/* ======= BACKUP, RESTORE, RESET DATA ======= */
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

function restoreData(file) {
  let reader = new FileReader();
  reader.onload = function(e) {
    try {
      let arr = JSON.parse(e.target.result);
      if (Array.isArray(arr)) {
        products = arr;
        saveProductsToLocal();
        alert("Restore berhasil!");
        renderProductList();
      } else {
        alert("Format JSON tidak valid!");
      }
    } catch (err) {
      alert("Gagal memproses file: " + err);
    }
  };
  reader.readAsText(file);
}

function resetData() {
  if (!confirm("Anda yakin ingin RESET semua data?")) return;
  localStorage.removeItem("products");
  products = [];
  cart = [];
  renderProductList();
  alert("Data berhasil di-reset!");
}

/* ======= DARK MODE & THEME COLOR ======= */
function toggleDarkMode(checked) {
  if (checked) {
    document.body.classList.add("dark-mode");
  } else {
    document.body.classList.remove("dark-mode");
  }
}

function setThemeColor(color) {
  // Ubah warna app-bar, fab, dsb. via inline style
  document.querySelector(".app-bar").style.backgroundColor = color;
  document.querySelectorAll(".fab, .fab-cart").forEach(el => {
    el.style.backgroundColor = color;
  });
  // Ubah nav-button.active
  let activeBtns = document.querySelectorAll(".nav-button.active");
  activeBtns.forEach(btn => {
    btn.style.color = color;
  });
}

/* ======= DOMContentLoaded ======= */
document.addEventListener("DOMContentLoaded", () => {
  loadProductsFromLocal();
  showSection("scanner-section"); // default

  // NAV BOTTOM
  document.getElementById("btn-nav-scanner").addEventListener("click", () => {
    showSection("scanner-section");
  });
  document.getElementById("btn-nav-data-produk").addEventListener("click", () => {
    showSection("data-produk-section");
  });
  document.getElementById("btn-nav-settings").addEventListener("click", () => {
    showSection("settings-section");
  });

  // SCAN DARI GALERI
  document.getElementById("file-input").addEventListener("change", (e) => {
    let file = e.target.files[0];
    if (file) {
      scanFromImage(file);
    }
    e.target.value = "";
  });

  // TOMBOL OK DI SCANNER
  document.getElementById("btn-confirm-scan").addEventListener("click", () => {
    let code = document.getElementById("detected-code").value;
    if (!code) {
      alert("Belum ada barcode terdeteksi!");
      return;
    }
    // Cek apakah produk ada
    let found = products.find(p => p.barcode === code);
    if (found) {
      showQuantityModal(found);
    } else {
      alert("Produk dengan barcode " + code + " tidak ditemukan!");
    }
  });

  // TOMBOL CART
  document.getElementById("btn-cart").addEventListener("click", () => {
    renderCart();
    showModal("modal-cart");
  });

  // CART: TUTUP
  document.getElementById("btn-close-cart").addEventListener("click", () => {
    hideModal("modal-cart");
  });

  // CART: HITUNG KEMBALIAN
  document.getElementById("payment-input").addEventListener("input", () => {
    let payment = parseInt(document.getElementById("payment-input").value) || 0;
    let total = parseInt(document.getElementById("cart-total").textContent) || 0;
    let change = payment - total;
    document.getElementById("change-amount").textContent = change < 0 ? 0 : change;
  });

  // CART: CHECKOUT
  document.getElementById("btn-checkout").addEventListener("click", () => {
    let total = parseInt(document.getElementById("cart-total").textContent) || 0;
    let payment = parseInt(document.getElementById("payment-input").value) || 0;
    if (payment < total) {
      alert("Uang dibayar kurang dari total!");
      return;
    }
    let change = payment - total;
    alert("Transaksi selesai!\nKembalian: Rp " + change);
    cart = [];
    hideModal("modal-cart");
    document.getElementById("payment-input").value = "";
    document.getElementById("change-amount").textContent = 0;
    document.getElementById("cart-total").textContent = 0;
  });

  // TAMBAH PRODUK
  document.getElementById("btn-add-product").addEventListener("click", () => {
    showModal("modal-add-product");
  });

  // SIMPAN PRODUK
  document.getElementById("btn-save-product").addEventListener("click", () => {
    let barcode = document.getElementById("product-barcode").value.trim();
    let name = document.getElementById("product-name").value.trim();
    let price = parseInt(document.getElementById("product-price").value) || 0;

    if (!barcode || !name || !price) {
      alert("Mohon isi barcode, nama, dan harga dengan benar!");
      return;
    }

    // Ambil base64 image
    let preview = document.getElementById("product-image-preview");
    let imgBase64 = preview.dataset.img || "";

    addProduct(barcode, name, price, imgBase64);
    hideModal("modal-add-product");

    // Bersihkan form
    document.getElementById("product-barcode").value = "";
    document.getElementById("product-name").value = "";
    document.getElementById("product-price").value = "";
    preview.src = "";
    preview.style.display = "none";
    preview.dataset.img = "";

    // Refresh
    renderProductList();
  });

  // BATAL PRODUK
  document.getElementById("btn-cancel-product").addEventListener("click", () => {
    hideModal("modal-add-product");
  });

  // SCAN BARCODE VIA FOTO (UNTUK FORM PRODUK)
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

  // UPLOAD FOTO PRODUK (BASE64)
  document.getElementById("product-image-file").addEventListener("change", (e) => {
    let file = e.target.files[0];
    if (!file) return;
    let reader = new FileReader();
    reader.onload = function(evt) {
      let preview = document.getElementById("product-image-preview");
      preview.src = evt.target.result;
      preview.style.display = "block";
      preview.dataset.img = evt.target.result; // simpan base64 di dataset
    };
    reader.readAsDataURL(file);
  });

  // QUANTITY MODAL
  document.getElementById("btn-add-to-cart").addEventListener("click", () => {
    let qty = parseInt(document.getElementById("quantity-input").value) || 1;
    let modal = document.getElementById("modal-quantity");
    let barcode = modal.dataset.barcode;
    addToCart(barcode, qty);

    hideModal("modal-quantity");
    modal.dataset.barcode = "";
  });
  document.getElementById("btn-cancel-quantity").addEventListener("click", () => {
    let modal = document.getElementById("modal-quantity");
    modal.dataset.barcode = "";
    hideModal("modal-quantity");
  });

  // SETTINGS: BACKUP, RESTORE, RESET
  document.getElementById("btn-backup-data").addEventListener("click", () => {
    backupData();
  });
  document.getElementById("restore-file").addEventListener("change", (e) => {
    let file = e.target.files[0];
    if (file) {
      restoreData(file);
    }
    e.target.value = "";
  });
  document.getElementById("btn-reset-data").addEventListener("click", () => {
    resetData();
  });

  // SETTINGS: DARK MODE
  document.getElementById("dark-mode-toggle").addEventListener("change", (e) => {
    toggleDarkMode(e.target.checked);
  });

  // SETTINGS: THEME COLOR
  document.getElementById("color-theme-input").addEventListener("input", (e) => {
    let color = e.target.value;
    setThemeColor(color);
  });
});

/* ======= SHOW QUANTITY MODAL ======= */
function showQuantityModal(product) {
  document.getElementById("modal-quantity-product-name").textContent = product.name;
  document.getElementById("quantity-input").value = 1;
  let modal = document.getElementById("modal-quantity");
  modal.dataset.barcode = product.barcode;
  showModal("modal-quantity");
}
