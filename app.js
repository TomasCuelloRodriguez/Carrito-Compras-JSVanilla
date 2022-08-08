 
const cards = document.getElementById('cards')
const items = document.getElementById('items')
const footer = document.getElementById('footer')
const templateCard = document.getElementById('template-card').content    //el content accede a los elementos dentro del,en este caso, template  
const templateFooter = document.getElementById('template-footer').content
const templeateCarrito = document.getElementById('template-carrito').content
const fragment = document.createDocumentFragment()   //crea fragment del documento para evitar el reflow
let carrito ={}


//async await    => await siempre tiene q estar dentro de una funcion async,el await espera una peticion a un json para ejecutar una accion, catch es para marcar los posibles erroes
const fetchData =async() => {
    try{
        //respuesta de la peticion esperada ("await") 
        const res = await fetch('db.json') // el fetch es para mainipular mediante petisiones http, una base de datos (se llama APIfetch)  
        // se guarda la data que espera como respuesta un json
        const data = await res.json()
        //aca adentro se llaman a las funciones
        printCards(data)
    }
    catch(error){
        console.log(error)
    }
}

document.addEventListener('DOMContentLoaded', ()=> {
    fetchData()
})                                                      //el evento se dispara cuando el documento html a sido completamente cargado  y parseado



document.addEventListener('DOMContentLoaded',()=>{
    if(localStorage.getItem('carrito')){                    //me fijo si el carrito esta en el local storage
        carrito = JSON.parse(localStorage.getItem('carrito')) // utilizo ese local storage para el carrito
        pintarCarrito()     //pinto el carrito creado apartir del local storage
    }
})
        

const printCards = data => {
    //for each, por cada  producto en producs ejecuta la funcion
    data.forEach(producto =>{
        templateCard.querySelector('.name').textContent = producto.name
        templateCard.querySelector('.price').textContent = producto.price
        templateCard.querySelector('.cardImg').setAttribute("src",producto.url) //agrega el atributo src a la clase cardImg
        templateCard.querySelector('.btnComprar').dataset.id = producto.id    // añade al btncomprar el data-id igual al id del producto
        const clone =templateCard.cloneNode(true) //crea clones del templateCard
        fragment.appendChild(clone) //agrego los clones al fragment

    })
    cards.appendChild(fragment) //agrego los fragment a la clase cards
}



cards.addEventListener('click',(e) =>{ //creo el evento click en la clase raiz
    addCarrito(e)   //ejecuto la funcion add carrito con los datos pasados por e
})


items.addEventListener('click',(e) =>{
    btnAccion(e)
})

const addCarrito = e =>{
    if(e.target.classList.contains('btnComprar')){        //.classList.contains devuelve booleano si el target contiene la classe dada como parametro
      setCarrito(e.target.parentElement)                 // se agrega al carrito todo lo que contiene el elemento
    }
    e.stopPropagation()

}

const setCarrito = objeto =>{

    const producto ={
        id: objeto.querySelector(".btnComprar").dataset.id, // creo un objeto con id igual a la id del producto elegido al apretar el boton
        name: objeto.querySelector(".name").textContent,
        price: objeto.querySelector(".price").textContent,
        cantidad: 1
    }
    if(carrito.hasOwnProperty(producto.id)){             //si el carrito ya tiene le producto
        producto.cantidad = carrito[producto.id].cantidad +1 //agrego +1 a producto.cantidad
    }
    Toastify({
        text:producto.name + " se ha agregado al carrito",
        duration: 1500,
        gravity: 'bottom',
        position: 'right',
        style: {
            background: "teal",
          }
    }).showToast();
    carrito[producto.id] = {...producto} // agrego al carrito el objeto producto, los puntos suspensivos son spread operators, para enviar todo el contenido del producto al carrito
    pintarCarrito(carrito)

}


const pintarCarrito = () =>{
    items.innerHTML ="" //arranca vacio para que no se repitan los productos dentro del carrito, se limpia cada vez que se agrega uno 
    Object.values(carrito).forEach(producto => {   //objet.values para utilizar las propiedades de un objeto en un ciclo foreach
        templeateCarrito.querySelector('.carritoId').textContent = producto.id
        templeateCarrito.querySelector('.carritoName').textContent = producto.name
        templeateCarrito.querySelector('.carritoCant').textContent = producto.cantidad
        templeateCarrito.querySelector('.btnSumar').dataset.id = producto.id
        templeateCarrito.querySelector('.btnRestar').dataset.id = producto.id
        templeateCarrito.querySelector('.carritoPrice').textContent = producto.cantidad * producto.price
        const clone = templeateCarrito.cloneNode(true)
        fragment.appendChild(clone)
    })
    items.appendChild(fragment)
    pintarFooter()
    localStorage.setItem('carrito',JSON.stringify(carrito))  //guardo mi carrito en el local storage luego de volver string mi carrito
}

const pintarFooter = () =>{
    footer.innerHTML = ''
    if(Object.keys(carrito).length === 0){
        footer.innerHTML= `      
         <th scope="row" colspan="2">CARRITO VACIO</th>
        `
        return

    }
    const nCantidad = Object.values(carrito).reduce((accum,{cantidad}) => accum + cantidad,0) //accedo a la cantidad de cada objeto, y lo sumo con el acumulador
    const nPrecio = Object.values(carrito).reduce((accum,{cantidad,price}) => accum + cantidad * price,0) // ,0 define que se va a devolver un numero

    templateFooter.querySelector('.cantidad').textContent = nCantidad
    templateFooter.querySelector('.precioFinal').textContent = nPrecio
    const clone = templateFooter.cloneNode(true)
    fragment.appendChild(clone)
    footer.appendChild(fragment)

    const btnVaciar = document.getElementById('vaciar-carrito') //selecciono el boton vaciiar
    btnVaciar.addEventListener('click',() =>{
        Toastify({
            text:"Carrito Vaciado",
            duration: 1500,
            gravity: 'bottom',
            position: 'right',
            style: {
                background: "red",
              }
        }).showToast();
        carrito = {}                //vacio el carrito
        pintarCarrito()             //vuelvo a ejecutar el ciclo de pintado de carrito para que lo pinte vacio
    })

}

const btnAccion  = e => {
    if(e.target.classList.contains('btnSumar')){   //si el boton tiene la clase sumar
        const producto = carrito[e.target.dataset.id] //busco el producto dentro del carrito por su id
        producto.cantidad ++ // le sumo +1 a la cantidad    
        carrito[e.target.dataset.id] = {...producto} // incorporo lo cambios al producto
        pintarCarrito()  //vuelvo a pintar el carrito para que se actualicen los datos en pantalla
        Toastify({
            text:producto.name + " se ha agregado al carrito",
            duration: 1500,
            gravity: 'bottom',
            position: 'right',
            style: {
                background: "teal",
              }
        }).showToast();
    }
    if(e.target.classList.contains('btnRestar')){
        const producto = carrito[e.target.dataset.id] 
        producto.cantidad --
        Toastify({
            text:producto.name + " se ha eliminado del carrito",
            duration: 1500,
            gravity: 'bottom',
            position: 'right',
            style: {
                background: "#800000",
              }
        }).showToast();
        if (carrito[e.target.dataset.id].cantidad === 0){    //en el caso de que llege a 0 se borra el objeto del carrito por ende se deja de pintar en pantalla
            delete carrito[e.target.dataset.id]
        } 
        pintarCarrito()
          
        
    }
    e.stopPropagation
} 

