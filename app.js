/* ==========================================================================
   ROSITA - Lógica de la Aplicación (Catálogo, Filtros, Panel Admin & WhatsApp)
   ========================================================================== */

// Estado de Autenticación y Constantes
const ADMIN_EMAIL = "rositamodafemenina@gmail.com";
// Por seguridad - nunca exponer el correo directamente en la interfaz
const ADMIN_PASS_HASH = "R0s1t4Adm1n2026!";
const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID_HERE.apps.googleusercontent.com";
let currentUserEmail = localStorage.getItem("rosita_user_email") || null;
let adminLoginAttempts = 0;
let adminLockUntil = 0;

// Configuración de Supabase
const SUPABASE_URL = 'https://yucupzwonmzjahifvqrd.supabase.co';  // Reemplaza con tu URL de Supabase
const SUPABASE_ANON_KEY = 'sb_publishable_nl9TnJMNj5-O5t4yThW8fg_o-grIWgV';  // Reemplaza con tu clave pública anon
let supabaseClient = null;

// Catálogo de Productos por Defecto
const defaultProductsData = [
  {
    id: 1,
    title: "Pulsera Tejida a Mano con Dije Dorado",
    category: "mujeres",
    subcategory: "accesorios",
    price: 18000,
    image: "assets/woven_bracelets.png",
    description: "Accesorio hecho a mano con hilo de alta resistencia y dije dorado. Diseño ajustable, ideal para regalar o usar a diario. Incluye empaque de presentación especial.",
    packagingNote: "Incluye empaque especial en cartón de presentación 'Ama lo que haces'.",
    variants: ["Negro", "Rojo", "Rosa Viejo", "Dorado"],
    variantColors: { "Negro": "#1A1A1A", "Rojo": "#D32F2F", "Rosa Viejo": "#D87093", "Dorado": "#D4AF37" },
    isBestSeller: true,
    badge: "⭐ Más Vendido"
  },
  {
    id: 2,
    title: "Bolso de Mano Elegante Blush",
    category: "mujeres",
    subcategory: "bolsos",
    price: 65000,
    image: "assets/leather_bag.png",
    description: "Cartera en cuero sintético de alta durabilidad con acabados dorados y tiranta ajustable. Espaciosa y sofisticada para cualquier ocasión.",
    packagingNote: "Incluye funda protectora antipolvo de regalo.",
    variants: ["Rosa Viejo", "Negro", "Beige"],
    variantColors: { "Rosa Viejo": "#D87093", "Negro": "#1A1A1A", "Beige": "#F5F5DC" },
    isBestSeller: true,
    badge: "Destacado"
  },
  {
    id: 3,
    title: "Set de Maquillaje Glow Rose",
    category: "mujeres",
    subcategory: "maquillaje",
    price: 45000,
    image: "assets/makeup_set.png",
    description: "Kit completo de maquillaje que incluye paleta de rubores e iluminadores, labial líquido mate de larga duración y brillo hidratante en empaque de lujo.",
    packagingNote: "Empaque listo para regalo con cinta satinada.",
    variants: ["Rose Gold", "Nude Pink"],
    variantColors: { "Rose Gold": "#B76E79", "Nude Pink": "#E8C3C8" },
    isBestSeller: true,
    badge: "Tendencia"
  },
  {
    id: 4,
    title: "Pulsera de Cuero Trenzado Caballero",
    category: "hombres",
    subcategory: "accesorios",
    price: 22000,
    image: "assets/men_bracelet.png",
    description: "Pulsera masculina en cuero legítimo con broche magnético en acero inoxidable dorado y plateado. Resistente al agua y de estilo moderno.",
    packagingNote: "Caja de regalo estilo estuche masculino.",
    variants: ["Negro con Dorado", "Negro con Plateado", "Café"],
    variantColors: { "Negro con Dorado": "#2C1A29", "Negro con Plateado": "#78909C", "Café": "#5D4037" },
    isBestSeller: false,
    badge: "Hombres"
  },
  {
    id: 5,
    title: "Set de Accesorios & Diademas Niñas",
    category: "ninas",
    subcategory: "accesorios",
    price: 15000,
    image: "assets/girls_accessories.png",
    description: "Hermoso kit para niñas con moños en tonos pastel, pinzas anti-tirones y pulseras de cuentas de colores. Súper delicado y suave con el cabello.",
    packagingNote: "Empaque divertido en cajita rosada.",
    variants: ["Pastel", "Multicolor"],
    variantColors: { "Pastel": "#FFC0CB", "Multicolor": "#FFD700" },
    isBestSeller: true,
    badge: "Favorito Niñas"
  },
  {
    id: 6,
    title: "Blusa Elegante Estilo Rosita",
    category: "mujeres",
    subcategory: "prendas",
    price: 48000,
    image: "assets/hero.png",
    description: "Prenda de vestir femenina con corte fresco, tela ligera de alta calidad y detalles en costura. Ideal para eventos casuales o formales.",
    packagingNote: "Incluye etiqueta original de la marca.",
    variants: ["Rosa Pastel", "Blanco Marfil"],
    variantColors: { "Rosa Pastel": "#FFD1DC", "Blanco Marfil": "#FFFFF0" },
    isBestSeller: false,
    badge: "Moda"
  },
  {
    id: 7,
    title: "Dúo Pulseras Pareja Distancia",
    category: "hombres",
    subcategory: "detalles",
    price: 28000,
    image: "assets/men_bracelet.png",
    description: "Juego de 2 pulseras ajustables para parejas o mejores amigos. Con piedra volcánica y corona dorada/plateada para compartir.",
    packagingNote: "Incluye tarjeta emotiva para dedicatoria.",
    variants: ["Negro/Blanco", "Negro/Rojo"],
    variantColors: { "Negro/Blanco": "#000000", "Negro/Rojo": "#B71C1C" },
    isBestSeller: false,
    badge: "Detalle Especial"
  },
  {
    id: 8,
    title: "Kit Labiales & Brillos Fantasía Niñas",
    category: "ninas",
    subcategory: "detalles",
    price: 18000,
    image: "assets/makeup_set.png",
    description: "Brillos labiales infantiles con aromas frutales, 100% seguros y humectantes para niñas.",
    packagingNote: "Empaque transparente con brillos y regalo.",
    variants: ["Fresa", "Chicle"],
    variantColors: { "Fresa": "#FF1744", "Chicle": "#F50057" },
    isBestSeller: false,
    badge: "Niñas"
  }
];

// Datos de Tarifas de Envío por Defecto
const defaultShippingRates = {
  guaimaral: { name: "Guaimaral / Punto de Encuentro", price: 0, note: "Entregas gratuitas en puntos acordados" },
  galapa: { name: "Galapa - Domicilio", price: 5000, note: "Entrega directa en tu dirección en Galapa" },
  barranquilla: { name: "Barranquilla - Domicilio", price: 8000, note: "Envíos diarios a cualquier barrio de Barranquilla" }
};

// Estado Dinámico de la Aplicación
let productsData = JSON.parse(localStorage.getItem("rosita_products_v2")) || defaultProductsData;
let shippingRates = JSON.parse(localStorage.getItem("rosita_shipping_v2")) || defaultShippingRates;
let cart = JSON.parse(localStorage.getItem("rosita_cart")) || [];
let isAdminLoggedIn = localStorage.getItem("rosita_admin_logged") === "true";

// Estado de Filtros
let activeCategory = "todos";
let activeSubcategory = "todos";
let activeMaxPrice = 250000;
let searchQuery = "";

// Estado del Producto Activo en el Modal
let currentModalProduct = null;
let selectedModalVariant = "";
let selectedModalQty = 1;

// Formateador de Moneda
function formatCOP(amount) {
  return "$ " + Number(amount).toLocaleString("es-CO") + " COP";
}

// Inicializar la Aplicación
document.addEventListener("DOMContentLoaded", () => {
  // Inicializar EmailJS con la clave pública
  emailjs.init("6wn4STbb6fAn_tW-7");

  // Inicializar el cliente de Supabase
  if (typeof supabase !== 'undefined' && SUPABASE_URL !== 'TU_SUPABASE_URL_AQUI') {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('Supabase conectado correctamente.');
  } else {
    console.warn('Supabase no configurado. Reemplaza las credenciales en app.js.');
  }

  checkAdminStateUI();
  renderShippingZones();
  populateDeliverySelectOptions();
  renderBestSellers();
  applyFilters();
  updateCartBadge();
});

// Verificar Estado del Panel de Administración y Autenticación
function checkAdminStateUI() {
  const adminBar = document.getElementById("adminBar");

  if (isAdminLoggedIn) {
    if (adminBar) adminBar.classList.add("active");
  } else {
    if (adminBar) adminBar.classList.remove("active");
  }
}

// ============================================================
// ACTIVADOR SECRETO DE ADMIN (5 clics rápidos en el logo)
// ============================================================
let _secretClickCount = 0;
let _secretClickTimer = null;

function handleSecretLogoClick(e) {
  // No prevenir el comportamiento por defecto para que el logo siga funcionando como enlace normal
  _secretClickCount++;

  // Limpiar el temporizador de reinicio en cada clic
  if (_secretClickTimer) clearTimeout(_secretClickTimer);

  if (_secretClickCount >= 5) {
    _secretClickCount = 0;
    e.preventDefault();
    openAdminLoginModal();
    return;
  }

  // Reiniciar el contador si no hay clics en 2 segundos
  _secretClickTimer = setTimeout(() => {
    _secretClickCount = 0;
  }, 2000);
}

// ============================================================
// INICIO DE SESIÓN CON GOOGLE Y AUTENTICACIÓN DE ADMINISTRADOR
// ============================================================

function openAdminLoginModal() {
  if (isAdminLoggedIn) {
    showToastNotification("El Modo Administrador ya está activo (" + ADMIN_EMAIL + ")");
    return;
  }
  document.getElementById("adminLoginOverlay").classList.add("active");
  document.getElementById("adminLoginModal").classList.add("active");

  initGoogleGISButton();
}

function closeAdminLoginModal() {
  document.getElementById("adminLoginOverlay").classList.remove("active");
  document.getElementById("adminLoginModal").classList.remove("active");
}

function initGoogleGISButton() {
  const container = document.getElementById("googleSignInBtnContainer");
  if (!container) return;

  if (window.google && window.google.accounts && window.google.accounts.id) {
    try {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleCredentialResponse,
        auto_select: false
      });

      window.google.accounts.id.renderButton(
        container,
        { theme: "outline", size: "large", shape: "pill", text: "signin_with" }
      );
    } catch (e) {
      console.log("Google GIS init fallback:", e);
      container.innerHTML = '<p style="font-size:0.78rem; color:var(--dark-muted); text-align:center;">Inicio Google no disponible en modo local.<br>Usa la clave secreta de administración.</p>';
    }
  } else {
    container.innerHTML = '<p style="font-size:0.78rem; color:var(--dark-muted); text-align:center;">Inicio Google no disponible.<br>Usa la clave secreta de administración.</p>';
  }
}

function handleGoogleCredentialResponse(response) {
  if (!response || !response.credential) return;
  try {
    const base64Url = response.credential.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    const payload = JSON.parse(jsonPayload);

    if (payload && payload.email) {
      processGoogleLoginEmail(payload.email);
    }
  } catch (err) {
    console.error("Error al decodificar credencial de Google:", err);
  }
}

function loginWithGoogleEmail(email) {
  processGoogleLoginEmail(email);
}

function loginWithCustomGoogleEmail() {
  const input = document.getElementById("customGoogleEmail");
  if (!input) return;
  const email = input.value.trim();
  if (!email || !email.includes("@")) {
    showToastNotification("Por favor ingresa un correo de Google válido.");
    return;
  }
  processGoogleLoginEmail(email);
}

function processGoogleLoginEmail(email) {
  const normalizedEmail = email.toLowerCase().trim();
  currentUserEmail = normalizedEmail;
  localStorage.setItem("rosita_user_email", normalizedEmail);

  if (normalizedEmail === ADMIN_EMAIL.toLowerCase()) {
    isAdminLoggedIn = true;
    adminLoginAttempts = 0;
    localStorage.setItem("rosita_admin_logged", "true");
    checkAdminStateUI();
    closeAdminLoginModal();
    renderBestSellers();
    applyFilters();
    showToastNotification("¡Bienvenida Rosita! Modo Administrador activado 🌸");
  } else {
    isAdminLoggedIn = false;
    localStorage.removeItem("rosita_admin_logged");
    checkAdminStateUI();
    closeAdminLoginModal();
    renderBestSellers();
    applyFilters();
    showToastNotification(`Sesión iniciada. El modo admin requiere autorización especial.`);
  }
}

function verifyAdminPassword() {
  const now = Date.now();

  // Verificar si el acceso está bloqueado
  if (now < adminLockUntil) {
    const secsLeft = Math.ceil((adminLockUntil - now) / 1000);
    const errorEl = document.getElementById("adminPasswordError");
    if (errorEl) {
      errorEl.innerHTML = `<i class="fa-solid fa-lock"></i> Demasiados intentos. Espera ${secsLeft}s.`;
      errorEl.style.display = "block";
    }
    return;
  }

  const input = document.getElementById("adminPasswordInput");
  const errorEl = document.getElementById("adminPasswordError");
  if (!input) return;

  const entered = input.value;

  if (entered === ADMIN_PASS_HASH) {
    // Contraseña correcta — otorgar acceso de administrador
    adminLoginAttempts = 0;
    isAdminLoggedIn = true;
    currentUserEmail = ADMIN_EMAIL;
    localStorage.setItem("rosita_admin_logged", "true");
    localStorage.setItem("rosita_user_email", ADMIN_EMAIL);
    input.value = "";
    if (errorEl) errorEl.style.display = "none";
    checkAdminStateUI();
    closeAdminLoginModal();
    renderBestSellers();
    applyFilters();
    showToastNotification("¡Bienvenida Rosita! Modo Administrador activado 🌸");
  } else {
    adminLoginAttempts++;
    input.value = "";
    if (errorEl) {
      if (adminLoginAttempts >= 5) {
        adminLockUntil = Date.now() + 60000; // Bloquear por 60 segundos
        errorEl.innerHTML = '<i class="fa-solid fa-lock"></i> Demasiados intentos. Bloqueado por 60 segundos.';
      } else {
        const remaining = 5 - adminLoginAttempts;
        errorEl.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Clave incorrecta. Acceso denegado. (${remaining} intento${remaining !== 1 ? 's' : ''} restante${remaining !== 1 ? 's' : ''})` ;
      }
      errorEl.style.display = "block";
      // Animación de sacudida
      input.style.borderColor = "#E53935";
      setTimeout(() => { input.style.borderColor = ""; }, 1500);
    }
  }
}

function logoutAdmin() {
  isAdminLoggedIn = false;
  currentUserEmail = null;
  localStorage.removeItem("rosita_admin_logged");
  localStorage.removeItem("rosita_user_email");
  checkAdminStateUI();
  renderBestSellers();
  applyFilters();
  showToastNotification("Sesión cerrada.");
}

// Renderizar Sección de Información de Envíos y Selectores
function renderShippingZones() {
  const container = document.getElementById("shippingZonesList");
  if (!container) return;

  container.innerHTML = `
    <div class="shipping-zone">
      <div>
        <h4>${shippingRates.guaimaral.name}</h4>
        <p>${shippingRates.guaimaral.note}</p>
      </div>
      <span class="price-badge">${shippingRates.guaimaral.price === 0 ? '¡GRATIS!' : formatCOP(shippingRates.guaimaral.price)}</span>
    </div>

    <div class="shipping-zone">
      <div>
        <h4>${shippingRates.galapa.name}</h4>
        <p>${shippingRates.galapa.note}</p>
      </div>
      <span class="price-badge">${formatCOP(shippingRates.galapa.price)}</span>
    </div>

    <div class="shipping-zone">
      <div>
        <h4>${shippingRates.barranquilla.name}</h4>
        <p>${shippingRates.barranquilla.note}</p>
      </div>
      <span class="price-badge">${formatCOP(shippingRates.barranquilla.price)}</span>
    </div>
  `;
}

function populateDeliverySelectOptions() {
  const select = document.getElementById("deliveryZoneSelect");
  if (!select) return;

  select.innerHTML = `
    <option value="guaimaral">${shippingRates.guaimaral.name} (${shippingRates.guaimaral.price === 0 ? '¡GRATIS!' : formatCOP(shippingRates.guaimaral.price)})</option>
    <option value="galapa">${shippingRates.galapa.name} (${formatCOP(shippingRates.galapa.price)})</option>
    <option value="barranquilla">${shippingRates.barranquilla.name} (${formatCOP(shippingRates.barranquilla.price)})</option>
  `;
}

// Renderizar Productos Más Vendidos
function renderBestSellers() {
  const container = document.getElementById("bestSellersGrid");
  if (!container) return;

  const bestSellers = productsData.filter(p => p.isBestSeller);
  container.innerHTML = bestSellers.map(p => createProductCardHTML(p)).join("");
}

// Renderizar la Cuadrícula del Catálogo con los Filtros Activos
function applyFilters() {
  const container = document.getElementById("catalogGrid");
  if (!container) return;

  const subcatSelect = document.getElementById("subcategorySelect");
  if (subcatSelect) activeSubcategory = subcatSelect.value;

  const filtered = productsData.filter(p => {
    const matchCategory = (activeCategory === "todos" || p.category === activeCategory);
    const matchSubcategory = (activeSubcategory === "todos" || p.subcategory === activeSubcategory);
    const matchPrice = p.price <= activeMaxPrice;
    const matchSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        p.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchCategory && matchSubcategory && matchPrice && matchSearch;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px; background: var(--white); border-radius: var(--radius-md); border: 1px solid var(--border-pink);">
        <i class="fa-solid fa-sparkles" style="font-size: 2.5rem; color: var(--rose-gold); margin-bottom: 15px;"></i>
        <h3 style="font-size: 1.2rem; color: var(--dark-accent); margin-bottom: 8px;">No se encontraron productos</h3>
        <p style="color: var(--dark-muted); font-size: 0.9rem;">Prueba cambiando los filtros o agregando nuevos ítems como Admin.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(p => createProductCardHTML(p)).join("");
}

// Generador de HTML para Tarjeta de Producto
function createProductCardHTML(p) {
  const colorDots = (p.variants || []).map(v => {
    const colorName = typeof v === 'object' ? v.color : v;
    const hex = (p.variantColors && p.variantColors[colorName]) ? p.variantColors[colorName] : "#D87093";
    return `<span class="variant-dot" style="background-color: ${hex};" title="${colorName}"></span>`;
  }).join("");

  const adminControlsHTML = isAdminLoggedIn ? `
    <div class="admin-card-actions">
      <button class="btn-admin-card-edit" onclick="openEditProductModal(${p.id})" title="Editar Producto (Admin)">
        <i class="fa-solid fa-pencil"></i>
      </button>
      <button class="btn-admin-card-delete" onclick="deleteProduct(${p.id})" title="Eliminar Producto (Admin)">
        <i class="fa-solid fa-trash-can"></i>
      </button>
    </div>
  ` : '';

  return `
    <div class="product-card">
      ${adminControlsHTML}
      ${p.badge ? `<span class="product-badge">${p.badge}</span>` : ''}
      <div class="product-img-container" onclick="openProductModal(${p.id})">
        <img src="${p.image}" alt="${p.title}" onerror="this.src='assets/woven_bracelets.png'">
        <span class="product-quick-view"><i class="fa-solid fa-eye"></i> Vista Rápida</span>
      </div>
      <div class="product-body">
        <span class="product-category">${p.category} • ${p.subcategory}</span>
        <h3 class="product-title">${p.title}</h3>
        <p class="product-desc-short">${p.description}</p>

        <div class="product-variants-preview">
          <span style="font-size: 0.75rem; color: var(--dark-muted); margin-right: 4px;">Variantes:</span>
          ${colorDots.length > 0 ? colorDots : '<span style="font-size:0.75rem;">Estándar</span>'}
        </div>

        <div class="product-footer">
          <span class="product-price">${formatCOP(p.price)}</span>
          <div class="product-actions">
            <button class="btn-add-cart" onclick="quickAddToCart(${p.id})" title="Añadir al Carrito">
              <i class="fa-solid fa-cart-plus"></i>
            </button>
            <button class="btn-buy-wa" onclick="directBuyWhatsApp(${p.id})" title="Pedir por WhatsApp">
              <i class="fa-brands fa-whatsapp"></i> Comprar
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

// GESTIÓN DE PRODUCTOS ADMIN (Añadir / Editar / Eliminar)
function openAddProductModal() {
  if (!isAdminLoggedIn) return;

  document.getElementById("editProductId").value = "";
  document.getElementById("adminProductModalTitle").innerText = "Añadir Nuevo Producto";
  document.getElementById("adminProductForm").reset();
  // Reiniciar la vista previa de imagen
  const previewContainer = document.getElementById("imagePreviewContainer");
  if (previewContainer) previewContainer.style.display = "none";
  const imageDataInput = document.getElementById("adminImageData");
  if (imageDataInput) imageDataInput.value = "";
  const fileInput = document.getElementById("adminImageFile");
  if (fileInput) fileInput.value = "";
  
  document.getElementById("adminVariantsContainer").innerHTML = "";
  addAdminVariantRow();

  document.getElementById("adminProductOverlay").classList.add("active");
  document.getElementById("adminProductModal").classList.add("active");
}

function openEditProductModal(productId) {
  if (!isAdminLoggedIn) return;

  const p = productsData.find(item => item.id === productId);
  if (!p) return;

  document.getElementById("editProductId").value = p.id;
  document.getElementById("adminProductModalTitle").innerText = "Editar Producto #" + p.id;

  document.getElementById("adminTitle").value = p.title;
  document.getElementById("adminCategory").value = p.category;
  document.getElementById("adminSubcategory").value = p.subcategory;
  document.getElementById("adminPrice").value = p.price;
  document.getElementById("adminBadge").value = p.badge || "";

  // Mostrar vista previa para imágenes de archivo o assets
  const previewContainer = document.getElementById("imagePreviewContainer");
  const previewImg = document.getElementById("imagePreview");
  const imageDataInput = document.getElementById("adminImageData");
  const fileInput = document.getElementById("adminImageFile");
  if (fileInput) fileInput.value = "";

  if (p.image) {
    if (previewImg) previewImg.src = p.image;
    if (previewContainer) previewContainer.style.display = "flex";
    if (imageDataInput) imageDataInput.value = p.image;
  } else {
    if (previewContainer) previewContainer.style.display = "none";
    if (imageDataInput) imageDataInput.value = "";
  }

  const variantsContainer = document.getElementById("adminVariantsContainer");
  if (variantsContainer) {
    variantsContainer.innerHTML = "";
    const variants = p.variants || [];
    if (variants.length === 0) {
      addAdminVariantRow();
    } else {
      variants.forEach(v => {
        const color = typeof v === 'object' ? v.color : v;
        const image = typeof v === 'object' ? v.image : "";
        addAdminVariantRow(color, image);
      });
    }
  }

  document.getElementById("adminDescription").value = p.description;
  document.getElementById("adminPackaging").value = p.packagingNote || "";
  document.getElementById("adminIsBestSeller").checked = !!p.isBestSeller;

  document.getElementById("adminProductOverlay").classList.add("active");
  document.getElementById("adminProductModal").classList.add("active");
}

function closeAdminProductModal() {
  document.getElementById("adminProductOverlay").classList.remove("active");
  document.getElementById("adminProductModal").classList.remove("active");
}

function handleSaveProduct(e) {
  e.preventDefault();

  const editId = document.getElementById("editProductId").value;
  const title = document.getElementById("adminTitle").value.trim();
  const category = document.getElementById("adminCategory").value;
  const subcategory = document.getElementById("adminSubcategory").value;
  const price = parseFloat(document.getElementById("adminPrice").value) || 0;
  const badge = document.getElementById("adminBadge").value.trim();
  const imageDataInput = document.getElementById("adminImageData");
  const imageData = imageDataInput ? imageDataInput.value : "";
  const image = imageData || "assets/woven_bracelets.png";
  
  const variantsArray = [];
  const variantRows = document.querySelectorAll(".admin-variant-row");
  if (variantRows.length > 0) {
    variantRows.forEach(row => {
      const colorInput = row.querySelector(".variant-color-input");
      const imageInput = row.querySelector(".variant-image-data");
      if (colorInput && colorInput.value.trim()) {
        variantsArray.push({
          color: colorInput.value.trim(),
          image: imageInput ? imageInput.value : ""
        });
      }
    });
  }
  if (variantsArray.length === 0) {
    variantsArray.push({ color: "Estándar", image: "" });
  }

  const description = document.getElementById("adminDescription").value.trim();
  const packagingNote = document.getElementById("adminPackaging").value.trim();
  const isBestSeller = document.getElementById("adminIsBestSeller").checked;

  if (editId) {
    // Editando un producto existente
    const idx = productsData.findIndex(item => item.id === Number(editId));
    if (idx > -1) {
      productsData[idx] = {
        ...productsData[idx],
        title, category, subcategory, price, badge, image,
        variants: variantsArray,
        description, packagingNote, isBestSeller
      };
      showToastNotification(`Producto "${title}" actualizado correctamente.`);
    }
  } else {
    // Creando un nuevo producto
    const newId = productsData.length > 0 ? Math.max(...productsData.map(p => p.id)) + 1 : 1;
    const newProduct = {
      id: newId,
      title, category, subcategory, price, badge, image,
      variants: variantsArray,
      variantColors: {},
      description, packagingNote, isBestSeller
    };
    productsData.unshift(newProduct);
    showToastNotification(`Producto "${title}" añadido al catálogo.`);
  }

  saveProductsData();
  closeAdminProductModal();
  renderBestSellers();
  applyFilters();
}

function deleteProduct(productId) {
  if (!isAdminLoggedIn) return;
  const p = productsData.find(item => item.id === productId);
  if (!p) return;

  if (confirm(`¿Estás seguro de que deseas eliminar el producto "${p.title}"?`)) {
    productsData = productsData.filter(item => item.id !== productId);
    saveProductsData();
    renderBestSellers();
    applyFilters();
    showToastNotification(`Producto "${p.title}" eliminado.`);
  }
}

function saveProductsData() {
  localStorage.setItem("rosita_products_v2", JSON.stringify(productsData));
}

// GESTIÓN DE TARIFAS DE ENVÍO (ADMIN)
function openEditShippingModal() {
  if (!isAdminLoggedIn) return;

  document.getElementById("shipPriceGuaimaral").value = shippingRates.guaimaral.price;
  document.getElementById("shipNoteGuaimaral").value = shippingRates.guaimaral.note;

  document.getElementById("shipPriceGalapa").value = shippingRates.galapa.price;
  document.getElementById("shipNoteGalapa").value = shippingRates.galapa.note;

  document.getElementById("shipPriceBarranquilla").value = shippingRates.barranquilla.price;
  document.getElementById("shipNoteBarranquilla").value = shippingRates.barranquilla.note;

  document.getElementById("adminShippingOverlay").classList.add("active");
  document.getElementById("adminShippingModal").classList.add("active");
}

function closeAdminShippingModal() {
  document.getElementById("adminShippingOverlay").classList.remove("active");
  document.getElementById("adminShippingModal").classList.remove("active");
}

function handleSaveShipping(e) {
  e.preventDefault();

  shippingRates.guaimaral.price = parseFloat(document.getElementById("shipPriceGuaimaral").value) || 0;
  shippingRates.guaimaral.note = document.getElementById("shipNoteGuaimaral").value.trim();

  shippingRates.galapa.price = parseFloat(document.getElementById("shipPriceGalapa").value) || 0;
  shippingRates.galapa.note = document.getElementById("shipNoteGalapa").value.trim();

  shippingRates.barranquilla.price = parseFloat(document.getElementById("shipPriceBarranquilla").value) || 0;
  shippingRates.barranquilla.note = document.getElementById("shipNoteBarranquilla").value.trim();

  localStorage.setItem("rosita_shipping_v2", JSON.stringify(shippingRates));

  renderShippingZones();
  populateDeliverySelectOptions();
  updateCartTotals();
  closeAdminShippingModal();
  showToastNotification("Tarifas de envío actualizadas exitosamente.");
}

function resetCatalogToDefaults() {
  if (!isAdminLoggedIn) return;
  if (confirm("¿Deseas restablecer todos los productos y tarifas a los valores iniciales por defecto?")) {
    productsData = defaultProductsData;
    shippingRates = defaultShippingRates;
    localStorage.removeItem("rosita_products_v2");
    localStorage.removeItem("rosita_shipping_v2");
    renderShippingZones();
    populateDeliverySelectOptions();
    renderBestSellers();
    applyFilters();
    showToastNotification("Catálogo y envíos restablecidos.");
  }
}

// Selector de Pestañas por Categoría
function filterByCategory(category, btnElement) {
  activeCategory = category;
  
  const tabs = document.querySelectorAll(".tab-btn");
  tabs.forEach(t => t.classList.remove("active"));
  
  if (btnElement) {
    btnElement.classList.add("active");
  } else {
    tabs.forEach(t => {
      if (t.innerText.toLowerCase().includes(category)) t.classList.add("active");
    });
  }

  applyFilters();

  const catalogSection = document.getElementById("catalogo");
  if (catalogSection && btnElement) {
    catalogSection.scrollIntoView({ behavior: 'smooth' });
  }
}

// Manejador del Deslizador de Precio
function updatePriceLabel(value) {
  activeMaxPrice = parseInt(value);
  const label = document.getElementById("priceLabel");
  if (label) label.innerText = formatCOP(activeMaxPrice);
  applyFilters();
}

// Manejador de Búsqueda en Tiempo Real
function handleSearch() {
  const input = document.getElementById("searchInput");
  if (input) {
    searchQuery = input.value;
    applyFilters();
  }
}

// Modal de Vista Rápida del Producto
function openProductModal(productId) {
  const p = productsData.find(item => item.id === productId);
  if (!p) return;

  currentModalProduct = p;
  
  let variants = p.variants || [];
  if (variants.length > 0 && typeof variants[0] === 'string') {
    variants = variants.map(v => ({ color: v, image: p.image }));
  } else if (variants.length === 0) {
    variants = [{ color: "Único", image: p.image }];
  }

  selectedModalVariant = variants[0].color;
  selectedModalQty = 1;

  const modalBody = document.getElementById("modalBodyContent");
  if (!modalBody) return;

  const variantChipsHTML = variants.map((v, idx) => `
    <button class="variant-chip ${idx === 0 ? 'selected' : ''}" onclick="selectModalVariant('${v.color}', '${v.image || ''}', this)">
      ${v.color}
    </button>
  `).join("");

  modalBody.innerHTML = `
    <div class="modal-img-col">
      <img id="modalMainImage" src="${variants[0].image || p.image}" alt="${p.title}" onerror="this.src='assets/woven_bracelets.png'">
    </div>
    <div class="modal-info-col">
      <span style="font-size: 0.8rem; font-weight: 700; color: var(--rose-gold); text-transform: uppercase;">${p.category} • ${p.subcategory}</span>
      <h2 class="modal-title brand-font">${p.title}</h2>
      <div class="modal-price">${formatCOP(p.price)}</div>
      
      <p class="modal-desc">${p.description}</p>

      ${p.packagingNote ? `
        <div class="modal-packaging-note">
          <i class="fa-solid fa-gift"></i>
          <span>${p.packagingNote}</span>
        </div>
      ` : ''}

      <span class="variant-picker-label">Seleccionar Variante / Color:</span>
      <div class="variant-options">
        ${variantChipsHTML}
      </div>

      <span class="variant-picker-label">Cantidad:</span>
      <div class="qty-control">
        <button class="qty-btn" onclick="changeModalQty(-1)">-</button>
        <span class="qty-val" id="modalQtyVal">1</span>
        <button class="qty-btn" onclick="changeModalQty(1)">+</button>
      </div>

      <div style="display: flex; gap: 12px; margin-top: auto; padding-top: 15px;">
        <button class="btn-primary" style="flex: 1; justify-content: center;" onclick="addModalItemToCart()">
          <i class="fa-solid fa-bag-shopping"></i> Agregar al Carrito
        </button>
        <button class="btn-whatsapp-gold" style="flex: 1; justify-content: center;" onclick="buyModalItemWhatsApp()">
          <i class="fa-brands fa-whatsapp"></i> Pedir por WhatsApp
        </button>
      </div>
    </div>
  `;

  document.getElementById("modalOverlay").classList.add("active");
  document.getElementById("productModal").classList.add("active");
}

function selectModalVariant(color, image, btn) {
  selectedModalVariant = color;
  const chips = document.querySelectorAll(".variant-chip");
  chips.forEach(c => c.classList.remove("selected"));
  btn.classList.add("selected");
  
  if (image && image !== 'undefined' && image !== '') {
    const mainImg = document.getElementById("modalMainImage");
    if (mainImg) mainImg.src = image;
  }
}

function changeModalQty(delta) {
  selectedModalQty = Math.max(1, selectedModalQty + delta);
  const qtySpan = document.getElementById("modalQtyVal");
  if (qtySpan) qtySpan.innerText = selectedModalQty;
}

function closeProductModal() {
  document.getElementById("modalOverlay").classList.remove("active");
  document.getElementById("productModal").classList.remove("active");
}

// Lógica del Carrito de Compras
function quickAddToCart(productId) {
  const p = productsData.find(item => item.id === productId);
  if (!p) return;

  const defaultVariantObj = (p.variants && p.variants[0]) ? p.variants[0] : "Único";
  const defaultVariant = typeof defaultVariantObj === 'object' ? defaultVariantObj.color : defaultVariantObj;
  
  addToCartState(p, defaultVariant, 1);
  showToastNotification(`¡"${p.title}" agregado al carrito!`);
}

function addModalItemToCart() {
  if (!currentModalProduct) return;
  addToCartState(currentModalProduct, selectedModalVariant, selectedModalQty);
  closeProductModal();
  toggleCartDrawer(true);
}

function addToCartState(product, variant, qty) {
  const existingIdx = cart.findIndex(i => i.id === product.id && i.variant === variant);
  if (existingIdx > -1) {
    cart[existingIdx].quantity += qty;
  } else {
    cart.push({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      variant: variant,
      quantity: qty
    });
  }
  saveCart();
  renderCart();
}

function removeFromCart(index) {
  cart.splice(index, 1);
  saveCart();
  renderCart();
}

function updateCartQty(index, delta) {
  if (cart[index]) {
    cart[index].quantity += delta;
    if (cart[index].quantity <= 0) {
      cart.splice(index, 1);
    }
  }
  saveCart();
  renderCart();
}

function saveCart() {
  localStorage.setItem("rosita_cart", JSON.stringify(cart));
  updateCartBadge();
}

function updateCartBadge() {
  const badge = document.getElementById("cartBadge");
  if (!badge) return;
  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  badge.innerText = totalCount;
}

function toggleCartDrawer(forceOpen = false) {
  const drawer = document.getElementById("cartDrawer");
  if (!drawer) return;
  if (forceOpen || !drawer.classList.contains("active")) {
    renderCart();
    drawer.classList.add("active");
  } else {
    drawer.classList.remove("active");
  }
}

function renderCart() {
  const container = document.getElementById("cartItemsContainer");
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 50px 20px;">
        <i class="fa-solid fa-bag-shopping" style="font-size: 3rem; color: var(--border-pink); margin-bottom: 15px;"></i>
        <h4 style="font-size: 1.1rem; color: var(--dark-accent); margin-bottom: 8px;">Tu carrito está vacío</h4>
        <p style="color: var(--dark-muted); font-size: 0.85rem;">Explora nuestros accesorios tejidos y añade tus favoritos.</p>
      </div>
    `;
    updateCartTotals();
    return;
  }

  container.innerHTML = cart.map((item, idx) => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.title}" onerror="this.src='assets/woven_bracelets.png'">
      <div class="cart-item-info">
        <h4 class="cart-item-title">${item.title}</h4>
        <div class="cart-item-variant">Variante: <strong>${item.variant}</strong></div>
        <div class="cart-item-price">${formatCOP(item.price * item.quantity)}</div>
      </div>
      <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 8px;">
        <button onclick="removeFromCart(${idx})" style="color: #E53935; font-size: 0.9rem;" title="Eliminar"><i class="fa-solid fa-trash-can"></i></button>
        <div class="qty-control" style="margin: 0;">
          <button class="qty-btn" style="width:24px; height:24px; font-size: 0.75rem;" onclick="updateCartQty(${idx}, -1)">-</button>
          <span style="font-size: 0.85rem; font-weight: 600;">${item.quantity}</span>
          <button class="qty-btn" style="width:24px; height:24px; font-size: 0.75rem;" onclick="updateCartQty(${idx}, 1)">+</button>
        </div>
      </div>
    </div>
  `).join("");

  updateCartTotals();
}

function updateCartTotals() {
  const subtotalSpan = document.getElementById("cartSubtotal");
  const shippingSpan = document.getElementById("cartShipping");
  const totalSpan = document.getElementById("cartTotal");
  const deliverySelect = document.getElementById("deliveryZoneSelect");

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  let shippingCost = 0;
  if (deliverySelect) {
    const zoneKey = deliverySelect.value;
    if (shippingRates[zoneKey]) {
      shippingCost = shippingRates[zoneKey].price;
    }
  }

  const grandTotal = subtotal + shippingCost;

  if (subtotalSpan) subtotalSpan.innerText = formatCOP(subtotal);
  if (shippingSpan) shippingSpan.innerText = shippingCost === 0 ? "¡GRATIS!" : formatCOP(shippingCost);
  if (totalSpan) totalSpan.innerText = formatCOP(grandTotal);
}

// Lógica de Compra Directa por WhatsApp
function checkoutViaWhatsApp() {
  if (cart.length === 0) {
    alert("Tu carrito está vacío. Añade productos antes de finalizar la compra.");
    return;
  }

  const deliverySelect = document.getElementById("deliveryZoneSelect");
  let deliveryZoneName = shippingRates.guaimaral.name;
  let shippingCost = shippingRates.guaimaral.price;

  if (deliverySelect) {
    const key = deliverySelect.value;
    if (shippingRates[key]) {
      deliveryZoneName = shippingRates[key].name;
      shippingCost = shippingRates[key].price;
    }
  }

  const subtotal = cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
  const total = subtotal + shippingCost;

  let itemsMessage = cart.map(i => `• ${i.quantity}x *${i.title}* (Color/Variante: _${i.variant}_) - ${formatCOP(i.price * i.quantity)}`).join("\n");

  let fullMessage = `¡Hola Rosita! 🌸 Quiero realizar este pedido desde tu tienda web:\n\n` +
                    `🛒 *PRODUCTOS SOLICITADOS:*\n${itemsMessage}\n\n` +
                    `📍 *ZONA DE ENTREGA:* ${deliveryZoneName} (${shippingCost === 0 ? '¡GRATIS!' : formatCOP(shippingCost)})\n` +
                    `💵 *SUBTOTAL:* ${formatCOP(subtotal)}\n` +
                    `💰 *TOTAL A PAGAR:* ${formatCOP(total)}\n\n` +
                    `Quedo atento(a) para acordar el pago y la entrega. ¡Muchas gracias! ✨`;

  const phone = "573226031596";
  const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(fullMessage)}`;

  window.open(waUrl, "_blank");

  // Registrar la venta en Supabase
  recordSale(cart, deliveryZoneName, shippingCost, subtotal, total);

  // Vaciar el carrito después de la compra
  cart = [];
  saveCart();
  renderCart();
  toggleCartDrawer();
  showToastNotification("¡Pedido enviado! Tu venta ha sido registrada. 🌸");
}

function directBuyWhatsApp(productId) {
  const p = productsData.find(item => item.id === productId);
  if (!p) return;

  const defaultVariantObj = (p.variants && p.variants[0]) ? p.variants[0] : "Único";
  const defaultVariant = typeof defaultVariantObj === 'object' ? defaultVariantObj.color : defaultVariantObj;
  let msg = `¡Hola Rosita! 🌸 Quiero comprar este producto:\n\n` +
            `• *${p.title}*\n` +
            `• Color/Variante: _${defaultVariant}_\n` +
            `• Precio: ${formatCOP(p.price)}\n\n` +
            `¿Me indicas disponibilidad para entrega en Galapa / Barranquilla? ✨`;

  const waUrl = `https://wa.me/573226031596?text=${encodeURIComponent(msg)}`;
  window.open(waUrl, "_blank");
}

function buyModalItemWhatsApp() {
  if (!currentModalProduct) return;
  const p = currentModalProduct;
  const totalItemPrice = p.price * selectedModalQty;

  let msg = `¡Hola Rosita! 🌸 Quiero comprar este producto:\n\n` +
            `• ${selectedModalQty}x *${p.title}*\n` +
            `• Color/Variante: _${selectedModalVariant}_\n` +
            `• Valor Total: ${formatCOP(totalItemPrice)}\n\n` +
            `¿Cómo podemos coordinar la entrega? ✨`;

  const waUrl = `https://wa.me/573226031596?text=${encodeURIComponent(msg)}`;
  window.open(waUrl, "_blank");
}

// Acordeón de Preguntas Frecuentes
function toggleFaq(headerElement) {
  const item = headerElement.parentElement;
  item.classList.toggle("open");
}

// Notificación Toast Simple
function showToastNotification(message) {
  let toast = document.getElementById("toastNotification");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toastNotification";
    toast.style.cssText = `
      position: fixed;
      bottom: 90px;
      left: 50%;
      transform: translateX(-50%);
      background: var(--dark-accent);
      color: var(--rose-gold-light);
      padding: 12px 24px;
      border-radius: 30px;
      font-size: 0.88rem;
      font-weight: 600;
      box-shadow: 0 8px 24px rgba(0,0,0,0.2);
      z-index: 9999;
      opacity: 0;
      transition: opacity 0.3s ease;
      pointer-events: none;
    `;
    document.body.appendChild(toast);
  }

  toast.innerText = message;
  toast.style.opacity = "1";
  setTimeout(() => {
    toast.style.opacity = "0";
  }, 2500);
}

// ============================================================
// MANEJO DE VARIANTES Y SUS IMÁGENES
// ============================================================
function addAdminVariantRow(color = "", imageBase64 = "") {
  const container = document.getElementById("adminVariantsContainer");
  if (!container) return;

  const rowId = 'varRow_' + Date.now() + Math.floor(Math.random() * 1000);
  
  const row = document.createElement("div");
  row.className = "admin-variant-row";
  row.id = rowId;
  row.style.cssText = "display: flex; gap: 8px; align-items: center; background: #FDF2F5; padding: 10px; border-radius: 8px; border: 1px solid var(--border-pink);";
  
  row.innerHTML = `
    <input type="text" class="form-control variant-color-input" placeholder="Nombre (ej: Rojo)" value="${color}" style="flex: 2; margin: 0; padding: 8px;">
    
    <div style="flex: 1; display: flex; align-items: center; justify-content: center; gap: 5px;">
      <input type="file" id="file_${rowId}" accept="image/*" style="display: none;" onchange="handleVariantImageSelect(event, '${rowId}')">
      <input type="hidden" class="variant-image-data" id="data_${rowId}" value="${imageBase64}">
      
      <img id="img_${rowId}" src="${imageBase64}" style="width: 32px; height: 32px; object-fit: cover; border-radius: 4px; display: ${imageBase64 ? 'block' : 'none'}; border: 1px solid #ddd;">
      
      <button type="button" class="btn-secondary" onclick="document.getElementById('file_${rowId}').click()" style="padding: 6px; font-size: 0.8rem; flex: 1; text-align: center;" title="Subir imagen">
        <i class="fa-solid fa-camera"></i>
      </button>
    </div>
    
    <button type="button" onclick="removeAdminVariantRow('${rowId}')" style="background: none; border: none; color: #E53935; cursor: pointer; padding: 4px;" title="Quitar variante">
      <i class="fa-solid fa-circle-xmark"></i>
    </button>
  `;
  container.appendChild(row);
}

function removeAdminVariantRow(rowId) {
  const row = document.getElementById(rowId);
  if (row) row.remove();
}

async function handleVariantImageSelect(event, rowId) {
  const file = event.target.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    showToastNotification("Por favor selecciona una imagen válida.");
    return;
  }

  const imgEl = document.getElementById('img_' + rowId);
  const dataEl = document.getElementById('data_' + rowId);
  
  if (imgEl) {
    // Indicador de carga visual
    imgEl.src = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MCA1MCI+PHBhdGggZmlsbD0iI2NjYyIgZD0iTTI1IDJDMTIuMyAyIDIgMTIuMyAyIDI1czEwLjMgMjMgMjMgMjMgMjMtMTAuMyAyMy0yM1MzNy43IDIgMjUgMnptMCA0MmMtMTAuNSAwLTE5LTguNS0xOS0xOVMxNC41IDYgMjUgNiAzNCAxNC41IDM0IDI1IDEwLjUgNDQgMjUgNDR6Ii8+PHBhdGggZmlsbD0iIzAwMCIgZD0iTTI1IDhDMTUuNiA4IDggMTUuNiA4IDI1cy0yIDItMiAwaTJDOCA0LjcgMTQuNyAyIDI1IDJzMi0yIDIgMnoiPjxhbmltYXRlVHJhbnNmb3JtIGF0dHJpYnV0ZU5hbWU9InRyYW5zZm9ybSIgdHlwZT0icm90YXRlIiBmcm9tPSIwIDI1IDI1IiB0bz0iMzYwIDI1IDI1IiBkdXI9IjFzIiByZXBlYXRDb3VudD0iaW5kZWZpbml0ZSIvPjwvcGF0aD48L3N2Zz4=";
    imgEl.style.display = 'block';
  }

  try {
    const publicUrl = await uploadImageToSupabase(file);
    if (imgEl) {
      imgEl.src = publicUrl;
    }
    if (dataEl) {
      dataEl.value = publicUrl;
    }
    showToastNotification("Imagen de variante subida correctamente. ✅");
  } catch (error) {
    console.error("Error al subir imagen:", error);
    showToastNotification("Error al subir imagen de variante.");
    if (imgEl) imgEl.style.display = 'none';
  }
}

// ============================================================
// MANEJO DE CARGA DE ARCHIVOS DE IMAGEN
// ============================================================

async function handleImageFileSelect(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    showToastNotification("Por favor selecciona un archivo de imagen válido.");
    return;
  }

  const previewContainer = document.getElementById("imagePreviewContainer");
  const previewImg = document.getElementById("imagePreview");
  const imageDataInput = document.getElementById("adminImageData");

  if (previewImg) previewImg.src = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MCA1MCI+PHBhdGggZmlsbD0iI2NjYyIgZD0iTTI1IDJDMTIuMyAyIDIgMTIuMyAyIDI1czEwLjMgMjMgMjMgMjMgMjMtMTAuMyAyMy0yM1MzNy43IDIgMjUgMnptMCA0MmMtMTAuNSAwLTE5LTguNS0xOS0xOVMxNC41IDYgMjUgNiAzNCAxNC41IDM0IDI1IDEwLjUgNDQgMjUgNDR6Ii8+PHBhdGggZmlsbD0iIzAwMCIgZD0iTTI1IDhDMTUuNiA4IDggMTUuNiA4IDI1cy0yIDItMiAwaTJDOCA0LjcgMTQuNyAyIDI1IDJzMi0yIDIgMnoiPjxhbmltYXRlVHJhbnNmb3JtIGF0dHJpYnV0ZU5hbWU9InRyYW5zZm9ybSIgdHlwZT0icm90YXRlIiBmcm9tPSIwIDI1IDI1IiB0bz0iMzYwIDI1IDI1IiBkdXI9IjFzIiByZXBlYXRDb3VudD0iaW5kZWZpbml0ZSIvPjwvcGF0aD48L3N2Zz4=";
  if (previewContainer) previewContainer.style.display = "flex";

  try {
    const publicUrl = await uploadImageToSupabase(file);
    if (previewImg) previewImg.src = publicUrl;
    if (imageDataInput) imageDataInput.value = publicUrl;
    showToastNotification("¡Imagen cargada correctamente a Supabase! 📷");
  } catch (error) {
    console.error("Error al subir imagen:", error);
    showToastNotification("Error al subir imagen principal.");
    if (previewContainer) previewContainer.style.display = "none";
  }
}

async function uploadImageToSupabase(file) {
  if (!supabaseClient) {
    throw new Error("Supabase no está configurado.");
  }
  
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
  
  // Sube el archivo al bucket "productos_img"
  const { data, error } = await supabaseClient
    .storage
    .from('productos_img')
    .upload(fileName, file);

  if (error) {
    throw error;
  }

  // Obtiene la URL pública
  const { data: publicUrlData } = supabaseClient
    .storage
    .from('productos_img')
    .getPublicUrl(fileName);

  return publicUrlData.publicUrl;
}

function compressImage(base64Str, maxWidth, quality, callback) {
  const img = new Image();
  img.onload = function() {
    let width = img.width;
    let height = img.height;

    if (width > maxWidth) {
      height = Math.round((height * maxWidth) / width);
      width = maxWidth;
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, width, height);

    const compressed = canvas.toDataURL("image/jpeg", quality);
    callback(compressed);
  };
  img.src = base64Str;
}

function removeSelectedImage() {
  const previewContainer = document.getElementById("imagePreviewContainer");
  const previewImg = document.getElementById("imagePreview");
  const imageDataInput = document.getElementById("adminImageData");
  const fileInput = document.getElementById("adminImageFile");

  if (previewContainer) previewContainer.style.display = "none";
  if (previewImg) previewImg.src = "";
  if (imageDataInput) imageDataInput.value = "";
  if (fileInput) fileInput.value = "";
}

// ============================================================
// REGISTRO E HISTORIAL DE VENTAS EN SUPABASE
// ============================================================

async function recordSale(cartItems, zonaEnvio, costoEnvio, subtotal, total) {
  if (!supabaseClient) {
    console.warn("Supabase no configurado. La venta no se registró en la base de datos.");
    return;
  }

  const productos = cartItems.map(item => ({
    titulo: item.title,
    variante: item.variant,
    cantidad: item.quantity,
    precio_unitario: item.price,
    precio_total: item.price * item.quantity
  }));

  const { error } = await supabaseClient
    .from('ventas')
    .insert({
      productos: productos,
      zona_envio: zonaEnvio,
      costo_envio: costoEnvio,
      subtotal: subtotal,
      total: total
    });

  if (error) {
    console.error("Error al registrar venta en Supabase:", error);
  } else {
    console.log("Venta registrada exitosamente en Supabase.");
  }
}

function openSalesModal() {
  if (!isAdminLoggedIn) return;

  document.getElementById("salesOverlay").classList.add("active");
  document.getElementById("salesModal").classList.add("active");
  loadSalesHistory();
}

function closeSalesModal() {
  document.getElementById("salesOverlay").classList.remove("active");
  document.getElementById("salesModal").classList.remove("active");
}

async function loadSalesHistory() {
  const tbody = document.getElementById("salesTableBody");
  const statTotal = document.getElementById("statTotalVendido");
  const statPedidos = document.getElementById("statTotalPedidos");
  const statProductos = document.getElementById("statTotalProductos");

  if (!tbody) return;

  if (!supabaseClient) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 40px; color: var(--dark-muted);">
          <i class="fa-solid fa-triangle-exclamation" style="font-size: 2rem; color: #F59E0B; margin-bottom: 12px; display: block;"></i>
          <strong style="font-size: 1rem;">Supabase no configurado</strong><br>
          <span style="font-size: 0.82rem; line-height: 1.6;">Reemplaza <code>TU_SUPABASE_URL_AQUI</code> y <code>TU_SUPABASE_ANON_KEY_AQUI</code><br>en <strong>app.js</strong> con tus credenciales de Supabase.</span>
        </td>
      </tr>
    `;
    if (statTotal) statTotal.innerText = "$0 COP";
    if (statPedidos) statPedidos.innerText = "0";
    if (statProductos) statProductos.innerText = "0";
    return;
  }

  // Estado de carga
  tbody.innerHTML = `
    <tr>
      <td colspan="6" style="text-align: center; padding: 40px; color: var(--dark-muted);">
        <i class="fa-solid fa-spinner fa-spin" style="font-size: 1.5rem; margin-bottom: 10px; display: block;"></i>
        Cargando ventas...
      </td>
    </tr>
  `;

  const { data, error } = await supabaseClient
    .from('ventas')
    .select('*')
    .order('fecha', { ascending: false });

  if (error) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 40px; color: #E53935;">
          <i class="fa-solid fa-circle-exclamation" style="font-size: 1.5rem; margin-bottom: 10px; display: block;"></i>
          Error al cargar ventas: ${error.message}
        </td>
      </tr>
    `;
    return;
  }

  if (!data || data.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 40px; color: var(--dark-muted);">
          <i class="fa-solid fa-box-open" style="font-size: 2rem; margin-bottom: 10px; display: block; color: var(--border-pink);"></i>
          <strong>No hay ventas registradas aún</strong><br>
          <span style="font-size: 0.82rem;">Las ventas aparecerán aquí cuando los clientes hagan pedidos por WhatsApp.</span>
        </td>
      </tr>
    `;
    if (statTotal) statTotal.innerText = "$0 COP";
    if (statPedidos) statPedidos.innerText = "0";
    if (statProductos) statProductos.innerText = "0";
    return;
  }

  // Calcular estadísticas
  let totalVendido = 0;
  let totalProductos = 0;

  data.forEach(venta => {
    totalVendido += Number(venta.total) || 0;
    if (Array.isArray(venta.productos)) {
      venta.productos.forEach(p => {
        totalProductos += p.cantidad || 0;
      });
    }
  });

  if (statTotal) statTotal.innerText = formatCOP(totalVendido);
  if (statPedidos) statPedidos.innerText = data.length;
  if (statProductos) statProductos.innerText = totalProductos;

  // Renderizar las filas de la tabla
  tbody.innerHTML = data.map(venta => {
    const fecha = new Date(venta.fecha);
    const fechaStr = fecha.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
    const horaStr = fecha.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });

    let productosHTML = '';
    if (Array.isArray(venta.productos)) {
      productosHTML = venta.productos.map(p =>
        `<div class="sale-product-item">${p.cantidad}x ${p.titulo} <small>(${p.variante})</small></div>`
      ).join('');
    }

    return `
      <tr>
        <td>
          <div class="sale-date">${fechaStr}</div>
          <div class="sale-time">${horaStr}</div>
        </td>
        <td>${productosHTML}</td>
        <td><span class="sale-zone-tag">${venta.zona_envio}</span></td>
        <td>${formatCOP(venta.subtotal)}</td>
        <td>${venta.costo_envio === 0 ? '<span style="color: #10B981; font-weight: 600;">GRATIS</span>' : formatCOP(venta.costo_envio)}</td>
        <td><strong style="color: var(--primary-pink-dark);">${formatCOP(venta.total)}</strong></td>
      </tr>
    `;
  }).join('');
}

