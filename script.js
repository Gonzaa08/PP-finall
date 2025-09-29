// VARIABLES GLOBALES
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
let index = 0;

// CARRITO
function agregarAlCarrito(nombre, precio) {
  carrito.push({ nombre, precio: parseFloat(precio) || 0 });
  localStorage.setItem("carrito", JSON.stringify(carrito));
  actualizarCarrito();
  
  const notif = document.createElement("div");
  notif.textContent = `✅ ${nombre} agregado`;
  notif.style.cssText = "position:fixed;top:100px;right:20px;background:#28a745;color:white;padding:15px 25px;border-radius:8px;z-index:9999;font-weight:bold;";
  document.body.appendChild(notif);
  setTimeout(() => notif.remove(), 2000);
}

function actualizarCarrito() {
  const lista = document.getElementById("listaCarrito");
  const total = document.getElementById("total");
  const contador = document.getElementById("contadorCarrito");
  const carritoVacio = document.getElementById("carritoVacio");
  const carritoConProductos = document.getElementById("carritoConProductos");

  if (!lista || !total) return;

  lista.innerHTML = "";
  let suma = 0;

  carrito.forEach((item, idx) => {
    const li = document.createElement("li");
    li.className = "item-carrito";
    li.innerHTML = `
      <div class="item-info">
        <span class="item-nombre">${item.nombre}</span>
        <span class="item-precio">$${item.precio.toFixed(2)}</span>
      </div>
      <button class="btn-eliminar" onclick="eliminarDelCarrito(${idx})">✖</button>
    `;
    lista.appendChild(li);
    suma += item.precio;
  });

  total.textContent = suma.toFixed(2);

  if (contador) {
    contador.textContent = carrito.length;
    contador.style.display = carrito.length > 0 ? "inline-block" : "none";
  }

  if (carrito.length > 0) {
    if (carritoVacio) carritoVacio.classList.add("oculto");
    if (carritoConProductos) carritoConProductos.classList.remove("oculto");
  } else {
    if (carritoVacio) carritoVacio.classList.remove("oculto");
    if (carritoConProductos) carritoConProductos.classList.add("oculto");
  }
}

function eliminarDelCarrito(idx) {
  carrito.splice(idx, 1);
  localStorage.setItem("carrito", JSON.stringify(carrito));
  actualizarCarrito();
}

function vaciarCarrito() {
  if (confirm("¿Vaciar el carrito?")) {
    carrito = [];
    localStorage.setItem("carrito", JSON.stringify(carrito));
    actualizarCarrito();
  }
}

// NAVEGACIÓN
function ocultarTodo() {
  document.getElementById("sliderSection")?.classList.add('oculto');
  document.getElementById("categoriasSection")?.classList.add('oculto');
  document.getElementById("beneficiosSection")?.classList.add('oculto');
  document.querySelectorAll('.productos').forEach(s => s.classList.add('oculto'));
}

function mostrarInicio() {
  ocultarTodo();
  document.getElementById("sliderSection")?.classList.remove('oculto');
  document.getElementById("categoriasSection")?.classList.remove('oculto');
  document.getElementById("beneficiosSection")?.classList.remove('oculto');
}

// CUANDO EL DOM ESTÉ LISTO
document.addEventListener("DOMContentLoaded", () => {
  
  // SLIDER
  const slides = document.querySelectorAll(".slide");
  const dots = document.querySelectorAll(".dot");

  if (slides.length > 0) {
    function showSlide(n) {
      slides.forEach((s, i) => {
        s.style.display = i === n ? "block" : "none";
        dots[i]?.classList.toggle("active", i === n);
      });
    }

    setInterval(() => {
      index = (index + 1) % slides.length;
      showSlide(index);
    }, 4000);

    showSlide(0);

    dots.forEach((dot, i) => {
      dot.addEventListener("click", () => {
        index = i;
        showSlide(index);
      });
    });
  }
  
  actualizarCarrito();
  
  // BOTÓN CARRITO
  document.getElementById("btnCarrito")?.addEventListener("click", (e) => {
    e.preventDefault();
    ocultarTodo();
    document.getElementById("carrito").classList.remove("oculto");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  
  // CATEGORÍAS
  document.querySelectorAll('.dropdown-content a, .grid-categorias a').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        ocultarTodo();
        target.classList.remove('oculto');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  });
  
  // LOGO
  document.getElementById("logoInicio")?.addEventListener('click', (e) => {
    e.preventDefault();
    mostrarInicio();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  
  // MODAL
  const modal = document.getElementById("modalRegistro");
  const btnReg = document.getElementById("btnRegistro");
  const cerrar = document.getElementById("cerrarModal");

  btnReg?.addEventListener("click", () => modal.style.display = "flex");
  cerrar?.addEventListener("click", () => modal.style.display = "none");
  window.addEventListener("click", (e) => {
    if (e.target === modal) modal.style.display = "none";
  });
  
  // FORMS
  document.getElementById("formRegistro")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const dni = document.getElementById("regDNI").value;
    const msg = document.getElementById("mensajeRegistro");
    
    if (!/^\d+$/.test(dni)) {
      msg.textContent = "⚠️ DNI solo números";
      msg.style.color = "red";
      return;
    }
    
    fetch("register.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `dni=${dni}&email=${document.getElementById("regEmail").value}&pass=${document.getElementById("regPass").value}`
    })
    .then(r => r.json())
    .then(d => {
      msg.textContent = d.message;
      msg.style.color = d.status === "success" ? "lightgreen" : "red";
    });
  });
  
  document.getElementById("formLogin")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const msg = document.getElementById("mensajeLogin");
    
    fetch("login.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `email=${document.getElementById("logEmail").value}&pass=${document.getElementById("logPass").value}`
    })
    .then(r => r.json())
    .then(d => {
      msg.textContent = d.message;
      msg.style.color = d.status === "success" ? "lightgreen" : "red";
      if (d.status === "success") setTimeout(() => location.reload(), 1000);
    });
  });
});