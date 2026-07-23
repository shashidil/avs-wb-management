-- Payment status tracking for agreements and licences.
create type payment_status as enum ('pending', 'paid');

alter table agreements add column payment_status payment_status not null default 'pending';
alter table licences add column payment_status payment_status not null default 'pending';
