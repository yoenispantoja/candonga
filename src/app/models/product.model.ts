export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  mainImage: string;
  secondaryImages: string[];
  status: 'Nuevo' | 'Poco Uso' | 'Usado' | 'Lo usó Matusalén';
}
