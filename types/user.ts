export interface User {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    image: string | null;
    created_at: string; // Add this property
    updated_at: string; // Add this property
}
