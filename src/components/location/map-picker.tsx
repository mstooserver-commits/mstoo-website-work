"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import type { LatLngExpression } from "leaflet";

const Map = dynamic(() => import("./leaflet-map"), { ssr: false });

type Props = {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
};

export function MapPicker({ lat, lng, onChange }: Props) {
  const center = useMemo<LatLngExpression>(() => [lat, lng], [lat, lng]);
  return (
    <div className="h-64 overflow-hidden rounded-md border border-line">
      <Map center={center} onChange={onChange} />
    </div>
  );
}
