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

    const roles = [
        { label: 'Client', value: 'Client' },
        { label: 'Provider', value: 'Provider' },
        { label: 'Admin', value: 'Admin' }
    ];

    const openNew = () => {
        setUser(null);
        setSubmitted(false);
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

    const saveUser = () => {
        setSubmitted(true);

        if (user?.first_name && user?.last_name && user?.email) {
            let formData = { ...user };

            if (!user.id) {
                formData = { ...user, password }; // Only include password when creating a new user
            }
            if (user.id) {
                updateUser(user);
            } else {
                createUser(user);
            }
            setUserDialog(false);
        }
    };

    const editUser = (user: User) => {
        setUser({ ...user });
        setUserDialog(true);
    };

    const confirmDeleteUser = (user: User) => {
        setUser(user);
        setDeleteUserDialog(true);
    };

    const confirmDeleteSelectedUsers = () => {
        setDeleteUsersDialog(true);
    };

    const deleteSelectedUsers = () => {
        selectedUsers.forEach((user) => deleteUser(user.id));
        setDeleteUsersDialog(false);
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

    // Define the footer for the "Delete User" dialog
    const deleteUserDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" text onClick={hideDeleteUserDialog} />
            <Button
                label="Yes"
                icon="pi pi-check"
                text
                onClick={() => user && deleteUser(user.id)}
            />
        </>
    );


    // Define the footer for the "Delete Selected Users" dialog
    const deleteUsersDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" text onClick={hideDeleteUsersDialog} />
            <Button label="Yes" icon="pi pi-check" text onClick={deleteSelectedUsers} />
        </>
    );

    // Define the footer for the "User Details" dialog
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
                        <Column field="first_name" header="First Name" sortable />
                        <Column field="last_name" header="Last Name" sortable />
                        <Column field="email" header="Email" sortable />
                        <Column field="role" header="Role" sortable />
                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }} />
                    </DataTable>

                    <Dialog visible={userDialog} style={{ width: '450px' }} header="User Details" modal className="p-fluid" footer={userDialogFooter} onHide={hideDialog}>
                        <div className="field">
                            <label htmlFor="first_name">First Name</label>
                            <InputText id="first_name" value={user?.first_name || ''} onChange={(e) => onInputChange(e, 'first_name')} required className={classNames({ 'p-invalid': submitted && !user?.first_name })} />
                            {submitted && !user?.first_name && <small className="p-invalid">First Name is required.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="last_name">Last Name</label>
                            <InputText id="last_name" value={user?.last_name || ''} onChange={(e) => onInputChange(e, 'last_name')} required className={classNames({ 'p-invalid': submitted && !user?.last_name })} />
                            {submitted && !user?.last_name && <small className="p-invalid">Last Name is required.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="email">Email</label>
                            <InputText id="email" value={user?.email || ''} onChange={(e) => onInputChange(e, 'email')} required className={classNames({ 'p-invalid': submitted && !user?.email })} />
                            {submitted && !user?.email && <small className="p-invalid">Email is required.</small>}
                        </div>
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
                        <Password
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            feedback={false} // Optional: Hide password strength meter
                            toggleMask // Optional: Show/Hide password toggle
                            className={classNames({ 'p-invalid': submitted && !password })}
                        />
                        {submitted && !password && <small className="p-invalid">Password is required.</small>}

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
