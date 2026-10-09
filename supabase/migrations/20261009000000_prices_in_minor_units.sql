-- Prices move to the currency's MINOR unit (cents for CAD).
--
-- The price column is an integer, so a decimal price was rejected by Postgres
-- with an error the admin could not act on. Holding cents is what lets 49,99
-- exist at all.
--
-- NOT idempotent: running it twice multiplies prices again. It was applied
-- once, on 2026-10-09, against 3 products priced in whole dollars and 0 orders.

update public.products set price = price * 100;

update public.orders
set total = total * 100,
    items = (
      select jsonb_agg(jsonb_set(e, '{price}', to_jsonb(((e->>'price')::numeric * 100)::int)))
      from jsonb_array_elements(items) e
    )
where jsonb_array_length(items) > 0;
