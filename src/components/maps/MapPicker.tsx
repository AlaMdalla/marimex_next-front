"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Script from "next/script"
import { Button } from "@/components/ui/button"

declare global {
  interface Window {
    google?: any
  }
}

export type SelectedLocation = { lat: number; lng: number; address?: string }

export function MapPicker({ onSelect }: { onSelect: (loc: SelectedLocation) => void }) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  const mapRef = useRef<HTMLDivElement | null>(null)
  const markerRef = useRef<any>(null)
  const mapInstRef = useRef<any>(null)
  const [ready, setReady] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [selection, setSelection] = useState<SelectedLocation | null>(null)
  const [reloadId, setReloadId] = useState(0)
  const [geoLoading, setGeoLoading] = useState(false)
  const [geoMsg, setGeoMsg] = useState<string | null>(null)

  const setMarker = useCallback((pos: { lat: number; lng: number }) => {
    const g = window.google
    if (!g || !mapInstRef.current) return
    if (!markerRef.current) {
      markerRef.current = new g.maps.Marker({ map: mapInstRef.current, position: pos, draggable: true })
      g.maps.event.addListener(markerRef.current, "dragend", () => {
        const p = markerRef.current.getPosition()
        if (!p) return
        const lat = p.lat()
        const lng = p.lng()
        setSelection({ lat, lng })
      })
    } else {
      markerRef.current.setPosition(pos)
    }
  }, [])

  const centerAndMark = useCallback((pos: { lat: number; lng: number }, address?: string) => {
    const g = window.google
    if (!g || !mapInstRef.current) return
    mapInstRef.current.setCenter(pos)
    mapInstRef.current.setZoom(15)
    setMarker(pos)
    setSelection(address ? { ...pos, address } : { ...pos })
  }, [setMarker])

  const useCurrentLocation = useCallback(() => {
    setGeoMsg(null)
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGeoMsg("Geolocation is not supported in this browser.")
      return
    }
    setGeoLoading(true)
    const getPos = (opts: PositionOptions) =>
      new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, opts)
      )

    const run = async () => {
      try {
        // Try high accuracy first (GPS on mobile)
        const pos = await getPos({ enableHighAccuracy: true, timeout: 10000, maximumAge: 0 })
        return pos
      } catch (e: any) {
        // Fallback: low accuracy, longer timeout, allow cached
        try {
          const pos2 = await getPos({ enableHighAccuracy: false, timeout: 20000, maximumAge: 300000 })
          return pos2
        } catch (e2) {
          throw e2
        }
      }
    }

    run()
      .then((pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        const g = window.google
        if (g?.maps) {
          const geocoder = new g.maps.Geocoder()
          geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
            const address = status === "OK" && results?.[0]?.formatted_address ? results[0].formatted_address : undefined
            centerAndMark({ lat, lng }, address)
            setGeoLoading(false)
          })
        } else {
          centerAndMark({ lat, lng })
          setGeoLoading(false)
        }
      })
      .catch(async (error: any) => {
        let msg = "Failed to get current location."
        if (error?.code === 1) msg = "Location permission denied."
        else if (error?.code === 2) msg = "Position unavailable."
        else if (error?.code === 3) msg = "Location request timed out."
        if (typeof window !== "undefined" && window.location.protocol !== "https:" && window.location.hostname !== "localhost") {
          msg += " Enable HTTPS to use geolocation."
        }
        // Permissions API hint
        try {
          const perm: any = await (navigator as any).permissions?.query?.({ name: "geolocation" as any })
          if (perm && perm.state === "denied") msg = "Location permission denied in browser settings."
        } catch {}
        setGeoMsg(msg)
        setGeoLoading(false)
      })
  }, [centerAndMark])

  // Capture auth failures emitted by the Maps script
  useEffect(() => {
    ;(window as any).gm_authFailure = () => {
      setErr("Google Maps authentication failed. Check API key, billing, and HTTP referrer restrictions.")
    }
  }, [])

  useEffect(() => {
    if (!ready) return
    if (!apiKey) {
      setErr("Missing NEXT_PUBLIC_GOOGLE_MAPS_API_KEY env var")
      return
    }
    const g = window.google
    if (!g?.maps) {
      setErr(
        "Google Maps failed to load. Check API key, billing, and domain restrictions."
      )
      return
    }
    if (!mapRef.current) return
    try {
      const center = { lat: 36.8008, lng: 10.1848 } // Tunis default
      const map = new g.maps.Map(mapRef.current, { center, zoom: 12 })
      mapInstRef.current = map

      // Click to place marker
      g.maps.event.addListener(map, "click", (e: any) => {
        const pos = { lat: e.latLng.lat(), lng: e.latLng.lng() }
        setMarker(pos)
        setSelection(pos)
      })
    } catch (e: any) {
      const msg: string = e?.message || "Failed to initialize Google Maps"
      if (/BillingNotEnabled/i.test(msg)) {
        setErr("Google Maps billing is not enabled for this API key. Enable billing in Google Cloud Console.")
      } else if (/RefererNotAllowed/i.test(msg)) {
        setErr("This API key is restricted. Add your origin (e.g., http://localhost:4200) to HTTP referrers in the key restrictions.")
      } else if (/ApiNotActivated/i.test(msg)) {
        setErr("Maps JavaScript API is not enabled. Enable it in Google Cloud Console.")
      } else {
        setErr(msg)
      }
    }
  }, [ready, apiKey, setMarker])

  return (
    <div className="w-full">
      <Script
        key={`gmaps-${reloadId}`}
        src={`https://maps.googleapis.com/maps/api/js?key=${apiKey || ""}&v=weekly&channel=nextjs-map-picker-${reloadId}`}
        strategy="afterInteractive"
        onLoad={() => setReady(true)}
        onError={() => setErr("Failed to load Google Maps script. Check API key and HTTP referrer restrictions.")}
      />
      <div className="flex flex-col gap-3">
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={useCurrentLocation} disabled={!!err || geoLoading}>
            {geoLoading ? (
              <span className="inline-flex items-center gap-2 text-sm">
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Locating…
              </span>
            ) : (
              "Use my location"
            )}
          </Button>
        </div>
        {geoMsg ? (
          <div className="text-xs text-muted-foreground flex items-center gap-2">
            <span>{geoMsg}</span>
            <Button variant="ghost" size="sm" onClick={useCurrentLocation} disabled={geoLoading}>Retry</Button>
          </div>
        ) : null}
        <div ref={mapRef} className="h-80 w-full rounded-md border flex items-center justify-center">
          {!ready && !err ? (
            <span className="text-sm text-muted-foreground">Loading map…</span>
          ) : null}
          {err ? (
            <div className="p-4 text-sm">
              <p className="text-red-600 mb-2" role="alert">{err}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => { setErr(null); setReady(false); setReloadId((n) => n + 1) }}>Retry</Button>
                <a className="text-blue-600 underline" href="https://developers.google.com/maps/documentation/javascript/error-messages" target="_blank" rel="noreferrer">Error docs</a>
              </div>
              <details className="mt-3">
                <summary className="cursor-pointer">Diagnostics</summary>
                <ul className="mt-2 list-disc pl-5 text-muted-foreground">
                  <li>API key present: {apiKey ? "yes" : "no"}</li>
                  <li>Origin: {typeof window !== "undefined" ? window.location.origin : "(ssr)"}</li>
                  <li>Ensure billing is enabled for your Google Cloud project.</li>
                  <li>Enable Maps JavaScript API and Places API.</li>
                  <li>If key has HTTP referrer restrictions, add this origin.</li>
                </ul>
              </details>
            </div>
          ) : null}
        </div>
        {selection && !err ? (
          <div className="flex items-center justify-between text-sm">
            <div>
              <div className="font-medium">{selection.address || `${selection.lat.toFixed(4)}, ${selection.lng.toFixed(4)}`}</div>
              <div className="text-muted-foreground">{selection.lat.toFixed(6)}, {selection.lng.toFixed(6)}</div>
            </div>
            <Button onClick={() => onSelect(selection)}>Use this location</Button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
