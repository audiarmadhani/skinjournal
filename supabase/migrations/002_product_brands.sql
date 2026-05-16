-- Skincare products: step type in `name`, brand in `brand`
alter table public.products
  alter column brand set default '';

update public.products set brand = '' where brand is null;

comment on column public.products.name is 'Skincare step type (e.g. Cleanser, Serum, Sunscreen)';
comment on column public.products.brand is 'Brand the user uses for this step';
