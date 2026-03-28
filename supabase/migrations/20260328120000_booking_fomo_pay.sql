-- FOMO Pay: store gateway order id and payment lifecycle on bookings.
alter table public.bookings
  add column if not exists fomo_order_id text,
  add column if not exists payment_status text default 'unpaid';

comment on column public.bookings.fomo_order_id is 'FOMO Pay order id (from create order response)';
comment on column public.bookings.payment_status is 'unpaid | pending | paid | failed';
