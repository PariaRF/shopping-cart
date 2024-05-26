import { productsData } from "./products.js";

// SELECT
const cartBtn = document.querySelector(".cart-btn");
const backdrop = document.querySelector(".backdrop");
const cartModal = document.querySelector(".cart__modal");
const cartConfirm = document.querySelector(".cart__confirm");
const productList = document.querySelector(".product-list");
const cartItems = document.querySelector(".cart__items");
const cartTotalPrice = document.querySelector(".cart__total-price");
const cartList = document.querySelector(".cart__list");
const clearCart = document.querySelector(".cart__clear");



// VARIABLES
let cart = [];
let buttonDOM = [];


// EVENTS
cartBtn.addEventListener("click", openCartModal);
backdrop.addEventListener("click", closeCartModal);
cartConfirm.addEventListener("click", closeCartModal);
document.addEventListener("DOMContentLoaded", ()=>{
    const products = new Products();
    const productsData = products.getProducts();

    const ui = new UI();
    ui.setUpApp()
    ui.displayProducts(productsData);
    ui.getAddToCartBtns();
    ui.cartLogic();
    Storage.savePrducts(productsData);
})


// CLASSES
class Products{
    getProducts(){
        return productsData;
    }
}

class UI{
    displayProducts(productsData){
        let result=""
        productsData.forEach(item=>{
            result += `
            <div class="product-card">
                <img src=${item.imageUrl} alt=${item.title.replaceAll(" ", "-")}>
                <div class="product__body">
                    <div class="product__detail">
                        <span>$ ${item.price}</span>
                        <span>${item.title}</span>
                    </div>
                    <button class="product__add-btn" data-id=${item.id}>
                        add to cart
                    </button>
                </div>
            </div>
            `;
            productList.innerHTML = result;
        })
    }

    getAddToCartBtns(){
        const addToCartBtns = [...document.querySelectorAll(".product__add-btn")];
        buttonDOM = addToCartBtns;
        addToCartBtns.forEach(btn =>{
            const id = btn.dataset.id;
            const isInCart =  cart.find(p => p.id === Number(id));
            if(isInCart){
                btn.innerText = "In Cart";
                btn.disabled = true;
                btn.style.cursor= "not-allowed";
            }

            btn.addEventListener("click", (e)=>{
                e.target.innerText = "In Cart";
                btn.disabled = true;
                btn.style.cursor= "not-allowed";

                const addedProduct = {...Storage.getProduct(id), quantity:1};

                cart = [...cart, addedProduct];
                Storage.saveCart(cart);
                this.setCartValue(cart);
                this.addCartItem(addedProduct);
            })
        })

    }

    setCartValue(cart){
        let tempCartItems = 0;
        const totalPrice = cart.reduce((acc, curr)=>{
            tempCartItems += curr.quantity;
            return acc + curr.quantity * curr.price;
        },0);

        cartTotalPrice.innerText = `total price: ${totalPrice.toFixed(2)} $`;
        cartItems.innerText = tempCartItems;
    }

    addCartItem(cartItem){
        cartList.innerHTML += `
        <div class="cart__item">
            <img src=${cartItem.imageUrl} alt=${cartItem.title.replaceAll(" ", "-")}>
            <div class="item__detail">
                <h4>${cartItem.title}</h4>
                <h5>${cartItem.price}</h5>
            </div>
            <div class="item__controller">
                <i class="fas fa-chevron-up" data-id=${cartItem.id}></i>
                <p>${cartItem.quantity}</p>
                <i class="fas fa-chevron-down" data-id=${cartItem.id}></i>
            </div>
            <i class="far fa-trash-alt" data-id=${cartItem.id}></i>
        </div>`; 
    }

    setUpApp(){
       cart = Storage.getCart();
       cart.forEach(cartItem => this.addCartItem(cartItem));
       this.setCartValue(cart)
    }

    cartLogic(){
        clearCart.addEventListener("click",()=> this.clearCart());

        cartList.addEventListener("click", (e) =>{
            if(e.target.classList.contains("fa-chevron-up")){
                const clickedItem = e.target;
                const clickedItemSibling = clickedItem.nextElementSibling;
                const downChevron = clickedItem.nextElementSibling.nextElementSibling;

                const addedItem = cart.find(cItem => Number(cItem.id) === Number(clickedItem.dataset.id));
                addedItem.quantity++;
                this.setCartValue(cart);
                Storage.saveCart(cart);

                clickedItemSibling.innerText = addedItem.quantity; 

                downChevron.style.cursor = "pointer";
                downChevron.style.opacity = "1";
                downChevron.disabled = false;
                
            }else if(e.target.classList.contains("fa-trash-alt")){
                const removeItem = e.target;
                const removedItem = cart.find(cItem => Number(cItem.id) === Number(removeItem.dataset.id));
                this.removeItem(removedItem.id);
                cartList.removeChild(removeItem.parentElement)

            }else if(e.target.classList.contains("fa-chevron-down")){
                const clickedItem = e.target;
                const clickedItemSibling = clickedItem.previousElementSibling;

                const addedItem = cart.find(cItem => Number(cItem.id) === Number(clickedItem.dataset.id));
                console.log(addedItem.quantity);
                if(addedItem.quantity === 1){
                    clickedItem.disabled = true;
                    clickedItem.style.opacity = "0.5";
                    clickedItem.style.cursor= "not-allowed";
                }else{
                    addedItem.quantity--;
                    clickedItem.style.cursor = "pointer";
                    clickedItem.style.opacity = "1";
                    clickedItem.disabled = false;
                }
                this.setCartValue(cart);
                Storage.saveCart(cart);

                clickedItemSibling.innerText = addedItem.quantity; 
            }
        })
    }

    clearCart(){
        cart.forEach(cItem => this.removeItem(cItem.id));
         while(cartList.children.length){
            cartList.removeChild(cartList.children[0])
        }
        closeCartModal();
    }

    removeItem(id){
        cart = cart.filter(cItem => cItem.id !== id)
        this.setCartValue(cart);
        Storage.saveCart(cart);

        this.getSingleButton(id);
    }

    getSingleButton(id){
        let button = buttonDOM.find(btn => Number(btn.dataset.id) === id);
        button.innerText = "add to cart";
        button.disabled = false;
        button.style.cursor = "pointer";
    }
}

class Storage{
    static savePrducts(products){
        const savedPrducts = localStorage.setItem("products", JSON.stringify(products)) || [];
    }

    static getProduct(id){
        const _products = JSON.parse(localStorage.getItem("products"));  
        return _products.find(p => p.id === Number(id));
    }

    static saveCart(cart){
        localStorage.setItem("cart", JSON.stringify(cart));
    }

    static getCart(){
        return JSON.parse(localStorage.getItem("cart")) || [];
    }
}


// FUNCTIONS
function openCartModal(){
    backdrop.classList.remove("hidden");
    cartModal.classList.remove("hidden");
}

function closeCartModal(){
    backdrop.classList.add("hidden");
    cartModal.classList.add("hidden");
}