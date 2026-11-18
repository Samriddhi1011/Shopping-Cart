const defaultProducts = [
  {
    id: 1,
    name: "Sony WH-1000XM5 Headphones",
    price: 24990,
    category: "Audio",
    image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500&q=80"
  },
  {
    id: 2,
    name: "Apple Watch Series 9",
    price: 41900,
    category: "Wearables",
    image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&q=80"
  },
  {
    id: 3,
    name: "Logitech MX Master 3S",
    price: 9495,
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&q=80"
  },
  {
    id: 4,
    name: "JBL Flip 6 Bluetooth Speaker",
    price: 11999,
    category: "Audio",
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&q=80"
  },
  {
    id: 5,
    name: "Keychron K2 Mechanical Keyboard",
    price: 8499,
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1595225476474-87563907a212?w=500&q=80"
  },
  {
    id: 6,
    name: "Galaxy Watch 6 Classic",
    price: 31999,
    category: "Wearables",
    image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=500&q=80"
  }
];

let products = JSON.parse(localStorage.getItem("store_products")) || defaultProducts;
let cart = JSON.parse(localStorage.getItem("store_cart")) || [];
let discountPercent = 0;

const productGrid = document.getElementById("productGrid");
const cartItemsBox = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const themeToggleBtn = document.getElementById("themeToggleBtn");

if (localStorage.getItem("store_theme") === "dark") {
  document.body.classList.add("dark-mode");
  themeToggleBtn.innerText = "☀️";
}

themeToggleBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  const isDark = document.body.classList.contains("dark-mode");
  themeToggleBtn.innerText = isDark ? "☀️" : "🌙";
  localStorage.setItem("store_theme", isDark ? "dark" : "light");
});

function formatINR(amount) {
  return "₹" + Math.round(amount).toLocaleString("en-IN");
}

function saveState() {
  localStorage.setItem("store_products", JSON.stringify(products));
  localStorage.setItem("store_cart", JSON.stringify(cart));
}

function renderProducts() {
  const searchTerm = searchInput.value.toLowerCase();
  const selectedCat = categoryFilter.value;

  const filtered = products.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm);
    const matchesCat = selectedCat === "all" || item.category === selectedCat;
    return matchesSearch && matchesCat;
  });

  if (filtered.length === 0) {
    productGrid.innerHTML = `<p style="color: var(--text-muted);">No matching products found.</p>`;
    return;
  }

  productGrid.innerHTML = filtered.map(product => `
    <div class="product-card">
      <img src="${product.image}" alt="${product.name}" class="product-img" 
           onerror="this.src='https://placehold.co/400x300?text=Gadget'">
      <div class="product-info">
        <span class="product-cat">${product.category}</span>
        <h3 class="product-title">${product.name}</h3>
        <div class="product-footer">
          <span class="product-price">${formatINR(product.price)}</span>
          <button class="add-btn" onclick="addToCart(${product.id}, this)">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  `).join("");
}

function addToCart(id, btnElement) {
  const existingItem = cart.find(item => item.id === id);

  if (existingItem) {
    existingItem.qty += 1;
  } else {
    const product = products.find(p => p.id === id);
    cart.push({ ...product, qty: 1 });
  }

  if (btnElement) {
    const originalText = btnElement.innerText;
    btnElement.innerText = "✓ Added";
    btnElement.classList.add("btn-added");
    
    setTimeout(() => {
      btnElement.innerText = originalText;
      btnElement.classList.remove("btn-added");
    }, 800);
  }

  saveState();
  renderCart();
}

function updateQty(id, change) {
  const item = cart.find(i => i.id === id);
  if (!item) return;

  item.qty += change;

  if (item.qty <= 0) {
    cart = cart.filter(i => i.id !== id);
  }

  saveState();
  renderCart();
}

function removeItem(id) {
  cart = cart.filter(item => item.id !== id);
  saveState();
  renderCart();
}

function renderCart() {
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  cartCount.innerText = totalItems;

  const checkoutBtn = document.getElementById("checkoutBtn");

  if (cart.length === 0) {
    cartItemsBox.innerHTML = `<div class="empty-cart">Your cart is empty. Add items from the store!</div>`;
    checkoutBtn.disabled = true;
    calculateBill(0);
    return;
  }

  checkoutBtn.disabled = false;

  cartItemsBox.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="item-details">
        <h4>${item.name}</h4>
        <span>${formatINR(item.price)} x ${item.qty}</span>
      </div>
      <div class="qty-controls">
        <button class="qty-btn" onclick="updateQty(${item.id}, -1)">-</button>
        <span>${item.qty}</span>
        <button class="qty-btn" onclick="updateQty(${item.id}, 1)">+</button>
        <button class="remove-btn" onclick="removeItem(${item.id})" title="Remove">&times;</button>
      </div>
    </div>
  `).join("");

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  calculateBill(subtotal);
}

function calculateBill(subtotal) {
  const discountAmount = (subtotal * discountPercent) / 100;
  const taxableAmount = subtotal - discountAmount;
  const gstAmount = taxableAmount * 0.18;
  const finalTotal = taxableAmount + gstAmount;

  document.getElementById("subtotalText").innerText = formatINR(subtotal);
  document.getElementById("taxText").innerText = formatINR(gstAmount);
  document.getElementById("totalText").innerText = formatINR(finalTotal);

  const discountRow = document.getElementById("discountRow");
  if (discountPercent > 0 && subtotal > 0) {
    discountRow.style.display = "flex";
    document.getElementById("discountText").innerText = `-${formatINR(discountAmount)}`;
  } else {
    discountRow.style.display = "none";
  }
}

document.getElementById("applyPromoBtn").addEventListener("click", () => {
  const code = document.getElementById("promoInput").value.trim().toUpperCase();
  const msg = document.getElementById("promoMsg");

  if (code === "SAVE10") {
    discountPercent = 10;
    msg.style.color = "#10B981";
    msg.innerText = "10% discount applied!";
  } else if (code === "TECH15") {
    discountPercent = 15;
    msg.style.color = "#10B981";
    msg.innerText = "15% tech offer applied!";
  } else {
    discountPercent = 0;
    msg.style.color = "#EF4444";
    msg.innerText = "Invalid code. Try SAVE10 or TECH15.";
  }

  renderCart();
});

document.getElementById("clearCartBtn").addEventListener("click", () => {
  cart = [];
  discountPercent = 0;
  document.getElementById("promoInput").value = "";
  document.getElementById("promoMsg").innerText = "";
  saveState();
  renderCart();
});

document.getElementById("checkoutBtn").addEventListener("click", () => {
  const toast = document.getElementById("toast");
  toast.classList.add("show");

  cart = [];
  discountPercent = 0;
  saveState();
  renderCart();

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
});

const modal = document.getElementById("productModal");
document.getElementById("openModalBtn").addEventListener("click", () => modal.classList.add("active"));
document.getElementById("closeModalBtn").addEventListener("click", () => modal.classList.remove("active"));

modal.addEventListener("click", (e) => {
  if (e.target === modal) modal.classList.remove("active");
});

document.getElementById("addProductForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const newProduct = {
    id: Date.now(),
    name: document.getElementById("pName").value.trim(),
    price: Number(document.getElementById("pPrice").value),
    category: document.getElementById("pCategory").value,
    image: document.getElementById("pImage").value.trim() || "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=500&q=80"
  };

  products.unshift(newProduct);
  saveState();
  renderProducts();

  e.target.reset();
  modal.classList.remove("active");
});

searchInput.addEventListener("input", renderProducts);
categoryFilter.addEventListener("change", renderProducts);

renderProducts();
renderCart();