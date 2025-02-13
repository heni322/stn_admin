'use client';
import { useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable, DataTableFilterMeta, DataTableSelectionMultipleChangeEvent } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber, InputNumberValueChangeEvent } from 'primereact/inputnumber';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { FileUpload } from 'primereact/fileupload';
import { Dropdown } from 'primereact/dropdown';
import { classNames } from 'primereact/utils';

interface ProductVariant {
  id?: string;
  size: string;
  color: string;
  price: number;
  stock: number;
}

interface ProductImage {
  id?: string;
  image_path: string;
  is_primary: boolean;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  site_id: string;
  category_id: string;
  variants: ProductVariant[];
  images: ProductImage[];
}

interface PaginationMeta {
  totalItems: number;
  currentPage: number;
  totalPages: number;
  limit: number;
}

const ProductCrud = () => {
  const toast = useRef<Toast>(null);
  const [productDialog, setProductDialog] = useState(false);
  const [deleteProductDialog, setDeleteProductDialog] = useState(false);
  const [deleteProductsDialog, setDeleteProductsDialog] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tableFilters, setTableFilters] = useState<DataTableFilterMeta>({});

  const [filters, setFilters] = useState({
    name: '',
    category_id: '',
    sort_by: 'created_at',
    sort_order: 'desc',
    page: 1,
    per_page: 10
  });
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
        const queryParams = new URLSearchParams({
            ...filters,
            page: filters.page.toString(), // Convert to string
            per_page: filters.per_page.toString(), // Convert to string
            paginate: 'true'
          });

      const response = await fetch(`/api/products?${queryParams}`);
      const data = await response.json();

      if (data.success) {
        setProducts(data.data);
        setPagination(data.pagination);
      }
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to fetch products',
        life: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  const openNew = () => {
    setProduct({
      id: '',
      name: '',
      description: '',
      price: 0,
      site_id: '',
      category_id: '',
      variants: [],
      images: []
    });
    setSubmitted(false);
    setProductDialog(true);
  };

  const hideDialog = () => {
    setProductDialog(false);
    setSubmitted(false);
  };

  const saveProduct = async () => {
    setSubmitted(true);

    if (product?.name.trim()) {
      const formData = new FormData();
      formData.append('name', product.name);
      formData.append('description', product.description || '');
      formData.append('price', product.price.toString());
      formData.append('site_id', product.site_id);
      formData.append('category_id', product.category_id);

      // Append variants
      product.variants.forEach((variant, index) => {
        Object.entries(variant).forEach(([key, value]) => {
          formData.append(`variants[${index}][${key}]`, value.toString());
        });
      });

      // Append images
      product.images.forEach((image) => {
        formData.append('images[]', image as any);
      });

      try {
        const url = product.id ? `/api/products/${product.id}` : '/api/products';
        const method = product.id ? 'PUT' : 'POST';

        const response = await fetch(url, {
          method,
          body: formData,
          headers: {
            'Accept': 'application/json',
          }
        });

        const data = await response.json();

        if (response.ok) {
          toast.current?.show({
            severity: 'success',
            summary: 'Success',
            detail: `Product ${product.id ? 'updated' : 'created'} successfully`,
            life: 3000
          });
          fetchProducts();
        } else {
          throw new Error(data.error || 'Operation failed');
        }
      } catch (error) {
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: "error",
          life: 3000
        });
      }

      hideDialog();
    }
  };

  const deleteProduct = async () => {
    try {
      const response = await fetch(`/api/products/${product?.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.current?.show({
          severity: 'success',
          summary: 'Success',
          detail: 'Product deleted successfully',
          life: 3000
        });
        fetchProducts();
      }
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to delete product',
        life: 3000
      });
    }
    setDeleteProductDialog(false);
  };

  const addVariant = () => {
    if (product) {
      setProduct({
        ...product,
        variants: [
          ...product.variants,
          { size: '', color: '', price: 0, stock: 0 }
        ]
      });
    }
  };

  const onVariantChange = (index: number, field: keyof ProductVariant, value: any) => {
    if (product) {
      const updatedVariants = [...product.variants];
      updatedVariants[index] = {
        ...updatedVariants[index],
        [field]: value
      };
      setProduct({ ...product, variants: updatedVariants });
    }
  };

  const onImageUpload = (event: any) => {
    if (product) {
      const files = event.files;
      setProduct({
        ...product,
        images: [...product.images, ...files]
      });
    }
  };

  const leftToolbarTemplate = () => (
    <div className="my-2">
      <Button label="New" icon="pi pi-plus" severity="success" className="mr-2" onClick={openNew} />
      <Button
        label="Delete"
        icon="pi pi-trash"
        severity="danger"
        onClick={() => setDeleteProductsDialog(true)}
        disabled={!selectedProducts.length}
      />
    </div>
  );

  const rightToolbarTemplate = () => (
    <div className="my-2">
      <InputText
        placeholder="Search by name..."
        value={filters.name}
        onChange={(e) => setFilters({ ...filters, name: e.target.value })}
        className="mr-2"
      />
      <Dropdown
        value={filters.sort_by}
        options={[
          { label: 'Created Date', value: 'created_at' },
          { label: 'Name', value: 'name' },
          { label: 'Price', value: 'price' }
        ]}
        onChange={(e) => setFilters({ ...filters, sort_by: e.value })}
        placeholder="Sort By"
        className="mr-2"
      />
      <Button
        icon={filters.sort_order === 'asc' ? 'pi pi-sort-up' : 'pi pi-sort-down'}
        onClick={() => setFilters({
          ...filters,
          sort_order: filters.sort_order === 'asc' ? 'desc' : 'asc'
        })}
        className="mr-2"
      />
    </div>
  );

  const actionBodyTemplate = (rowData: Product) => (
    <div className="flex gap-2">
      <Button
        icon="pi pi-pencil"
        rounded
        severity="success"
        onClick={() => {
          setProduct(rowData);
          setProductDialog(true);
        }}
      />
      <Button
        icon="pi pi-trash"
        rounded
        severity="warning"
        onClick={() => {
          setProduct(rowData);
          setDeleteProductDialog(true);
        }}
      />
    </div>
  );

  const onSelectionChange = (e: DataTableSelectionMultipleChangeEvent<Product[]>) => {
    setSelectedProducts(e.value || []);
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, name: string) => {
    const val = e.target.value || '';
    setProduct(product ? { ...product, [name]: val } : null);
  };

  const onInputNumberChange = (e: InputNumberValueChangeEvent, name: string) => {
    const val = e.value || 0;
    setProduct(product ? { ...product, [name]: val } : null);
  };

  const productDialogFooter = (
    <>
      <Button label="Cancel" icon="pi pi-times" severity="secondary" onClick={hideDialog} />
      <Button label="Save" icon="pi pi-check" severity="success" onClick={saveProduct} />
    </>
  );

  const deleteProductDialogFooter = (
    <>
      <Button label="No" icon="pi pi-times" severity="secondary" onClick={() => setDeleteProductDialog(false)} />
      <Button label="Yes" icon="pi pi-check" severity="danger" onClick={deleteProduct} />
    </>
  );

  const deleteProductsDialogFooter = (
    <>
      <Button label="No" icon="pi pi-times" severity="secondary" onClick={() => setDeleteProductsDialog(false)} />
      <Button
        label="Yes"
        icon="pi pi-check"
        severity="danger"
        onClick={() => {
          Promise.all(selectedProducts.map(p => fetch(`/api/products/${p.id}`, { method: 'DELETE' })))
            .then(() => {
              setDeleteProductsDialog(false);
              setSelectedProducts([]);
              fetchProducts();
              toast.current?.show({
                severity: 'success',
                summary: 'Success',
                detail: 'Products deleted successfully',
                life: 3000
              });
            })
            .catch(() => {
              toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to delete products',
                life: 3000
              });
            });
        }}
      />
    </>
  );

  return (
    <div className="grid crud-demo">
      <div className="col-12">
        <div className="card">
          <Toast ref={toast} />
          <Toolbar
            className="mb-4"
            left={leftToolbarTemplate}
            right={rightToolbarTemplate}
          />

            <DataTable
                value={products}
                selection={selectedProducts}
                onSelectionChange={onSelectionChange}
                selectionMode="multiple" // Fix: Add selectionMode
                dataKey="id"
                paginator
                rows={filters.per_page}
                totalRecords={pagination?.totalItems}
                lazy
                first={(filters.page - 1) * filters.per_page}
                onPage={(e) => {
                    if (e.page !== undefined) {
                    setFilters({ ...filters, page: e.page + 1 });
                    }
                }}
                loading={loading}
                filters={tableFilters} // Use tableFilters for DataTable
                onFilter={(e) => setTableFilters(e.filters)} // Update tableFilters
            >
            <Column selectionMode="multiple" headerStyle={{ width: '4rem' }} />
            <Column field="name" header="Name" sortable filter />
            <Column field="price" header="Price" sortable />
            <Column field="category_id" header="Category" sortable filter />
            <Column body={actionBodyTemplate} />
            </DataTable>

          <Dialog
            visible={productDialog}
            style={{ width: '70vw' }}
            header="Product Details"
            modal
            className="p-fluid"
            footer={productDialogFooter}
            onHide={hideDialog}
          >
            {/* Basic Info */}
            <div className="formgrid grid">
              <div className="field col-6">
                <label htmlFor="name">Name</label>
                <InputText
                  id="name"
                  value={product?.name}
                  onChange={(e) => onInputChange(e, 'name')}
                  required
                  className={classNames({ 'p-invalid': submitted && !product?.name })}
                />
                {submitted && !product?.name && <small className="p-error">Name is required.</small>}
              </div>

              <div className="field col-6">
                <label htmlFor="price">Price</label>
                <InputNumber
                  id="price"
                  value={product?.price}
                  onValueChange={(e) => onInputNumberChange(e, 'price')}
                  mode="currency"
                  currency="USD"
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="description">Description</label>
              <InputTextarea
                id="description"
                value={product?.description}
                onChange={(e) => onInputChange(e, 'description')}
                rows={3}
              />
            </div>

            {/* Variants Section */}
            <div className="field">
              <label>Variants</label>
              <Button label="Add Variant" icon="pi pi-plus" onClick={addVariant} className="mb-2" />

              {product?.variants.map((variant, index) => (
                <div key={index} className="formgrid grid mb-2">
                  <div className="field col-3">
                    <InputText
                      placeholder="Size"
                      value={variant.size}
                      onChange={(e) => onVariantChange(index, 'size', e.target.value)}
                    />
                  </div>
                  <div className="field col-3">
                    <InputText
                      placeholder="Color"
                      value={variant.color}
                      onChange={(e) => onVariantChange(index, 'color', e.target.value)}
                    />
                  </div>
                  <div className="field col-3">
                    <InputNumber
                      placeholder="Price"
                      value={variant.price}
                      onValueChange={(e) => onVariantChange(index, 'price', e.value)}
                    />
                  </div>
                  <div className="field col-3">
                    <InputNumber
                      placeholder="Stock"
                      value={variant.stock}
                      onValueChange={(e) => onVariantChange(index, 'stock', e.value)}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Image Upload Section */}
            <div className="field">
              <label>Images</label>
              <FileUpload
                name="images[]"
                url="/api/upload"
                multiple
                accept="image/*"
                maxFileSize={2000000}
                onUpload={onImageUpload}
                auto
                emptyTemplate={<p className="m-0">Drag and drop images here to upload.</p>}
              />
            </div>
          </Dialog>

          {/* Delete Dialogs remain similar */}
        </div>
      </div>
    </div>
  );
};

export default ProductCrud;
