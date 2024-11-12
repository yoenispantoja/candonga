import { Component, inject, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Lightbox } from 'ngx-lightbox';
import { Product } from '../../models/product.model';
import { CartService } from '../../services/cart.service';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent {
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private lightbox = inject(Lightbox);

  products = signal<Product[]>(this.productService.getProducts()());
  categories = this.productService.categories;
  statuses = this.productService.statuses;

  filterName = signal('');
  filterMinPrice = signal(0);
  filterMaxPrice = signal(10000);
  filterStatus = signal('');
  filterCategory = signal('');

  addToCart(product: Product) {
    this.cartService.addToCart(product);
    this.productService.updateStock(product.id, 1);
  }

  handleImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = 'https://via.placeholder.com/400x300?text=Imagen+no+disponible';
  }

  openLightbox(product: Product, index: number) {
    const images = [
      { src: product.mainImage, thumb: product.mainImage },
      ...product.secondaryImages.map(img => ({ src: img, thumb: img }))
    ];
    this.lightbox.open(images, index);
  }

  applyFilters() {
    this.products.set(this.productService.filterProducts(
      this.filterName(),
      this.filterMinPrice(),
      this.filterMaxPrice(),
      this.filterStatus(),
      this.filterCategory()
    ));
  }

  resetFilters() {
    this.filterName.set('');
    this.filterMinPrice.set(0);
    this.filterMaxPrice.set(10000);
    this.filterStatus.set('');
    this.filterCategory.set('');
    this.products.set(this.productService.getProducts()());
  }

  // Nuevos métodos para manejar los cambios en los filtros
  updateFilterName(value: string) {
    this.filterName.set(value);
  }

  updateFilterMinPrice(value: number) {
    this.filterMinPrice.set(value);
  }

  updateFilterMaxPrice(value: number) {
    this.filterMaxPrice.set(value);
  }

  updateFilterStatus(value: string) {
    this.filterStatus.set(value);
  }

  updateFilterCategory(value: string) {
    this.filterCategory.set(value);
  }
}
