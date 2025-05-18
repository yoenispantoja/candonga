import { Component, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Lightbox, LightboxConfig, LightboxEvent, IAlbum } from 'ngx-lightbox';
import { Product, GalleryImage } from '../../models/product.model';
import { ProductService } from '../../services/product.service';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { SliderModule } from 'primeng/slider';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { InputNumberModule } from 'primeng/inputnumber';
import { lastValueFrom, Subscription, take } from 'rxjs';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CommonModule } from '@angular/common';
import { PaginatorModule } from 'primeng/paginator';

type Filters = {
  name: string;
  status: string;
  category: string;
  priceRange: [number, number];
  sortBy: string;
};

interface Categoria {
  nombre: string;
  valor: string;
}

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    DropdownModule,
    SliderModule,
    ButtonModule,
    TooltipModule,
    InputNumberModule,
    ProgressSpinnerModule,
    SliderModule,
    PaginatorModule,
  ],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
  providers: [LightboxConfig],
})
export class ProductListComponent {
  private productService = inject(ProductService);
  private lightbox = inject(Lightbox);
  private lightboxEvent = inject(LightboxEvent);
  private lightboxConfig = inject(LightboxConfig);
  private subscription!: Subscription;

  categories: Categoria[] = [];
  loading = signal<boolean>(false);

  sortOptions = [
    { label: 'Precio: menor a mayor', value: 'price-asc' },
    { label: 'Precio: mayor a menor', value: 'price-desc' },
  ];

  filters = signal<Filters>({
    name: '',
    status: '',
    category: '',
    priceRange: [0, 20000] as [number, number],
    sortBy: '',
  });

  products = signal<Product[]>([]);
  paginatedProducts = signal<Product[]>([]);
  first = signal<number>(0); // Índice del primer elemento
  rows = signal<number>(8); // Items por página
  totalRecords = signal<number>(0);
  galleryImagesCache = new Map<number, GalleryImage[]>();

  async loadGalleryImages() {
    this.loading.set(true);
    try {
      for (const product of this.products()) {
        if (product.galeriaId && !this.galleryImagesCache.has(product.id)) {
          const galleryImages = await lastValueFrom(
            this.productService
              .getGalleryImages(product.galeriaId)
              .pipe(take(1))
          );
          this.galleryImagesCache.set(product.id, galleryImages || []);
        }
      }
    } catch (error) {
      console.error('Error loading gallery images:', error);
    } finally {
      this.loading.set(false);
    }
  }

  constructor() {
    // Configuración del Lightbox
    this.lightboxConfig.fadeDuration = 0.3;
    this.lightboxConfig.resizeDuration = 0.3;
    this.lightboxConfig.fitImageInViewPort = true;
    this.lightboxConfig.showImageNumberLabel = true;
    this.lightboxConfig.alwaysShowNavOnTouchDevices = true;
    this.lightboxConfig.wrapAround = true;

    effect(
      () => {
        this.categories = [];
        this.productService.categories().map((category) => {
          this.categories.push({
            nombre: category,
            valor: category,
          });
        });
        const { name, status, category, priceRange, sortBy } = this.filters();

        let filtered = this.productService.filterProducts({
          name,
          minPrice: priceRange[0],
          maxPrice: priceRange[1],
          category,
        });

        if (sortBy === 'price-asc') {
          filtered = [...filtered].sort((a, b) => a.precio - b.precio);
        } else if (sortBy === 'price-desc') {
          filtered = [...filtered].sort((a, b) => b.precio - a.precio);
        }

        this.products.set(filtered);
        this.totalRecords.set(filtered.length);
        this.updatePaginatedProducts();
        this.loadGalleryImages();
      },
      { allowSignalWrites: true }
    );

    // Limpieza de la suscripción al Lightbox
    this.subscription = this.lightboxEvent.lightboxEvent$.subscribe();
  }

  // Método para actualizar los productos paginados
  updatePaginatedProducts() {
    const startIndex = this.first();
    const endIndex = startIndex + this.rows();
    this.paginatedProducts.set(this.products().slice(startIndex, endIndex));
  }

  // Maneja el evento de cambio de página
  onPageChange(event: any) {
    this.first.set(event.first);
    this.rows.set(event.rows);
    this.updatePaginatedProducts();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  updateFilter<K extends keyof Filters>(key: K, value: Filters[K]) {
    this.filters.update((f) => ({ ...f, [key]: value }));
  }

  onPriceRangeChange(value: number | [number, number] | undefined) {
    if (Array.isArray(value) && value.length === 2) {
      this.updateFilter('priceRange', value);
    }
  }

  resetFilters() {
    this.filters.set({
      name: '',
      status: '',
      category: '',
      priceRange: [0, 10000] as [number, number],
      sortBy: '',
    });
  }

  handleImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    if (!img.src.includes('placeholder')) {
      img.src = 'assets/images/placeholder.jpg';
      img.onerror = null; // Prevenir bucles de error
    }
  }

  async openLightbox(product: Product, index: number = 0) {
    if (this.loading()) return;

    this.loading.set(true);

    try {
      // Cargar imágenes de galería si no están en caché
      if (product.galeriaId && !this.galleryImagesCache.has(product.id)) {
        const galleryImages = await lastValueFrom(
          this.productService.getGalleryImages(product.galeriaId).pipe(take(1))
        );
        this.galleryImagesCache.set(product.id, galleryImages || []);
      }

      // Crear array de imágenes con el tipo correcto
      const albums: IAlbum[] = [
        {
          src: product.imagenDestacada || 'assets/images/placeholder.jpg',
          caption: product.nombre,
          thumb:
            product.imagenDestacada || 'assets/images/placeholder-thumb.jpg',
        },
      ];

      // Agregar imágenes de galería si existen
      const cachedImages = this.galleryImagesCache.get(product.id) || [];
      cachedImages.forEach((image) => {
        albums.push({
          src: image.url || 'assets/images/placeholder.jpg',
          caption: product.nombre,
          thumb: image.url || 'assets/images/placeholder-thumb.jpg',
        });
      });

      // Abrir lightbox solo si hay imágenes
      if (albums.length > 0) {
        this.lightbox.open(albums, index);
      }
    } catch (error) {
      console.error('Error al abrir lightbox:', error);
    } finally {
      this.loading.set(false);
    }
  }
}
