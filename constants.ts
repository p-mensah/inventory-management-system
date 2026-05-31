
import { Role, User } from './types';

// This is now only for populating the demo login buttons.
// The actual source of truth is the Supabase 'users'/'profiles' table.
export const USERS: User[] = [
  { id: '1', name: 'Root Admin', role: Role.Admin, username: 'admin', email: 'admin@jubel.com', password: 'Root@root' },
  { id: '2', name: 'Mike Manager', role: Role.Manager, username: 'manager', email: 'manager@example.com', password: 'password' },
  { id: '3', name: 'Sam Staff', role: Role.Staff, username: 'staff', email: 'staff@jubel.com', password: 'password' },
];
