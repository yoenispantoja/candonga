import { Injectable, signal, computed } from '@angular/core';
import { Product } from '../models/product.model';


interface CartItem extends Product {
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cart = signal<CartItem[]>([]);

  addToCart(product: Product) {
    this.cart.update(cart => {
      const existingItem = cart.find(item => item.id === product.id);
      if (existingItem) {
        return cart.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...cart, { ...product, quantity: 1 }];
      }
    });
  }

  getCart() {
    return this.cart;
  }

  totalAmount = computed(() => {
    return this.cart().reduce((total, item) => total + item.price * item.quantity, 0);
  });

  clearCart() {
    this.cart.set([]);
  }
}
