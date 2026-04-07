-- Invoice number sequence: ATT-0001, ATT-0002, ...
CREATE SEQUENCE IF NOT EXISTS public.invoice_number_seq START WITH 1 INCREMENT BY 1;

CREATE TABLE IF NOT EXISTS public.invoices (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number    text        UNIQUE NOT NULL
                                DEFAULT ('ATT-' || lpad(nextval('invoice_number_seq')::text, 4, '0')),
  booking_id        uuid        NOT NULL REFERENCES public.bookings(id),
  customer_name     text        NOT NULL,
  customer_email    text        NOT NULL,
  customer_phone    text,
  tour_name         text        NOT NULL,
  tour_date         date,
  num_pax           integer     NOT NULL,
  unit_price        numeric(10,2) NOT NULL,
  total_price       numeric(10,2) NOT NULL,
  payment_status    text        NOT NULL DEFAULT 'pending',
  payment_method    text,
  transaction_ref   text,
  email_sent        boolean     NOT NULL DEFAULT false,
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS invoices_booking_id_idx ON public.invoices (booking_id);
CREATE INDEX IF NOT EXISTS invoices_created_at_idx ON public.invoices (created_at DESC);
