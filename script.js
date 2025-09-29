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

// FINALIZAR COMPRA
function finalizarCompra() {
  // Verificar si está logueado
  fetch("check_session.php")
    .then(r => r.json())
    .then(d => {
      if (!d.authenticated) {
        alert("Debe iniciar sesión para finalizar la compra");
        document.getElementById("btnRegistro").click();
        return;
      }
      
      // Verificar que hay productos
      if (carrito.length === 0) {
        alert("El carrito está vacío");
        return;
      }
      
      // Calcular total
      const total = carrito.reduce((sum, item) => sum + item.precio, 0);
      
      // Enviar pedido
      const formData = new URLSearchParams();
      formData.append('carrito', JSON.stringify(carrito));
      formData.append('total', total);
      
      fetch("crear_pedido.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString()
      })
      .then(r => r.json())
      .then(d => {
        if (d.status === "success") {
          alert(`${d.message}\n\nNúmero de pedido: #${d.pedido_id}\n\nTotal: $${total.toFixed(2)}`);
          
          // Vaciar carrito
          carrito = [];
          localStorage.setItem("carrito", JSON.stringify(carrito));
          actualizarCarrito();
          
          // Ir a mis pedidos
          setTimeout(() => {
            mostrarMisPedidos();
          }, 1000);
        } else {
          alert(d.message);
        }
      })
      .catch(err => {
        console.error(err);
        alert("Error al procesar el pedido");
      });
    });
}

// MIS PEDIDOS
function mostrarMisPedidos() {
  ocultarTodo();
  document.getElementById("misPedidos").classList.remove("oculto");
  window.scrollTo({ top: 0, behavior: 'smooth' });
  
  // Cargar pedidos
  fetch("mis_pedidos.php")
    .then(r => r.json())
    .then(d => {
      const lista = document.getElementById("listaPedidos");
      
      if (d.status === "error") {
        lista.innerHTML = `<p style="text-align:center; color:red;">${d.message}</p>`;
        return;
      }
      
      if (d.pedidos.length === 0) {
        lista.innerHTML = `
          <div class="pedidos-vacio">
            <p style="font-size: 3rem;">📦</p>
            <p style="font-size: 1.2rem; font-weight: bold;">No tienes pedidos aún</p>
            <p>¡Comienza a comprar para ver tus pedidos aquí!</p>
          </div>
        `;
        return;
      }
      
      // Mostrar pedidos
      lista.innerHTML = d.pedidos.map(pedido => {
        const fecha = new Date(pedido.fecha).toLocaleDateString('es-AR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        
        const productos = pedido.productos.map(p => 
          `<li>${p.nombre} - $${p.precio.toFixed(2)}</li>`
        ).join('');
        
        return `
          <div class="pedido-card">
            <div class="pedido-header">
              <div>
                <div class="pedido-numero">Pedido #${pedido.id}</div>
                <div class="pedido-fecha">${fecha}</div>
              </div>
              <span class="pedido-estado estado-${pedido.estado}">${pedido.estado}</span>
            </div>
            
            <div class="pedido-productos">
              <strong>Productos:</strong>
              <ul>${productos}</ul>
            </div>
            
            <div class="pedido-total">Total: $${pedido.total}</div>
          </div>
        `;
      }).join('');
    })
    .catch(err => {
      console.error(err);
      document.getElementById("listaPedidos").innerHTML = 
        `<p style="text-align:center; color:red;">Error al cargar pedidos</p>`;
    });
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

// VERIFICAR SESIÓN
function verificarSesion() {
  fetch("check_session.php")
    .then(r => r.json())
    .then(d => {
      const btnReg = document.getElementById("btnRegistro");
      const btnPedidos = document.getElementById("btnPedidos");
      const modal = document.getElementById("modalRegistro");
      
      if (d.authenticated) {
        // Usuario autenticado
        btnReg.textContent = "👤 Mi Cuenta";
        btnPedidos?.classList.remove("oculto"); // Mostrar botón pedidos
        
        // Modificar comportamiento del botón
        btnReg.onclick = () => {
          // Ocultar columnas de login y registro
          document.querySelectorAll('.modal-form .columna').forEach((col, idx) => {
            if (idx < 2) col.style.display = "none";
          });
          
          // Mostrar columna Mi Cuenta
          const columnaCuenta = document.getElementById('columnaMiCuenta');
          columnaCuenta.style.display = "block";
          
          // Llenar datos
          document.getElementById("userEmail").textContent = d.user.email;
          document.getElementById("userDni").textContent = d.user.dni;
          
          // Mostrar modal
          modal.style.display = "flex";
        };
      } else {
        // Usuario no autenticado - comportamiento normal
        btnReg.textContent = "🔑 Iniciar Sesión";
        btnPedidos?.classList.add("oculto"); // Ocultar botón pedidos
        
        btnReg.onclick = () => {
          // Mostrar columnas normales
          document.querySelectorAll('.modal-form .columna').forEach((col, idx) => {
            if (idx < 2) col.style.display = "block";
          });
          document.getElementById('columnaMiCuenta').style.display = "none";
          modal.style.display = "flex";
        };
      }
    })
    .catch(() => {});
}

// Función cerrar sesión
function cerrarSesion() {
  fetch("logout.php")
    .then(r => r.json())
    .then(d => {
      alert(d.message);
      location.reload();
    });
}

// CUANDO EL DOM ESTÉ LISTO
document.addEventListener("DOMContentLoaded", () => {
  
  // Verificar sesión primero
  verificarSesion();
  
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
  
  // BOTÓN MIS PEDIDOS
  document.getElementById("btnPedidos")?.addEventListener("click", (e) => {
    e.preventDefault();
    mostrarMisPedidos();
  });
  
  // BOTÓN FINALIZAR COMPRA
  document.querySelector('.btn-comprar')?.addEventListener('click', finalizarCompra);
  
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

  cerrar?.addEventListener("click", () => modal.style.display = "none");
  window.addEventListener("click", (e) => {
    if (e.target === modal) modal.style.display = "none";
  });
  
  // FORM REGISTRO
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
  
  // FORM LOGIN
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
  
  // FORM EDITAR
  const formEditar = document.getElementById("formEditar");
  if (formEditar) {
    formEditar.addEventListener("submit", (e) => {
      e.preventDefault();
      const msg = document.getElementById("mensajeEditar");
      
      const email = document.getElementById("editEmail").value;
      const dni = document.getElementById("editDni").value;
      
      const formData = new URLSearchParams();
      if (email) formData.append('email', email);
      if (dni) formData.append('dni', dni);
      
      fetch("update_user.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString()
      })
      .then(r => r.json())
      .then(d => {
        msg.textContent = d.message;
        msg.style.color = d.status === "success" ? "lightgreen" : "red";
        if (d.status === "success") {
          document.getElementById("userEmail").textContent = d.user.email;
          document.getElementById("userDni").textContent = d.user.dni;
          document.getElementById("formEditar").reset();
        }
      });
    });
  }
  
  // FORM ELIMINAR
  const formEliminar = document.getElementById("formEliminar");
  if (formEliminar) {
    formEliminar.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!confirm("¿Eliminar tu cuenta? Esto NO se puede deshacer")) return;
      
      const msg = document.getElementById("mensajeEliminar");
      const pass = document.getElementById("deletePass").value;
      
      fetch("delete_user.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `password=${encodeURIComponent(pass)}`
      })
      .then(r => r.json())
      .then(d => {
        msg.textContent = d.message;
        msg.style.color = d.status === "success" ? "lightgreen" : "red";
        if (d.status === "success") {
          setTimeout(() => location.reload(), 2000);
        }
      });
    });
  }
});