/* ---------- 1. DATA AWAL / STATE ---------- */

// Akan kita load dari localStorage (jika ada)
let products = [];
let cart = [];

/* ---------- 2. FUNGSI INISIALISASI SCANNER ---------- */
function startScanner() {
  if (Quagga.initialized) {
    Quagga.stop();
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
      console.log(err);
      alert("Ada masalah dalam inisialisasi scanner: " + err);
      return;
    }
    Quagga.initialized = true;
    Quagga.start();
  });

  Quagga.onDetected(function(data){
    let kode = data.codeResult.code;
    // Stop agar tidak berulang
    Quagga.stop();

    let foundProduct = products.find(p => p.barcode === kode);
    if(foundProduct) {
      // Tampilkan modal qty
      showQuantityModal(foundProduct);
    } else {
      alert("Produk dengan barcode " + kode + " belum terdaftar.");
      // Restart scanner
      startScanner();
    }
  });
}

/* ---------- 3. FUNGSI TAMPIL MODAL JUMLAH (SETELAH SCAN) ---------- */
function showQuantityModal(product) {
  document.getElementById("modal-quantity").style.display = "block";
  document.getElementById("modal-quantity-product-name").textContent = product.name;
  document.getElementById("quantity-input").value = 1;

  // simpan barcode ke dataset 
  let modal = document.getElementById("modal-quantity");
  modal.dataset.barcode = product.barcode;
}

/* ---------- 4. FUNGSI NAVIGASI: GANTI SECTION ---------- */
function showSection(sectionId) {
  // Hide semua section
  document.querySelectorAll("section").forEach(sec => sec.style.display = "none");
  // Tampilkan sectionId
  document.getElementById(sectionId).style.display = "block";

  // Handle active class bottom nav
  document.querySelectorAll(".nav-button").forEach(btn => {
    btn.classList.remove("active");
  });
  if(sectionId === "scanner-section") {
    document.getElementById("btn-nav-scanner").classList.add("active");
    startScanner();
  } else if(sectionId === "data-produk-section"){
    document.getElementById("btn-nav-data-produk").classList.add("active");
    renderProductList();
  }
}

/* ---------- 5. RENDER DATA PRODUK ---------- */
function renderProductList() {
  let listDiv = document.getElementById("product-list");
  listDiv.innerHTML = ""; 

  products.forEach(prod => {
    let item = document.createElement("div");
    item.classList.add("product-item");

    if(prod.img) {
      let img = document.createElement("img");
      img.src = prod.img;
      item.appendChild(img);
    }

    let info = document.createElement("div");
    info.classList.add("info");
    info.innerHTML = `<strong>${prod.name}</strong><br/>
                      Barcode: ${prod.barcode}<br/>
                      Harga: Rp ${prod.price}`;
    item.appendChild(info);

    listDiv.appendChild(item);
  });
}

/* ---------- 6. FUNGSI SHOW/HIDE MODAL ---------- */
function showModal(modalId) {
  document.getElementById(modalId).style.display = "block";
}

function hideModal(modalId) {
  document.getElementById(modalId).style.display = "none";
}

/* ---------- 7. FUNGSI KERANJANG ---------- */
function addToCart(barcode, qty) {
  let product = products.find(p => p.barcode === barcode);
  if(!product) return;

  let cartItem = cart.find(i => i.barcode === barcode);
  if(cartItem) {
    cartItem.qty += qty;
  } else {
    cart.push({
      barcode: product.barcode,
      name: product.name,
      price: product.price,
      qty: qty
    });
  }
}

function renderCart() {
  let cartItemsDiv = document.getElementById("cart-items");
  cartItemsDiv.innerHTML = "";

  let total = 0;
  cart.forEach(item => {
    let lineTotal = item.price * item.qty;
    total += lineTotal;

    let div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `<div>${item.name} (x${item.qty})</div>
                     <div>Rp ${lineTotal}</div>`;
    cartItemsDiv.appendChild(div);
  });

  document.getElementById("cart-total").textContent = total;
}

/* ---------- 8. LOCALSTORAGE HANDLER ---------- */
function saveProductsToLocal() {
  localStorage.setItem("products", JSON.stringify(products));
}

function loadProductsFromLocal() {
  const saved = localStorage.getItem("products");
  if (saved) {
    products = JSON.parse(saved);
  } else {
    products = [];
  }
}

/* ---------- 9. SETUP EVENTS ---------- */
document.addEventListener("DOMContentLoaded", () => {
  // Load data produk dari localStorage
  loadProductsFromLocal();

  // Default: buka scanner
  showSection("scanner-section");

  // Bottom Nav Buttons
  document.getElementById("btn-nav-scanner").addEventListener("click", () => {
    showSection("scanner-section");
  });
  document.getElementById("btn-nav-data-produk").addEventListener("click", () => {
    showSection("data-produk-section");
  });

  // Tambah Produk Button
  document.getElementById("btn-add-product").addEventListener("click", () => {
    showModal("modal-add-product");
  });

  // Modal Add Product: Simpan
  document.getElementById("btn-save-product").addEventListener("click", () => {
    let barcode = document.getElementById("product-barcode").value.trim();
    let name = document.getElementById("product-name").value.trim();
    let price = parseInt(document.getElementById("product-price").value);
    let img = document.getElementById("product-img").value.trim();

    if(!barcode || !name || !price) {
      alert("Mohon isi semua field yang wajib (Barcode, Nama, Harga).");
      return;
    }

    // Cek jika barcode sudah ada
    let already = products.find(p => p.barcode === barcode);
    if(already) {
      alert("Barcode sudah terdaftar. Gunakan barcode lain.");
      return;
    }

    products.push({ barcode, name, price, img });
    // Simpan ke localStorage
    saveProductsToLocal();

    hideModal("modal-add-product");

    // Reset form
    document.getElementById("product-barcode").value = "";
    document.getElementById("product-name").value = "";
    document.getElementById("product-price").value = "";
    document.getElementById("product-img").value = "";

    // Refresh list
    renderProductList();
  });

  // Modal Add Product: Batal
  document.getElementById("btn-cancel-product").addEventListener("click", () => {
    hideModal("modal-add-product");
  });

  // Modal Quantity: Tambahkan ke Keranjang
  document.getElementById("btn-add-to-cart").addEventListener("click", () => {
    let qty = parseInt(document.getElementById("quantity-input").value);
    let modal = document.getElementById("modal-quantity");
    let barcode = modal.dataset.barcode;

    addToCart(barcode, qty);

    hideModal("modal-quantity");
    modal.dataset.barcode = "";

    // Kembali ke scanner
    showSection("scanner-section");
  });

  // Modal Quantity: Batal
  document.getElementById("btn-cancel-quantity").addEventListener("click", () => {
    hideModal("modal-quantity");
    let modal = document.getElementById("modal-quantity");
    modal.dataset.barcode = "";

    // Kembali ke scanner
    showSection("scanner-section");
  });

  // Floating button Cart
  document.getElementById("btn-cart").addEventListener("click", () => {
    renderCart();
    showModal("modal-cart");
  });

  // Modal Cart: Tutup
  document.getElementById("btn-close-cart").addEventListener("click", () => {
    hideModal("modal-cart");
  });

  // Hitung kembalian saat input pembayaran
  document.getElementById("payment-input").addEventListener("input", () => {
    let payment = parseInt(document.getElementById("payment-input").value) || 0;
    let total = parseInt(document.getElementById("cart-total").textContent) || 0;
    let change = payment - total;
    document.getElementById("change-amount").textContent = change < 0 ? 0 : change;
  });

  // Tombol Checkout
  document.getElementById("btn-checkout").addEventListener("click", () => {
    let total = parseInt(document.getElementById("cart-total").textContent);
    let payment = parseInt(document.getElementById("payment-input").value) || 0;
    if(payment < total) {
      alert("Uang dibayar kurang dari total. Cek kembali.");
      return;
    }
    let change = payment - total;
    alert("Transaksi selesai!\nKembalian: Rp " + change);

    // Reset cart
    cart = [];
    hideModal("modal-cart");
    document.getElementById("payment-input").value = "";
    document.getElementById("change-amount").textContent = 0;
    document.getElementById("cart-total").textContent = 0;
  });
});
