import { Component, inject } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { CartService } from '../../services/cart.service';


@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [NgFor, NgIf],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent {
  private cartService = inject(CartService);

  cart = this.cartService.getCart();
  total = this.cartService.totalAmount;

  generateInvoice() {
    // Aquí iría la lógica para generar la pre-factura y enviarla por correo
    console.log('Generando pre-factura...');
    // Limpiamos el carrito después de generar la factura
    this.cartService.clearCart();
  }
}
