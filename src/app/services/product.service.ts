import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Product, Gallery, GalleryImage } from '../models/product.model';
import { environment } from '../../environments/environment';
import { tap, catchError, switchMap, map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

interface ProductFilters {
  name: string;
  minPrice: number;
  maxPrice: number;
  category: string;
  todoPorUno: number | null;
}

interface ServiceState {
  loading: boolean;
  error: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  // Private state
  private readonly state = signal<ServiceState>({
    loading: false,
    error: null,
  });

  private readonly products = signal<Product[]>([]);
  private readonly galleryCache = new Map<number, Gallery>();

  // Public selectors
  readonly productsList = this.products.asReadonly();
  readonly loading = computed(() => this.state().loading);
  readonly error = computed(() => this.state().error);
  readonly categories = computed(() => [
    ...new Set(this.products().map((p) => p.categoria)),
  ]);

  // API endpoints
  private readonly BASE_URL = environment.apiUrl;
  private readonly IMAGES_URL = environment.imagesUrl || this.BASE_URL;
  private readonly productsEndpoint = `${this.BASE_URL}/producto?aplicacionId=${environment.aplicacionId}`;
  private readonly galleryEndpoint = (galleryId: number) =>
    `${this.BASE_URL}/galeria/${galleryId}`;

  constructor(private http: HttpClient) {
    this.loadProducts();
  }

  // Public API
  loadProducts(): void {
    this.updateState({ loading: true, error: null });

    this.http
      .get<{ items: Product[] }>(this.productsEndpoint)
      .pipe(
        map((response) => this.mapProductImages(response.items)),
        tap((products) => {
          this.products.set(products);
          this.updateState({ loading: false });
        }),
        catchError((error) =>
          this.handleError('Error al cargar los productos', error)
        )
      )
      .subscribe();
  }

  getProductById(id: number): Product | undefined {
    return this.products().find((p) => p.id === id);
  }

  getGalleryImages(galleryId: number): Observable<GalleryImage[]> {
    return this.getGallery(galleryId).pipe(map((gallery) => gallery.imagenes));
  }

  getProductWithGallery(productId: number): Observable<{
    product: Product | undefined;
    gallery: Gallery;
  }> {
    const product = this.getProductById(productId);

    if (!product) {
      return of({
        product: undefined,
        gallery: this.createEmptyGallery(),
      });
    }

    if (!product.galeriaId) {
      return of({
        product,
        gallery: this.createEmptyGallery(product.nombre),
      });
    }

    return this.getGallery(product.galeriaId).pipe(
      switchMap((gallery) => of({ product, gallery }))
    );
  }

  filterProducts(filters: Partial<ProductFilters>): Product[] {
    const products = this.products();

    if (!Array.isArray(products)) {
      console.error('Products is not an array:', products);
      return [];
    }

    return products.filter((product) => {
      return this.matchesAllFilters(product, filters);
    });
  }

  updateProduct(updatedProduct: Product): void {
    this.products.update((products) =>
      products.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
    );
  }

  addProduct(newProduct: Product): void {
    this.products.update((products) => [...products, newProduct]);
  }

  // Private methods
  private getGallery(galleryId: number): Observable<Gallery> {
    if (this.galleryCache.has(galleryId)) {
      return of(this.galleryCache.get(galleryId)!);
    }

    return this.http.get<Gallery>(this.galleryEndpoint(galleryId)).pipe(
      map((gallery) => this.mapGalleryImages(galleryId, gallery)),
      tap((gallery) => this.galleryCache.set(galleryId, gallery)),
      catchError((error) => this.handleGalleryError(galleryId, error))
    );
  }

  private mapProductImages(products: Product[]): Product[] {
    return products.map((product) => ({
      ...product,
      imagenDestacada: this.getFullImageUrl(
        `productos/${product.id}/${product.imagenDestacada}`
      ),
    }));
  }

  private mapGalleryImages(galleryId: number, gallery: Gallery): Gallery {
    return {
      ...gallery,
      imagenes: gallery.imagenes.map((image) => ({
        ...image,
        url: this.getFullImageUrl(
          `galerias/${galleryId}/${image.nombreImagen}`
        ),
      })),
    };
  }

  private getFullImageUrl(path: string): string {
    return `${this.IMAGES_URL}/${path}`;
  }

  private createEmptyGallery(name: string = ''): Gallery {
    return {
      id: 0,
      nombre: name ? `Galería de ${name}` : 'Galería vacía',
      imagenPortada: '',
      descripcion: '',
      created_at: '',
      updated_at: '',
      deleted_at: null,
      usuarioId: 0,
      estadoId: 1,
      aplicacionId: environment.aplicacionId,
      estado: {
        id: 1,
        nombre: 'Vacía',
        descripcion: 'No hay imágenes en esta galería',
        created_at: '',
        updated_at: '',
        deleted_at: null,
      },
      imagenes: [],
    };
  }

  private matchesAllFilters(
    product: Product,
    filters: Partial<ProductFilters>
  ): boolean {
    const nameMatch =
      !filters.name ||
      product.nombre.toLowerCase().includes(filters.name.toLowerCase());

    const priceMatch =
      (filters.minPrice === undefined || product.precio >= filters.minPrice) &&
      (filters.maxPrice === undefined || product.precio <= filters.maxPrice);

    const categoryMatch =
      !filters.category || product.categoria === filters.category;

    const todoPorUnoMatch =
      !filters.todoPorUno || parseFloat(product.precio.toString()) === filters.todoPorUno;
    return nameMatch && priceMatch && categoryMatch && todoPorUnoMatch;
  }

  private updateState(partialState: Partial<ServiceState>): void {
    this.state.update((current) => ({ ...current, ...partialState }));
  }

  private handleError(message: string, error: any): Observable<never> {
    console.error(message, error);
    this.updateState({
      loading: false,
      error: message,
    });
    return of();
  }

  private handleGalleryError(
    galleryId: number,
    error: any
  ): Observable<Gallery> {
    console.error(`Error loading gallery ${galleryId}:`, error);
    return of(this.createEmptyGallery());
  }

  updateStock(productId: number, quantity: number) {
    this.products.update(products =>
      products.map(p =>
        //change estadoId to 2
        p.id === productId ? { ...p, estadoId: 2 } : p
      )
    );
  }
}
