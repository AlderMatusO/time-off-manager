import { Element } from '../node_modules/@polymer/polymer/polymer-element.js';

// This element is connected to the redux store.
import { store } from './store/store.js';
import { removeFromCart } from './store/actions/shop.js';

class ShopCart extends Element {
  static get template() {
    return `
      <p hidden$="[[_hasItemsInCart(cart)]]">Please add some products to cart.</p>
      <dom-repeat items="[[_displayCart(cart)]]">
        <template>
          <div>
            [[item.title]] ([[item.amount]] * [[item.price]])
            <button on-click="removeFromCart" data-index$="[[item.id]]">
              Remove
            </button>
          </div>
        </template>
      </dom-repeat>
      <p>Total: $<span>[[_calculateTotal(cart)]]</span></p>
`;
  }

  static get is() {
    return 'shop-cart';
  }

  static get properties() { return {
    cart: Object,
    products: Object
  }}

  constructor() {
    super();

    // Connect the element to the store.
    store.subscribe(() => this.update());
    this.update();
  }

  // This is called every time something is updated in the store.
  update() {
    const state = store.getState();
    this.setProperties({
      products: state.shop.products,
      cart: state.shop.cart
    });
  }

  removeFromCart(event) {
    store.dispatch(removeFromCart(event.target.dataset['index']));
  }

  _displayCart(cart) {
    const items = [];
    for (let id of cart.addedIds) {
      const item = this.products[id];
      items.push({id: item.id, title: item.title, amount: cart.quantityById[id], price: item.price});
    }
    return items;
  }

  _hasItemsInCart(cart) {
    return cart.addedIds.length !== 0;
  }

  _calculateTotal(cart) {
    let total = 0;
    for (let id of cart.addedIds) {
      const item = this.products[id];
      total += item.price * cart.quantityById[id];
    }
    return parseFloat(Math.round(total * 100) / 100).toFixed(2);
  }
}

window.customElements.define(ShopCart.is, ShopCart);