"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Script from "next/script"
import { Button } from "@/components/ui/button"
import { t, type Locale } from "@/i18n"
import { getClientLocale } from "@/i18n/client"

declare global {
  interface Window {
    google?: any
    gm_authFailure?: () => void
  }
}

export type SelectedLocation = { lat: number; lng: number; address?: string }

export function MapPicker({ onSelect }: { onSelect: (loc: SelectedLocation) => void }) {
  const [locale, setLocale] = useState<Locale>("en")
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
  const [permState, setPermState] = useState<string | null>(null)
  const [geoSupported, setGeoSupported] = useState<boolean>(false)
  const [proto, setProto] = useState<string>("")
  const [origin, setOrigin] = useState<string>("")

  useEffect(() => {
    console.log("DEBUG: Initializing MapPicker...")
    setLocale(getClientLocale())
    if (typeof window !== "undefined") {
      setGeoSupported(!!navigator?.geolocation)
      setProto(window.location.protocol)
      setOrigin(window.location.origin)
      try {
        ;(navigator as any).permissions?.query?.({ name: "geolocation" as any })
          .then((p: any) => {
            console.log("DEBUG: Permission state:", p?.state)
            setPermState(p?.state || null)
          })
          .catch((e: any) => console.warn("DEBUG: Permission query failed:", e))
      } catch (e) {
        console.warn("DEBUG: Permissions API unavailable:", e)
      }
    }
  }, [])

  const setMarker = useCallback((pos: { lat: number; lng: number }) => {
    const g = window.google
    console.log("DEBUG: Setting marker at:", pos)
    if (!g || !mapInstRef.current) return
    if (!markerRef.current) {
      markerRef.current = new g.maps.Marker({ map: mapInstRef.current, position: pos, draggable: true })
      g.maps.event.addListener(markerRef.current, "dragend", () => {
        const p = markerRef.current.getPosition()
        if (!p) return
        const lat = p.lat()
        const lng = p.lng()
        console.log("DEBUG: Marker dragged to:", { lat, lng })
        setSelection({ lat, lng })
      })
    } else {
      markerRef.current.setPosition(pos)
    }
  }, [])

  const centerAndMark = useCallback((pos: { lat: number; lng: number }, address?: string) => {
    console.log("DEBUG: Centering map at:", pos, "with address:", address)
    const g = window.google
    if (!g || !mapInstRef.current) return
    mapInstRef.current.setCenter(pos)
    mapInstRef.current.setZoom(15)
    setMarker(pos)
    setSelection(address ? { ...pos, address } : { ...pos })
  }, [setMarker])

  const useCurrentLocation = useCallback(() => {
    console.log("DEBUG: useCurrentLocation triggered")
    setGeoMsg(null)
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      console.warn("DEBUG: Geolocation not supported")
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
        console.log("DEBUG: Trying high-accuracy geolocation...")
        const pos = await getPos({ enableHighAccuracy: true, timeout: 15000, maximumAge: 0 })
        console.log("DEBUG: High-accuracy position acquired:", pos.coords)
        return pos
      } catch (e: any) {
        console.warn("DEBUG: High-accuracy failed:", e)
        console.log("DEBUG: Trying low-accuracy fallback...")
        const pos2 = await getPos({ enableHighAccuracy: false, timeout: 30000, maximumAge: 300000 })
        console.log("DEBUG: Low-accuracy position acquired:", pos2.coords)
        return pos2
      }
    }

    const fallbackWatch = () => {
      console.log("DEBUG: Using fallback watchPosition...")
      let settled = false
      const id = navigator.geolocation.watchPosition(
        (pos) => {
          if (settled) return
          settled = true
          navigator.geolocation.clearWatch(id)
          const lat = pos.coords.latitude
          const lng = pos.coords.longitude
          console.log("DEBUG: watchPosition got location:", { lat, lng })
          const g = window.google
          if (g?.maps) {
            const geocoder = new g.maps.Geocoder()
            geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
              console.log("DEBUG: Geocoder result:", { results, status })
              const address = status === "OK" && results?.[0]?.formatted_address ? results[0].formatted_address : undefined
              centerAndMark({ lat, lng }, address)
              setGeoLoading(false)
            })
          } else {
            centerAndMark({ lat, lng })
            setGeoLoading(false)
          }
        },
        (err) => {
          console.error("DEBUG: watchPosition error:", err)
        },
        { enableHighAccuracy: false, maximumAge: 600000, timeout: 60000 }
      )
      setTimeout(() => {
        if (!settled) {
          console.warn("DEBUG: watchPosition timeout reached")
          navigator.geolocation.clearWatch(id)
          setGeoLoading(false)
          setGeoMsg("Timed out waiting for location via watchPosition. Try moving near a window or enable GPS.")
        }
      }, 20000)
    }

    run()
      .then((pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        console.log("DEBUG: Final position:", { lat, lng })
        const g = window.google
        if (g?.maps) {
          const geocoder = new g.maps.Geocoder()
          geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
            console.log("DEBUG: Geocoder results:", { results, status })
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
        console.error("DEBUG: Geolocation error details:", error)
        let msg = "Failed to get current location."
        if (error?.code === 1) msg = "Location permission denied."
        else if (error?.code === 2) msg = "Position unavailable."
        else if (error?.code === 3) msg = "Location request timed out."
        if (typeof window !== "undefined" && window.location.protocol !== "https:" && window.location.hostname !== "localhost") {
          msg += " Enable HTTPS to use geolocation."
        }
        try {
          const perm: any = await (navigator as any).permissions?.query?.({ name: "geolocation" as any })
          console.log("DEBUG: Permission status:", perm?.state)
          setPermState(perm?.state || null)
          if (perm && perm.state === "denied") msg = "Location permission denied in browser settings."
        } catch (permErr) {
          console.warn("DEBUG: Could not query permission:", permErr)
        }
        if (error?.code === 2 || error?.code === 3) {
          console.warn("DEBUG: Falling back to watchPosition...")
          setGeoMsg(msg + " Trying continuous location (watchPosition)…")
          fallbackWatch()
          return
        }
        setGeoMsg(msg)
        setGeoLoading(false)
      })
  }, [centerAndMark])

  useEffect(() => {
    ;(window as any).gm_authFailure = () => {
      console.error("DEBUG: Google Maps authentication failed")
      setErr("Google Maps authentication failed. Check API key, billing, and HTTP referrer restrictions.")
    }
  }, [])

  useEffect(() => {
    if (!ready) return
    console.log("DEBUG: Initializing Google Map...")
    if (!apiKey) {
      setErr("Missing NEXT_PUBLIC_GOOGLE_MAPS_API_KEY env var")
      return
    }
    const g = window.google
    if (!g?.maps) {
      setErr("Google Maps failed to load. Check API key, billing, and domain restrictions.")
      return
    }
    if (!mapRef.current) return
    try {
      const center = { lat: 36.8008, lng: 10.1848 } // Tunis default
      const map = new g.maps.Map(mapRef.current, { center, zoom: 12 })
      mapInstRef.current = map
      g.maps.event.addListener(map, "click", (e: any) => {
        const pos = { lat: e.latLng.lat(), lng: e.latLng.lng() }
        console.log("DEBUG: Map clicked at:", pos)
        setMarker(pos)
        setSelection(pos)
      })
    } catch (e: any) {
      console.error("DEBUG: Failed to initialize map:", e)
      const msg: string = e?.message || "Failed to initialize Google Maps"
      if (/BillingNotEnabled/i.test(msg)) {
        setErr("Google Maps billing is not enabled for this API key. Enable billing in Google Cloud Console.")
      } else if (/RefererNotAllowed/i.test(msg)) {
        setErr("This API key is restricted. Add your origin to HTTP referrers in the key restrictions.")
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
        onLoad={() => {
          console.log("DEBUG: Google Maps script loaded")
          setReady(true)
        }}
        onError={() => {
          console.error("DEBUG: Failed to load Google Maps script")
          setErr("Failed to load Google Maps script. Check API key and HTTP referrer restrictions.")
        }}
      />
      <div className="flex flex-col gap-3">
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={useCurrentLocation} disabled={!!err || geoLoading}>
            {geoLoading ? (
              <span className="inline-flex items-center gap-2 text-sm">
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                {t(locale, "cart.address.locating")}
              </span>
            ) : (
              t(locale, "cart.address.useMyLocation")
            )}
          </Button>
        </div>
        {geoMsg ? (
          <div className="text-xs text-muted-foreground flex items-center gap-2">
            <span>{geoMsg}</span>
            <Button variant="ghost" size="sm" onClick={useCurrentLocation} disabled={geoLoading}>
              {t(locale, "common.retry")}
            </Button>
          </div>
        ) : null}
        {(geoMsg || err) ? (
          <details className="text-xs text-muted-foreground">
            <summary className="cursor-pointer">Geolocation diagnostics</summary>
            <ul className="mt-2 list-disc pl-5">
              <li>Geolocation supported: {geoSupported ? "yes" : "no"}</li>
              <li>Permission: {permState || "unknown"}</li>
              <li>Protocol: {proto || "(ssr)"}</li>
              <li>Origin: {origin || "(ssr)"}</li>
            </ul>
          </details>
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
            <Button onClick={() => onSelect(selection)}>{t(locale, "cart.mapModal.useThis")}</Button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
