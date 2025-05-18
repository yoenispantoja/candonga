export interface Product {
  id: number;
  nombre: string;
  imagenDestacada: string;
  descripcion: string;
  precio: number;
  categoria: string;
  estadoId: number;
  galeriaId: number;
  aplicacionId: number;
}

export interface GalleryStatus {
  id: number;
  nombre: string;
  descripcion: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface GalleryImage {
  id: number;
  nombreImagen: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  galeriaId: number;
  url?: string; // Podemos añadir esto para construir la URL completa
}

export interface Gallery {
  id: number;
  nombre: string;
  imagenPortada: string;
  descripcion: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  usuarioId: number;
  estadoId: number;
  aplicacionId: number;
  estado: GalleryStatus;
  imagenes: GalleryImage[];
}
