const cards = document.getElementById('cards')
const items = document.getElementById('items')
const footer = document.getElementById('footer')
const templateCard = document.getElementById('template-card').content
const templateFooter = document.getElementById('template-footer').content
const templateCarrito = document.getElementById('template-carrito').content

const fragment = document.createDocumentFragment()
//creamos el carrito, (un objeto vacio)
let carrito = {}

document.addEventListener('DOMContentLoaded', () => {
  // Recuperar y mostrar el carrito si existe
  if (localStorage.getItem('carrito')) {
    carrito = JSON.parse(localStorage.getItem('carrito'))
    pintarCarrito()
  }

  // Solo si existe fetchData (es decir, en index.html), lo ejecutamos
  if (typeof fetchData === 'function') {
    fetchData()

    // Filtro por categoría en index
    document.querySelectorAll('.categoria-link').forEach(link => {
      link.addEventListener('click', async e => {
        e.preventDefault()
        const categoria = e.target.dataset.categoria

        const res = await fetch('api.json')
        const data = await res.json()

        if (categoria === 'todos') {
          pintarCards(data)
        } else {
          const filtrados = data.filter(producto => producto.categoria === categoria)
          pintarCards(filtrados)
        }
      })
    })
  }
})


//cuando tocas en comprar te agrega al carrito
cards.addEventListener('click', e => {
  const btn = e.target
  const id = btn.dataset.id
  if (!id) return

  const card = btn.closest('.card-body')
  const nombre = card.querySelector('h5').textContent
  const precio = parseFloat(card.querySelector('p').textContent.replace('$', ''))

  // Siempre recuperamos todos los productos para repintar el catálogo completo
  const productos = JSON.parse(localStorage.getItem('productos')) || []

  if (btn.classList.contains('btn-sumar')) {
    if (!carrito[id]) {
      carrito[id] = { id, title: nombre, precio, cantidad: 0 }
    }
    carrito[id].cantidad++
    pintarCarrito()
    pintarCards(productos)
  }

  if (btn.classList.contains('btn-restar')) {
    if (carrito[id]) {
      carrito[id].cantidad--
      if (carrito[id].cantidad === 0) {
        delete carrito[id]
      }
      pintarCarrito()
      pintarCards(productos)
    }
  }

    if (btn.classList.contains('btn-agregar')) {
    if (!carrito[id]) {
        carrito[id] = { id, title: nombre, precio, cantidad: 1 }
    }
    pintarCarrito()
    pintarCards(productos)
    }
})

items.addEventListener('click', e => {
    btnAumentarDisminuir(e)
})
//trae la info desde el api.json
const fetchData = async () => {
  try {
    const res = await fetch('api.json')
    const data = await res.json()
    localStorage.setItem('productos', JSON.stringify(data)) // ✅ Guardar todos los productos
    pintarCards(data)
  } catch (error) {
    console.error('Error al cargar productos:', error)
  }
}

//Pintar productos
const pintarCards = (data) => {
  cards.innerHTML = ''
  data.forEach(producto => {
    templateCard.querySelector('h5').textContent = producto.title
    templateCard.querySelector('p').textContent = `$ ${producto.precio}`
    templateCard.querySelector('img').setAttribute('src', producto.thumbnailUrl)

    // Botones y cantidad
    templateCard.querySelector('.btn-agregar').dataset.id = producto.id
    templateCard.querySelector('.btn-sumar').dataset.id = producto.id
    templateCard.querySelector('.btn-restar').dataset.id = producto.id
    templateCard.querySelector('.cantidad').textContent = carrito[producto.id]?.cantidad || 0

    const clone = templateCard.cloneNode(true)
    fragment.appendChild(clone)
  })
  cards.appendChild(fragment)
}

// Agregar al carrito
const addCarrito = (e) => {

    if (e.target.classList.contains('btn-success')) {
        setCarrito(e.target.parentElement)

    }
    e.stopPropagation();

}
//los elemento seleccionados con el add carrito seran empujados aca 
const setCarrito = objeto => {

    const producto = {
        id: objeto.querySelector('.btn-success').dataset.id,
        title: objeto.querySelector('h5').textContent,
        precio: objeto.querySelector('p').textContent,
        cantidad: 1
    }
    if (carrito.hasOwnProperty(producto.id)) {
        //con esta operacion cuando tocamos comprar suma 1 a la cantidad
        producto.cantidad = carrito[producto.id].cantidad + 1
    }
    //los ... adquieren una copia del objeto producto(id title precio y cantidad)
    carrito[producto.id] = { ...producto }
    pintarCarrito()
}

//tenemos solo un th por eso acedemos a el y td tenemos mas por eso el queryselectorALL
const pintarCarrito = () => {
    items.innerHTML = ''
    //console.log(carrito)
    Object.values(carrito).forEach(producto => {
        templateCarrito.querySelector('th').textContent = producto.id
        templateCarrito.querySelectorAll('td')[0].textContent = producto.title
        templateCarrito.querySelectorAll('td')[1].textContent = producto.cantidad
        templateCarrito.querySelector('span').textContent = producto.cantidad * producto.precio



        //botones
        templateCarrito.querySelector('.btn-info').dataset.id = producto.id
        templateCarrito.querySelector('.btn-danger').dataset.id = producto.id

        const clone = templateCarrito.cloneNode(true)
        fragment.appendChild(clone)

    })
    items.appendChild(fragment)


    pintarFooter()
    //aca guardamos el localstorage
    localStorage.setItem('carrito', JSON.stringify(carrito))

}

const pintarFooter = () => {
    footer.innerHTML = ''
    if (Object.keys(carrito).length === 0) {
        footer.innerHTML = `
        <th scope="row" colspan="5">Carrito vacío - Puede comenzar a comprar!</th>
        `
        return
    }
    const nCantidad = Object.values(carrito).reduce((acc, { cantidad }) => acc + cantidad, 0)
    const nPrecio = Object.values(carrito).reduce((acc, { cantidad, precio }) => acc + cantidad * precio, 0)

    templateFooter.querySelectorAll('td')[0].textContent = nCantidad
    templateFooter.querySelector('span').textContent = nPrecio

    const clone = templateFooter.cloneNode(true)
    fragment.appendChild(clone)
    footer.appendChild(fragment)

    //const btnVaciar = document.getElementById('vaciar-carrito')
    //btnVaciar.addEventListener('click', () => {
    //  carrito = {}
    //  pintarCarrito()
    //})
    $('#vaciar-carrito').click(() => {
        carrito = {}
        pintarCarrito()
    })



}
//Modal
$('#modal-borrar-todo').click(() => {
    carrito = {}
    pintarCarrito()


})
/*
class Producto {
    constructor(name, telefono, direccion) {
        this.name = name;
        this.telefono = telefono;
        this.direccion = direccion;
    }
    resetForm() {
        document.getElementById('product-form').reset();

    }

}
*/

//para los btns de aumentar y disminuir
const btnAumentarDisminuir = e => {
    //accion de aumentar
    if (e.target.classList.contains('btn-info')) {

        const producto = carrito[e.target.dataset.id]
        producto.cantidad++
        carrito[e.target.dataset.id] = { ...producto }
        pintarCarrito()

    }
    //accion de disminuir
    if (e.target.classList.contains('btn-danger')) {

        const producto = carrito[e.target.dataset.id]
        producto.cantidad--
        if (producto.cantidad === 0) {
            delete carrito[e.target.dataset.id]
        } else {
            carrito[e.target.dataset.id] = { ...producto }
        }
        pintarCarrito()
    }
    e.stopPropagation()
}
