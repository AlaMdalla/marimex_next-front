"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Script from "next/script"
import { Input } from "@/components/ui/input"
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
  const inputRef = useRef<HTMLInputElement | null>(null)
  const markerRef = useRef<any>(null)
  const mapInstRef = useRef<any>(null)
  const [ready, setReady] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [selection, setSelection] = useState<SelectedLocation | null>(null)
  const [reloadId, setReloadId] = useState(0)

  const placeToSelection = useCallback((place: any): SelectedLocation | null => {
    if (!place) return null
    const loc = place.geometry?.location
    if (!loc) return null
    const lat = typeof loc.lat === "function" ? loc.lat() : loc.lat
    const lng = typeof loc.lng === "function" ? loc.lng() : loc.lng
    const address = place.formatted_address || place.name
    return { lat, lng, address }
  }, [])

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

      // Autocomplete search
      if (inputRef.current) {
        const ac = new g.maps.places.Autocomplete(inputRef.current, { fields: ["geometry", "name", "formatted_address"] })
        ac.bindTo("bounds", map)
        ac.addListener("place_changed", () => {
          const place = ac.getPlace()
          const sel = placeToSelection(place)
          if (!sel) return
          map.setCenter({ lat: sel.lat, lng: sel.lng })
          map.setZoom(15)
          setMarker({ lat: sel.lat, lng: sel.lng })
          setSelection(sel)
        })
      }
    } catch (e: any) {
      const msg: string = e?.message || "Failed to initialize Google Maps"
      if (/BillingNotEnabled/i.test(msg)) {
        setErr("Google Maps billing is not enabled for this API key. Enable billing in Google Cloud Console.")
      } else if (/RefererNotAllowed/i.test(msg)) {
        setErr("This API key is restricted. Add your origin (e.g., http://localhost:4200) to HTTP referrers in the key restrictions.")
      } else if (/ApiNotActivated/i.test(msg)) {
        setErr("Maps JavaScript or Places API is not enabled. Enable them in Google Cloud Console.")
      } else {
        setErr(msg)
      }
    }
  }, [ready, apiKey, placeToSelection, setMarker])

  return (
    <div className="w-full">
      <Script
        key={`gmaps-${reloadId}`}
        src={`https://maps.googleapis.com/maps/api/js?key=${apiKey || ""}&libraries=places&v=weekly&channel=nextjs-map-picker-${reloadId}`}
        strategy="afterInteractive"
        onLoad={() => setReady(true)}
        onError={() => setErr("Failed to load Google Maps script. Check API key and HTTP referrer restrictions.")}
      />
      <div className="flex flex-col gap-3">
        <Input ref={inputRef} placeholder="Search for a place" aria-label="Search location" disabled={!!err} />
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
