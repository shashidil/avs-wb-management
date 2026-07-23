-- Seed: one admin user.
-- Prerequisite: create the auth user first in the Supabase dashboard
-- (Authentication -> Users -> Add user), then copy their UID below.

insert into app_users (id, email, full_name, role)
values (
  '20cfcca0-4885-4b67-a8a5-02d1309331fc', -- replace with the real auth.users.id (UID)
  'mediconnectbit@gmail.com',                     -- replace with the real email
  'Admin',
  'admin'
);

Password for the above user: `Admin@123` (you can change it in the Supabase dashboard if you want). 