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
import { classNames } from 'primereact/utils';
import { useProductStore } from '@/lib/store/productStore';
import { Product, useCreateProduct, useDeleteProduct, useProducts, useUpdateProduct } from '@/lib/hooks/useProduct';
import { useCategories } from '@/lib/hooks/useCategory';
import { useSites } from '@/lib/hooks/useSite';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
interface ProductVariant {
    id: number;
    name: string;
    price: number;
    stock: number;
    size: string;
    color: string;
  }
const ProductCrud = () => {
  const toast = useRef<Toast>(null);
  const [tableFilters, setTableFilters] = useState<DataTableFilterMeta>({});
  const [submitted, setSubmitted] = useState(false);
  const { data: categories } = useCategories();
  const { data: sites } = useSites();

  // Add new handlers for dropdown changes
  const onCategoryChange = (e: DropdownChangeEvent) => {
    setProduct(product ? { ...product, category_id: e.value } : null);
  };

  const onSiteChange = (e: DropdownChangeEvent) => {
    setProduct(product ? { ...product, site_id: e.value } : null);
  };
  // Query hooks
  const { data: products, isLoading } = useProducts();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  // Store
  const {
    productDialog,
    deleteProductDialog,
    deleteProductsDialog,
    selectedProducts,
    product,
    setProductDialog,
    setDeleteProductDialog,
    setDeleteProductsDialog,
    setSelectedProducts,
    setProduct
  } = useProductStore();

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
      try {
        if (product.id) {
          await updateProduct.mutateAsync(product);
          toast.current?.show({
            severity: 'success',
            summary: 'Success',
            detail: 'Product updated successfully',
            life: 3000
          });
        } else {
          await createProduct.mutateAsync(product);
          toast.current?.show({
            severity: 'success',
            summary: 'Success',
            detail: 'Product created successfully',
            life: 3000
          });
        }
        hideDialog();
      } catch (error) {
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to save product',
          life: 3000
        });
      }
    }
  };

  const confirmDeleteProduct = async () => {
    try {
      if (product?.id) {
        await deleteProduct.mutateAsync(product.id);
        toast.current?.show({
          severity: 'success',
          summary: 'Success',
          detail: 'Product deleted successfully',
          life: 3000
        });
      }
      setDeleteProductDialog(false);
      setProduct(null);
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to delete product',
        life: 3000
      });
    }
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
      <Button label="Yes" icon="pi pi-check" severity="danger" onClick={confirmDeleteProduct} />
    </>
  );

  const deleteProductsDialogFooter = (
    <>
      <Button label="No" icon="pi pi-times" severity="secondary" onClick={() => setDeleteProductsDialog(false)} />
      <Button
        label="Yes"
        icon="pi pi-check"
        severity="danger"
        onClick={async () => {
          try {
            await Promise.all(selectedProducts.map((p: { id: string }) => deleteProduct.mutateAsync(p.id)));
            setDeleteProductsDialog(false);
            setSelectedProducts([]);
            toast.current?.show({
              severity: 'success',
              summary: 'Success',
              detail: 'Products deleted successfully',
              life: 3000
            });
          } catch (error) {
            toast.current?.show({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to delete products',
              life: 3000
            });
          }
        }}
      />
    </>
  );

  return (
    <div className="grid crud-demo">
      <div className="col-12">
        <div className="card">
          <Toast ref={toast} />
          <Toolbar className="mb-4" left={leftToolbarTemplate} />

          <DataTable
            value={products}
            selection={selectedProducts}
            onSelectionChange={onSelectionChange}
            selectionMode="multiple"
            dataKey="id"
            loading={isLoading}
            filters={tableFilters}
            onFilter={(e) => setTableFilters(e.filters)}
          >
            <Column selectionMode="multiple" headerStyle={{ width: '4rem' }} />
            <Column field="name" header="Name" sortable filter />
            <Column field="price" header="Price" sortable />
            <Column
              field="category_id"
              header="Category"
              sortable
              filter
              body={(rowData) => {
                const category = categories?.find(c => c.id === rowData.category_id.id);
                console.log(rowData.category_id.id)
                return category?.name || rowData.category_id.id;
              }}
            />
            <Column
              field="site_id"
              header="Site"
              sortable
              filter
              body={(rowData) => {
                const site = sites?.find(s => s.id === rowData.site_id.id);
                return site?.name || rowData.site_id.id;
              }}
            />
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
              <div className="field col-6">
                <label htmlFor="category">Category</label>
                <Dropdown
                  id="category"
                  value={product?.category_id}
                  options={categories}
                  optionLabel="name"
                  optionValue="id"
                  onChange={onCategoryChange}
                  placeholder="Select a Category"
                  className={classNames({ 'p-invalid': submitted && !product?.category_id })}
                />
                {submitted && !product?.category_id && <small className="p-error">Category is required.</small>}
              </div>

              <div className="field col-6">
                <label htmlFor="site">Site</label>
                <Dropdown
                  id="site"
                  value={product?.site_id}
                  options={sites}
                  optionLabel="name"
                  optionValue="id"
                  onChange={onSiteChange}
                  placeholder="Select a Site"
                  className={classNames({ 'p-invalid': submitted && !product?.site_id })}
                />
                {submitted && !product?.site_id && <small className="p-error">Site is required.</small>}
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

            <div className="field">
              <label>Variants</label>
              <Button label="Add Variant" icon="pi pi-plus" onClick={addVariant} className="mb-2" />

              {product?.variants.map((variant:any, index:any) => (
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

          <Dialog
            visible={deleteProductDialog}
            style={{ width: '450px' }}
            header="Confirm"
            modal
            footer={deleteProductDialogFooter}
            onHide={() => setDeleteProductDialog(false)}
          >
            <div className="confirmation-content">
              <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
              <span>Are you sure you want to delete this product?</span>
            </div>
          </Dialog>

          <Dialog
            visible={deleteProductsDialog}
            style={{ width: '450px' }}
            header="Confirm"
            modal
            footer={deleteProductsDialogFooter}
            onHide={() => setDeleteProductsDialog(false)}
          >
            <div className="confirmation-content">
              <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
              <span>Are you sure you want to delete the selected products?</span>
            </div>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default ProductCrud;
