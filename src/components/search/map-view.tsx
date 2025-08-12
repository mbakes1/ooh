"use client";

import { useState, useRef } from "react";
import { MapPin, Navigation, ZoomIn, ZoomOut, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BillboardWithDetails } from "@/types";
import Link from "next/link";
import Image from "next/image";

interface MapViewProps {
  billboards: BillboardWithDetails[];
  onBillboardSelect?: (billboard: BillboardWithDetails) => void;
  selectedBillboard?: BillboardWithDetails | null;
  className?: string;
}

// Mock map component since we don&apos;t have a real map library integrated
// In a real implementation, you would use Google Maps, Mapbox, or Leaflet
export function MapView({
  billboards,
  onBillboardSelect,
  selectedBillboard,
  className = "",
}: MapViewProps) {
  const [, setMapCenter] = useState({ lat: -26.2041, lng: 28.0473 }); // Johannesburg
  const [zoomLevel, setZoomLevel] = useState(10);
  const [mapType, setMapType] = useState<"roadmap" | "satellite">("roadmap");
  const mapRef = useRef<HTMLDivElement>(null);

  // Group billboards by proximity for clustering
  const clusterBillboards = (billboards: BillboardWithDetails[]) => {
    const clusters: { [key: string]: BillboardWithDetails[] } = {};

    billboards.forEach((billboard) => {
      if (billboard.latitude && billboard.longitude) {
        // Simple clustering by rounding coordinates
        const clusterKey = `${Math.round(Number(billboard.latitude) * 100)}-${Math.round(Number(billboard.longitude) * 100)}`;
        if (!clusters[clusterKey]) {
          clusters[clusterKey] = [];
        }
        clusters[clusterKey].push(billboard);
      }
    });

    return Object.values(clusters);
  };

  const clusters = clusterBillboards(billboards);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 1, 18));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 1, 1));
  };

  const handleCenterOnUser = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMapCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setZoomLevel(12);
        },
        (error) => {
          console.error("Error getting user location:", error);
        }
      );
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Map Container */}
      <div
        ref={mapRef}
        className="w-full h-[600px] bg-gray-100 rounded-lg relative overflow-hidden"
        style={{
          backgroundImage:
            mapType === "satellite"
              ? 'url(\'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="satellite" patternUnits="userSpaceOnUse" width="20" height="20"><rect width="20" height="20" fill="%23e5e7eb"/><circle cx="10" cy="10" r="2" fill="%23d1d5db"/></pattern></defs><rect width="100" height="100" fill="url(%23satellite)"/></svg>\')'
              : 'url(\'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" patternUnits="userSpaceOnUse" width="10" height="10"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="%23e5e7eb" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="%23f9fafb"/><rect width="100" height="100" fill="url(%23grid)"/></svg>\')',
        }}
      >
        {/* Map Controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomIn}
            className="bg-white shadow-md"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomOut}
            className="bg-white shadow-md"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCenterOnUser}
            className="bg-white shadow-md"
          >
            <Navigation className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setMapType(mapType === "roadmap" ? "satellite" : "roadmap")
            }
            className="bg-white shadow-md"
          >
            <Layers className="h-4 w-4" />
          </Button>
        </div>

        {/* Billboard Markers */}
        {clusters.map((cluster, clusterIndex) => {
          const representative = cluster[0];
          if (!representative.latitude || !representative.longitude)
            return null;

          // Calculate position on the mock map (this would be handled by the map library in real implementation)
          const x = ((Number(representative.longitude) + 180) / 360) * 100;
          const y = ((90 - Number(representative.latitude)) / 180) * 100;

          return (
            <div
              key={clusterIndex}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20"
              style={{
                left: `${x}%`,
                top: `${y}%`,
              }}
              onClick={() => onBillboardSelect?.(representative)}
            >
              {cluster.length > 1 ? (
                // Cluster marker
                <div className="relative">
                  <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-lg border-2 border-white">
                    {cluster.length}
                  </div>
                </div>
              ) : (
                // Single billboard marker
                <div
                  className={`relative ${selectedBillboard?.id === representative.id ? "scale-110" : ""} transition-transform`}
                >
                  <div className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-lg border-2 border-white">
                    <MapPin className="h-3 w-3" />
                  </div>
                  {selectedBillboard?.id === representative.id && (
                    <div className="absolute -top-2 -left-2 w-10 h-10 border-2 border-primary rounded-full animate-ping"></div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Map Info */}
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-2 text-xs text-muted-foreground">
          Zoom: {zoomLevel} | {billboards.length} billboard
          {billboards.length !== 1 ? "s" : ""} shown
        </div>
      </div>

      {/* Selected Billboard Info */}
      {selectedBillboard && (
        <Card className="absolute bottom-4 right-4 w-80 z-30 shadow-lg">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <div className="relative w-20 h-16 flex-shrink-0">
                {selectedBillboard.images[0] ? (
                  <Image
                    src={selectedBillboard.images[0].imageUrl}
                    alt={selectedBillboard.title}
                    fill
                    className="object-cover rounded"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
                    <MapPin className="h-4 w-4 text-gray-400" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <Link href={`/billboards/${selectedBillboard.id}`}>
                  <h4 className="font-semibold text-sm hover:text-primary transition-colors truncate">
                    {selectedBillboard.title}
                  </h4>
                </Link>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                  <MapPin className="h-3 w-3" />
                  {selectedBillboard.city}, {selectedBillboard.province}
                </p>

                <div className="flex items-center justify-between">
                  <div className="text-sm font-bold text-primary">
                    {formatPrice(Number(selectedBillboard.basePrice))}
                    <span className="text-xs font-normal text-muted-foreground">
                      /day
                    </span>
                  </div>

                  <div className="flex gap-1">
                    <Badge variant="secondary" className="text-xs">
                      {selectedBillboard.width}×{selectedBillboard.height}m
                    </Badge>
                    {selectedBillboard.trafficLevel && (
                      <Badge variant="outline" className="text-xs">
                        {selectedBillboard.trafficLevel}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Location Data Message */}
      {billboards.length > 0 && clusters.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm">
          <div className="text-center">
            <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">No Location Data</h3>
            <p className="text-muted-foreground">
              The billboards in your search results don&apos;t have location
              coordinates for map display.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
