import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Product, Gallery, GalleryImage } from '../models/product.model';
import { environment } from '../../environments/environment.prod';
import { tap, catchError, switchMap, map } from 'rxjs/operators';
import { of, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private products = signal<Product[]>([]);
  private loading = signal<boolean>(false);
  private error = signal<string | null>(null);
  private galleryCache = new Map<number, Gallery>();

  BASE_URL = environment.apiUrl;
  IMAGES_URL = environment.imagesUrl || this.BASE_URL; // Asegúrate de tener esto en environment
  urlProducts = `${this.BASE_URL}/producto?aplicacionId=${environment.aplicacionId}`;
  urlGallery = (galleryId: number) =>
    `${this.BASE_URL}/galeria/${galleryId}`;

  constructor(private http: HttpClient) {
    this.loadProducts();
  }

  // Carga todos los productos
  loadProducts() {
    this.loading.set(true);
    this.error.set(null);

    this.http
      .get<Product[]>(this.urlProducts)
      .pipe(
        tap((products: any) => {
          // preparar imagenDestacada con URL completa
          products.items = products.items.map((product: Product) => {
            return {
              ...product,
              imagenDestacada: `${this.IMAGES_URL}/productos/${product.id}/${product.imagenDestacada}`,
            };
          });
          this.products.set(products.items);
          this.loading.set(false);
        }),
        catchError((err) => {
          this.error.set('Error al cargar los productos');
          this.loading.set(false);
          console.error('Error loading products:', err);
          return of([]);
        })
      )
      .subscribe();
  }

  // Obtiene la galería completa con sus imágenes
  getGallery(galleryId: number): Observable<Gallery> {
    if (this.galleryCache.has(galleryId)) {
      return of(this.galleryCache.get(galleryId)!);
    }

    return this.http.get<Gallery>(this.urlGallery(galleryId)).pipe(
      map((gallery) => ({
        ...gallery,
        imagenes: gallery.imagenes.map((image) => ({
          ...image,
          url: `${this.IMAGES_URL}/galerias/${galleryId}/${image.nombreImagen}`, // Construye la URL completa
        })),
      })),
      tap((gallery) => {
        console.log(gallery);
        this.galleryCache.set(galleryId, gallery);
      }),
      catchError((err) => {
        console.error('Error loading gallery:', err);
        return of({
          id: galleryId,
          nombre: 'Galería no disponible',
          imagenPortada: '',
          descripcion: '',
          created_at: '',
          updated_at: '',
          deleted_at: null,
          usuarioId: 0,
          estadoId: 0,
          aplicacionId: 0,
          estado: {
            id: 0,
            nombre: 'Error',
            descripcion: 'No se pudo cargar la galería',
            created_at: '',
            updated_at: '',
            deleted_at: null,
          },
          imagenes: [],
        });
      })
    );
  }

  // Obtiene solo las imágenes de una galería con URLs completas
  getGalleryImages(galleryId: number): Observable<GalleryImage[]> {
    return this.getGallery(galleryId).pipe(map((gallery) => gallery.imagenes));
  }

  // Obtiene un producto con su galería completa
  getProductWithGallery(
    productId: number
  ): Observable<{ product: Product | undefined; gallery: Gallery }> {
    const product = this.products().find((p) => p.id === productId);
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

  private createEmptyGallery(nombre: string = ''): Gallery {
    return {
      id: 0,
      nombre: nombre ? `Galería de ${nombre}` : 'Galería vacía',
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

  // Métodos existentes (se mantienen igual)
  getProducts() {
    return this.products.asReadonly();
  }

  getProductById(id: number) {
    return this.products().find((p) => p.id === id);
  }

  get isLoading() {
    return this.loading.asReadonly();
  }

  get hasError() {
    return this.error.asReadonly();
  }

  categories = computed(() => {
    return [...new Set(this.products().map((p) => p.categoria))];
  });

  filterProducts(filters: {
    name: string;
    minPrice: number;
    maxPrice: number;
    category: string;
  }): Product[] {
    const products = this.products(); // Get the current value of the signal
    if (!Array.isArray(products)) {
      console.error('Products is not an array:', products);
      return []; // Return an empty array if products is not valid
    }
    return this.products().filter((product) => {
      const matchesName =
        filters.name === '' ||
        product.nombre.toLowerCase().includes(filters.name.toLowerCase());
      const matchesPrice =
        product.precio >= filters.minPrice &&
        product.precio <= filters.maxPrice;
      const matchesCategory =
        filters.category === '' || product.categoria === filters.category;

      return matchesName && matchesPrice && matchesCategory;
    });
  }

  updateProduct(updatedProduct: Product) {
    this.products.update((products) =>
      products.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
    );
  }

  addProduct(newProduct: Product) {
    this.products.update((products) => [...products, newProduct]);
  }
}
