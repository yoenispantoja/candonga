import { Component, computed, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { OverlayPanel, OverlayPanelModule } from 'primeng/overlaypanel';
import { DividerModule } from 'primeng/divider';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'cart-overlay',
  standalone: true,
  imports: [CommonModule, ButtonModule, OverlayPanelModule, DividerModule],
  templateUrl: './overlay-cart.component.html',
  styleUrl: './overlay-cart.component.scss'
})
export class CartOverlayComponent {
  private cartService = inject(CartService);
  @ViewChild('op') op!: OverlayPanel;
  cart = this.cartService.getCart();
  totalAmount = this.cartService.totalAmount;

  cartItemsCount = computed(() => {
    const count = this.cart().reduce((count, item) => count + item.quantity, 0);
    return count > 0 ? count.toString() : undefined;
  });

  removeItem(item: any) {
    this.cartService.removeItem(item);
  }

  clearCart() {
    this.cartService.clearCart();
  }

  sendToWhatsApp() {
    const itemsText = this.cart().map(item =>
      `${item.nombre} - ${item.quantity} x ${item.precio} = ${item.quantity * item.precio}`
    ).join('%0A');

    const totalText = `Total: ${this.totalAmount()}`;
    const message = `Hola, estoy interesad@ en estos productos:%0A%0A${itemsText}%0A%0A${totalText}`;

    // Reemplaza con tu número de WhatsApp
    const whatsappNumber = '+59896117130';

    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  }
}
