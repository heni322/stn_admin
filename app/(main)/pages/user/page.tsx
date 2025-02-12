'use client';
import { useUsers } from '@/lib/hooks/useUsers';
import { useUserStore } from '@/lib/store/userStore';
import { User } from '@/types/user';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';
import React, { useRef, useState } from 'react';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { Password } from 'primereact/password';

const Crud = () => {
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);
    const { users, selectedUsers, setSelectedUsers } = useUserStore();
    const { isLoading, createUser, updateUser, deleteUser } = useUsers();

    const [userDialog, setUserDialog] = React.useState(false);
    const [deleteUserDialog, setDeleteUserDialog] = React.useState(false);
    const [deleteUsersDialog, setDeleteUsersDialog] = React.useState(false);
    const [user, setUser] = React.useState<User | null>(null);
    const [password, setPassword] = useState('');
    const [submitted, setSubmitted] = React.useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const roles = [
        { label: 'Client', value: 'Client' },
        { label: 'Provider', value: 'Provider' },
        { label: 'Admin', value: 'Admin' }
    ];

    const openNew = () => {
        setUser(null);
        setPassword('');
        setSubmitted(false);
        setImageFile(null);
        setImagePreview(null);
        setUserDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setUserDialog(false);
    };

    const hideDeleteUserDialog = () => {
        setDeleteUserDialog(false);
    };

    const hideDeleteUsersDialog = () => {
        setDeleteUsersDialog(false);
    };

    const saveUser = async () => {
        setSubmitted(true);

        if (user?.first_name && user?.last_name && user?.email) {
            const formData = new FormData();

            // Append user data
            formData.append('first_name', user.first_name);
            formData.append('last_name', user.last_name);
            formData.append('email', user.email);
            formData.append('role', user.role || '');

            // Append password only for new users
            if (!user.id) {
                formData.append('password', password);
            }

            // Append image if selected
            if (imageFile) {
                formData.append('image', imageFile);
            }

            try {
                if (user.id) {
                    await updateUser({ userId: user.id, formData });
                } else {
                    await createUser(formData);
                }

                setImageFile(null);
                setImagePreview(null);
                setUserDialog(false);
            } catch (error) {
                console.error('Error saving user:', error);
            }
        }
    };

    const editUser = (user: User) => {
        setUser({ ...user });
        setImagePreview(user.image || null);
        setUserDialog(true);
    };

    const onImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);

            // Create preview URL
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
    };

    const confirmDeleteUser = (user: User) => {
        setUser(user);
        setDeleteUserDialog(true);
    };

    const confirmDeleteSelectedUsers = () => {
        setDeleteUsersDialog(true);
    };

    const deleteSelectedUsers = async () => {
        try {
            // Delete selected users from the backend
            await Promise.all(selectedUsers.map((user) => deleteUser(user.id)));

            // Delete selected users from the store
            useUserStore.getState().deleteSelectedUsers();

            setDeleteUsersDialog(false);
        } catch (error) {
            console.error('Error deleting selected users:', error);
        }
    };

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement> | DropdownChangeEvent, field: keyof User) => {
        const val = (e as React.ChangeEvent<HTMLInputElement>).target?.value ?? (e as DropdownChangeEvent).value;
        setUser((prev) => ({ ...prev, [field]: val } as User));
    };

    const leftToolbarTemplate = () => (
        <div className="my-2">
            <Button label="New" icon="pi pi-plus" severity="success" className="mr-2" onClick={openNew} />
            <Button label="Delete" icon="pi pi-trash" severity="danger" onClick={confirmDeleteSelectedUsers} disabled={!selectedUsers.length} />
        </div>
    );

    const actionBodyTemplate = (rowData: User) => (
        <>
            <Button icon="pi pi-pencil" rounded severity="success" className="mr-2" onClick={() => editUser(rowData)} />
            <Button icon="pi pi-trash" rounded severity="warning" onClick={() => confirmDeleteUser(rowData)} />
        </>
    );

    const deleteUserDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" text onClick={hideDeleteUserDialog} />
            <Button label="Yes" icon="pi pi-check" text onClick={() => user && deleteUser(user.id)} />
        </>
    );

    const deleteUsersDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" text onClick={hideDeleteUsersDialog} />
            <Button label="Yes" icon="pi pi-check" text onClick={deleteSelectedUsers} />
        </>
    );

    const userDialogFooter = (
        <>
            <Button label="Cancel" icon="pi pi-times" text onClick={hideDialog} />
            <Button label="Save" icon="pi pi-check" text onClick={saveUser} />
        </>
    );

    return (
        <div className="grid crud-demo">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <Toolbar className="mb-4" left={leftToolbarTemplate} />

                    <DataTable
                        ref={dt}
                        value={users}
                        selection={selectedUsers}
                        onSelectionChange={(e) => setSelectedUsers(e.value)}
                        dataKey="id"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        loading={isLoading}
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} users"
                        emptyMessage="No users found."
                        header="Gérer les utilisiteurs"
                        responsiveLayout="scroll"
                    >
                        <Column selectionMode="multiple" headerStyle={{ width: '4rem' }} />
                        <Column field="first_name" header="First Name" sortable headerStyle={{ minWidth: '15rem' }} />
                        <Column field="last_name" header="Last Name" sortable headerStyle={{ minWidth: '15rem' }} />
                        <Column field="email" header="Email" sortable headerStyle={{ minWidth: '20rem' }} />
                        <Column field="role" header="Role" sortable headerStyle={{ minWidth: '15rem' }} />
                        <Column
                            field="image"
                            header="Image"
                            headerStyle={{ minWidth: '15rem' }}
                            body={(rowData: User | undefined) => (
                                rowData ? (
                                    <img
                                        src={rowData.image || '/demo/images/avatar/profile.jpg'}
                                        alt="Profile"
                                        className="w-3 h-3 rounded-full object-cover"
                                    />
                                ) : (
                                    <img
                                        src="/demo/images/avatar/profile.jpg"
                                        alt="Profile"
                                        className="w-3 h-3 rounded-full object-cover"
                                    />
                                )
                            )}
                        />
                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }} />
                    </DataTable>

                    <Dialog visible={userDialog} style={{ width: '450px' }} header="User Details" modal className="p-fluid" footer={userDialogFooter} onHide={hideDialog}>
                        <div className="grid p-fluid">
                            <div className="col-12">
                                <div className="field">
                                    <label htmlFor="image">Profile Image</label>
                                    <div className="flex flex-column gap-2">
                                    {imagePreview ? (
                                        <div className="relative w-[100px] h-[100px] mb-3">
                                            <img
                                                src={imagePreview}
                                                alt="Profile Preview"
                                                className="w-full h-full object-cover rounded-lg"
                                            />
                                            <Button
                                                icon="pi pi-times"
                                                rounded
                                                severity="danger"
                                                className="absolute top-0 right-0 p-1"
                                                onClick={removeImage}
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-[100px] h-[100px] bg-gray-100 flex items-center justify-center rounded-lg mb-3">
                                            <span className="text-gray-500 text-sm">No Image</span>
                                        </div>
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={onImageSelect}
                                            className="hidden"
                                            id="image-upload"
                                        />
                                        <label htmlFor="image-upload">
                                            <Button
                                                type="button"
                                                icon="pi pi-upload"
                                                label={imagePreview ? 'Change Image' : 'Upload Image'}
                                                className="w-fit"
                                                onClick={() => document.getElementById('image-upload')?.click()}
                                            />
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div className="col-6">
                                <div className="field">
                                    <label htmlFor="first_name">First Name</label>
                                    <InputText id="first_name" value={user?.first_name || ''} onChange={(e) => onInputChange(e, 'first_name')} required className={classNames({ 'p-invalid': submitted && !user?.first_name })} />
                                    {submitted && !user?.first_name && <small className="p-invalid">First Name is required.</small>}
                                </div>
                            </div>
                            <div className="col-6">
                                <div className="field">
                                    <label htmlFor="last_name">Last Name</label>
                                    <InputText id="last_name" value={user?.last_name || ''} onChange={(e) => onInputChange(e, 'last_name')} required className={classNames({ 'p-invalid': submitted && !user?.last_name })} />
                                    {submitted && !user?.last_name && <small className="p-invalid">Last Name is required.</small>}
                                </div>
                            </div>
                            <div className="col-12">
                                <div className="field">
                                    <label htmlFor="email">Email</label>
                                    <InputText id="email" value={user?.email || ''} onChange={(e) => onInputChange(e, 'email')} required className={classNames({ 'p-invalid': submitted && !user?.email })} />
                                    {submitted && !user?.email && <small className="p-invalid">Email is required.</small>}
                                </div>
                            </div>
                            <div className="col-6">
                                <div className="field">
                                    <label htmlFor="role">Role</label>
                                    <Dropdown
                                        id="role"
                                        value={user?.role || ''}
                                        options={roles}
                                        onChange={(e) => onInputChange(e, 'role')}
                                        placeholder="Select a Role"
                                        className={classNames({ 'p-invalid': submitted && !user?.role })}
                                    />
                                    {submitted && !user?.role && <small className="p-invalid">Role is required.</small>}
                                </div>
                            </div>
                            <div className="col-6">
                                <div className="field">
                                    <label htmlFor="password">Password</label>
                                    <Password
                                        id="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        feedback={false}
                                        toggleMask
                                        className={classNames({ 'p-invalid': submitted && !password })}
                                    />
                                    {submitted && !password && <small className="p-invalid">Password is required.</small>}
                                </div>
                            </div>
                        </div>
                    </Dialog>

                    <Dialog visible={deleteUserDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteUserDialogFooter} onHide={hideDeleteUserDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {user && <span>Are you sure you want to delete <b>{user.first_name} {user.last_name}</b>?</span>}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteUsersDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteUsersDialogFooter} onHide={hideDeleteUsersDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            <span>Are you sure you want to delete the selected users?</span>
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default Crud;
