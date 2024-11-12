import { Injectable, signal, computed } from '@angular/core';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private products = signal<Product[]>([
    {
      id: 1,
      name: 'Sofá',
      category: 'Muebles',
      price: 300,
      stock: 1,
      mainImage: 'https://picsum.photos/seed/sofa/800/600',
      secondaryImages: [
        'https://picsum.photos/seed/sofa1/400/300',
        'https://picsum.photos/seed/sofa2/400/300',
        'https://picsum.photos/seed/sofa3/400/300',
        'https://picsum.photos/seed/sofa4/400/300',
        'https://picsum.photos/seed/sofa5/400/300',
        'https://picsum.photos/seed/sofa6/400/300',
      ],
      status: 'Poco Uso'
    },
    {
      id: 2,
      name: 'Mesa',
      category: 'Muebles',
      price: 150,
      stock: 1,
      mainImage: 'https://picsum.photos/seed/table/800/600',
      secondaryImages: [
        'https://picsum.photos/seed/table1/400/300',
        'https://picsum.photos/seed/table2/400/300'
      ],
      status: 'Usado'
    },
    {
      id: 3,
      name: 'Televisor',
      category: 'Electrónica',
      price: 400,
      stock: 1,
      mainImage: 'https://picsum.photos/seed/tv/800/600',
      secondaryImages: [
        'https://picsum.photos/seed/tv1/400/300',
        'https://picsum.photos/seed/tv2/400/300'
      ],
      status: 'Nuevo'
    },
    {
      id: 4,
      name: 'Laptop',
      category: 'Electrónica',
      price: 800,
      stock: 1,
      mainImage: 'https://picsum.photos/seed/laptop/800/600',
      secondaryImages: [
        'https://picsum.photos/seed/laptop1/400/300',
        'https://picsum.photos/seed/laptop2/400/300'
      ],
      status: 'Poco Uso'
    },
    {
      id: 5,
      name: 'Sartén',
      category: 'Cocina',
      price: 30,
      stock: 2,
      mainImage: 'https://picsum.photos/seed/pan/800/600',
      secondaryImages: [
        'https://picsum.photos/seed/pan1/400/300',
        'https://picsum.photos/seed/pan2/400/300'
      ],
      status: 'Lo usó Matusalén'
    },
  ]);

  getProducts() {
    return this.products;
  }

  categories = computed(() => {
    return [...new Set(this.products().map(p => p.category))];
  });

  statuses = computed(() => {
    return [...new Set(this.products().map(p => p.status))];
  });

  updateStock(productId: number, quantity: number) {
    this.products.update(products =>
      products.map(p =>
        p.id === productId ? { ...p, stock: p.stock - quantity } : p
      )
    );
  }

  filterProducts(name: string, minPrice: number, maxPrice: number, status: string, category: string) {
    return this.products().filter(product =>
      (name ? product.name.toLowerCase().includes(name.toLowerCase()) : true) &&
      (minPrice ? product.price >= minPrice : true) &&
      (maxPrice ? product.price <= maxPrice : true) &&
      (status ? product.status === status : true) &&
      (category ? product.category === category : true)
    );
  }
}
