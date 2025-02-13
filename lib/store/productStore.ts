// stores/productStore.ts
import { create } from 'zustand';
import { Product } from '../hooks/useProduct';

interface ProductStore {
  productDialog: boolean;
  deleteProductDialog: boolean;
  deleteProductsDialog: boolean;
  selectedProducts: Product[]; // Array of Product objects
  product: Product | null;
  setProductDialog: (open: boolean) => void;
  setDeleteProductDialog: (open: boolean) => void;
  setDeleteProductsDialog: (open: boolean) => void;
  setSelectedProducts: (products: Product[]) => void; // Accepts Product[]
  setProduct: (product: Product | null) => void;
}

export const useProductStore = create<ProductStore>((set) => ({
  productDialog: false,
  deleteProductDialog: false,
  deleteProductsDialog: false,
  selectedProducts: [], // Array of Product objects
  product: null,
  setProductDialog: (open) => set({ productDialog: open }),
  setDeleteProductDialog: (open) => set({ deleteProductDialog: open }),
  setDeleteProductsDialog: (open) => set({ deleteProductsDialog: open }),
  setSelectedProducts: (products) => set({ selectedProducts: products }),
  setProduct: (product) => set({ product }),
}));
