import { Component, ViewChild } from '@angular/core';
import { CartOverlayComponent } from '../overlay-cart/overlay-cart.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [CommonModule, CartOverlayComponent],
})
export class HeaderComponent {
  @ViewChild('cartOverlay') cartOverlay!: CartOverlayComponent;
}
