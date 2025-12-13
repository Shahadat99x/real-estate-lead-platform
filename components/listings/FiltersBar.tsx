'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '../ui/button';

type Props = {
  propertyTypes: string[];
};

export function FiltersBar({ propertyTypes }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [purpose, setPurpose] = useState(searchParams.get('purpose') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [beds, setBeds] = useState(searchParams.get('beds') || '');
  const [baths, setBaths] = useState(searchParams.get('baths') || '');
  const [propertyType, setPropertyType] = useState(searchParams.get('property_type') || '');

  useEffect(() => {
    setCity(searchParams.get('city') || '');
  }, [searchParams]);

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (city) params.set('city', city);
    if (purpose) params.set('purpose', purpose);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (beds) params.set('beds', beds);
    if (baths) params.set('baths', baths);
    if (propertyType) params.set('property_type', propertyType);
    router.push(`/listings?${params.toString()}`);
  };

  const clearFilters = () => {
    setCity('');
    setPurpose('');
    setMinPrice('');
    setMaxPrice('');
    setBeds('');
    setBaths('');
    setPropertyType('');
    router.push('/listings');
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <input
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
        placeholder="City"
        value={city}
        onChange={(e) => setCity(e.target.value)}
      />
      <select
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
        value={purpose}
        onChange={(e) => setPurpose(e.target.value)}
      >
        <option value="">Any purpose</option>
        <option value="BUY">Buy</option>
        <option value="RENT">Rent</option>
      </select>
      <div className="flex gap-2">
        <input
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
          placeholder="Min €"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
        />
        <input
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
          placeholder="Max €"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <input
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
          placeholder="Beds"
          value={beds}
          onChange={(e) => setBeds(e.target.value)}
        />
        <input
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
          placeholder="Baths"
          value={baths}
          onChange={(e) => setBaths(e.target.value)}
        />
      </div>
      <select
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
        value={propertyType}
        onChange={(e) => setPropertyType(e.target.value)}
      >
        <option value="">Any type</option>
        {propertyTypes.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </select>
      <div className="flex gap-2 sm:col-span-2 md:col-span-4">
        <Button type="button" onClick={applyFilters} className="w-full sm:w-auto">
          Apply filters
        </Button>
        <Button type="button" variant="ghost" onClick={clearFilters} className="w-full sm:w-auto">
          Clear
        </Button>
      </div>
    </div>
  );
}
