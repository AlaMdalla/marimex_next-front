"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, ShoppingCart, Minus, Plus, X, MapPin, Phone, User, Check, Truck, Shield, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { formatPrice } from "@/lib/utils"
import { submitOrder as submitOrderApi } from "@/services/marbles"
import { getClientLocale } from "@/i18n/client"
import { t, type Locale } from "@/i18n"
import { MapPicker } from "@/components/maps/MapPicker"
import { useCart } from "@/contexts/cart-context"

// Using shared cart context (Angular-compatible localStorage shape)

interface Location {
  lat: number
  lng: number
  address?: string
}

export default function CartPage() {
  const [locale, setLocale] = React.useState<Locale>("en")
  React.useEffect(() => {
    setLocale(getClientLocale())
  }, [])
  const { items: cartItems, totalPrice, totalCount, updateQuantity, removeItem: removeFromCart, clear } = useCart()
  const [phoneNumber, setPhoneNumber] = React.useState("")
  const [orderName, setOrderName] = React.useState("")
  const [location, setLocation] = React.useState<Location | null>(null)
  const [showMapModal, setShowMapModal] = React.useState(false)
  const [showConfirmationModal, setShowConfirmationModal] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [geoLoading, setGeoLoading] = React.useState(false)
  const [geoMsg, setGeoMsg] = React.useState<string | null>(null)

  const calculateSubtotal = () => {
    return totalPrice
  }

  const increaseQuantity = (item: { marble: { id: string | number }, count: number }) => {
    updateQuantity(item.marble.id, item.count + 1)
  }

  const decreaseQuantity = (item: { marble: { id: string | number }, count: number }) => {
    if (item.count > 1) updateQuantity(item.marble.id, item.count - 1)
  }

  const removeItem = (item: { marble: { id: string | number } }) => {
    removeFromCart(item.marble.id)
  }

  const handleLocationSelect = (selectedLocation: Location) => {
    setLocation(selectedLocation)
    setShowMapModal(false)
  }

  const useCurrentLocation = React.useCallback(() => {
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
        const pos = await getPos({ enableHighAccuracy: true, timeout: 10000, maximumAge: 0 })
        return pos
      } catch (e) {
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
        setLocation({ lat, lng })
        setGeoLoading(false)
      })
      .catch(async (error: any) => {
        let msg = "Failed to get current location."
        if (error?.code === 1) msg = "Location permission denied."
        else if (error?.code === 2) msg = "Position unavailable."
        else if (error?.code === 3) msg = "Location request timed out."
        if (typeof window !== "undefined" && window.location.protocol !== "https:" && window.location.hostname !== "localhost") {
          msg += " Enable HTTPS to use geolocation."
        }
        try {
          const perm: any = await (navigator as any).permissions?.query?.({ name: "geolocation" as any })
          if (perm && perm.state === "denied") msg = "Location permission denied in browser settings."
        } catch {}
        setGeoMsg(msg)
        setGeoLoading(false)
      })
  }, [])

  const confirmOrder = () => {
    if (!phoneNumber.trim() || !orderName.trim()) {
      alert(t(locale, "cart.alerts.required"))
      return
    }
    setShowConfirmationModal(true)
  }

  const submitOrder = async () => {
    try {
      setIsSubmitting(true)
      // Build payload similar to Angular service expectations
      const payload = {
        list_marbles: cartItems.map((item) => ({ marble: item.marble.id, count: item.count })),
        number_of_phone: phoneNumber,
        totalPrice: calculateSubtotal(),
        location: location ? { lat: location.lat, lng: location.lng, address: location.address } : null,
        order_name: orderName,
      }

      const res = await submitOrderApi(payload)
      // Basic success check; backend typically returns success/message
      if (res?.success === false) {
        throw new Error(res?.message || "Order failed")
      }

      clear()
      setShowConfirmationModal(false)
      alert(t(locale, "cart.alerts.confirmed"))
    } catch (err: any) {
      const msg = err?.message || "Failed to submit order"
      alert(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-md mx-auto px-6 py-16 text-center">
          <div className="mb-8">
            <div className="mx-auto h-24 w-24 bg-muted rounded-full flex items-center justify-center mb-6">
              <ShoppingCart className="h-12 w-12 text-muted-foreground" />
            </div>
            <h1 className="text-3xl font-bold mb-4">
              {t(locale, "cart.empty.title")}
            </h1>
            <p className="text-muted-foreground mb-8">
              {t(locale, "cart.empty.subtitle")}
            </p>
            <Link href="/products">
              <Button>
                {t(locale, "cart.empty.cta")}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <Link 
                href="/products" 
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
              >
                <ArrowLeft className="h-4 w-4" />
                {t(locale, "cart.back")}
              </Link>
              <h1 className="text-3xl font-bold">
                {t(locale, "cart.yourCart")}
              </h1>
              <p className="text-muted-foreground mt-1">
                {cartItems.length} {cartItems.length === 1 ? t(locale, "common.item") : t(locale, "common.items")} {t(locale, "cart.inYourCart")}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="border">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">
                  {t(locale, "cart.itemsTitle")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cartItems.map((item, index) => (
                  <div key={String(item.marble.id)}>
                    <div className="flex gap-4 p-4 bg-muted rounded-lg">
                      {/* Product Image */}
                      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                        <Image
                          src={item.marble.imageurl}
                          alt={item.marble.name}
                          fill
                          className="object-cover"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold mb-1">
                          {item.marble.name}
                        </h3>
                        <p className="text-muted-foreground mb-3">
                          {formatPrice(item.marble.price, { locale: locale === "fr" ? "fr-FR" : locale === "tn" ? "ar-TN" : locale === "it" ? "it-IT" : locale === "zh" ? "zh-CN" : "en-US" })} {t(locale, "cart.perUnit")}
                        </p>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3">
                          <div className="flex items-center border rounded-lg">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => decreaseQuantity(item)}
                              disabled={item.count <= 1}
                              className="h-8 w-8 rounded-r-none"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="px-3 py-1 text-sm font-medium min-w-[2rem] text-center">
                              {item.count}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => increaseQuantity(item)}
                              className="h-8 w-8 rounded-l-none"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Item Total and Remove */}
                      <div className="flex flex-col items-end gap-2">
                        <span className="text-lg font-bold">
                          {formatPrice(item.marble.price * item.count, { locale: locale === "fr" ? "fr-FR" : locale === "tn" ? "ar-TN" : locale === "it" ? "it-IT" : locale === "zh" ? "zh-CN" : "en-US" })}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(item)}
                          className="h-8 w-8"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {index < cartItems.length - 1 && (
                      <Separator className="bg-border" />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Service Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-4 bg-background rounded-lg border">
                <Truck className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm">{t(locale, "cart.features.freeDelivery")}</span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-background rounded-lg border">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm">{t(locale, "cart.features.qualityGuarantee")}</span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-background rounded-lg border">
                <RotateCcw className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm">{t(locale, "cart.features.easyReturns")}</span>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card className="border sticky top-4">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">
                  {t(locale, "cart.summary.title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Customer Information */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-sm font-medium">
                      {t(locale, "cart.customer.fullName")}
                    </Label>
                    <div className="relative mt-1">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="name"
                        type="text"
                        value={orderName}
                        onChange={(e) => setOrderName(e.target.value)}
                        placeholder={t(locale, "cart.customer.namePlaceholder")}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-sm font-medium">
                      {t(locale, "cart.customer.phoneNumber")}
                    </Label>
                    <div className="relative mt-1">
                      <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder={t(locale, "cart.customer.phonePlaceholder")}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  {/* Location Selection */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">
                      {t(locale, "cart.address.label")}
                    </Label>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setShowMapModal(true)}
                        className="w-full justify-start h-10"
                      >
                        <MapPin className="h-4 w-4 mr-2" />
                        {location ? (
                          <span className="text-sm">
                            {location.address || `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">{t(locale, "cart.address.selectLocation")}</span>
                        )}
                      </Button>
                      <Button variant="outline" onClick={useCurrentLocation} disabled={geoLoading} className="h-10 whitespace-nowrap">
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
                      <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                        <span>{geoMsg}</span>
            <Button variant="ghost" size="sm" onClick={useCurrentLocation} disabled={geoLoading}>{t(locale, "common.retry")}</Button>
                      </div>
          ) : null}
                  </div>
                </div>

                <Separator className="bg-border" />

                {/* Order Totals */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t(locale, "cart.summary.subtotal")}</span>
                    <span className="font-medium">
                      {formatPrice(calculateSubtotal(), { locale: locale === "fr" ? "fr-FR" : locale === "tn" ? "ar-TN" : locale === "it" ? "it-IT" : locale === "zh" ? "zh-CN" : "en-US" })}
                    </span>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    {t(locale, "cart.summary.shippingNote")}
                  </div>
                  
                  <Separator className="bg-border" />
                  
                  <div className="flex justify-between text-base font-semibold">
                    <span>{t(locale, "cart.summary.estimatedTotal")}</span>
                    <span>
                      {formatPrice(calculateSubtotal(), { locale: locale === "fr" ? "fr-FR" : locale === "tn" ? "ar-TN" : locale === "it" ? "it-IT" : locale === "zh" ? "zh-CN" : "en-US" })}
                    </span>
                  </div>
                </div>

                {/* Checkout Button */}
                <Button
                  onClick={confirmOrder}
                  disabled={!phoneNumber.trim() || !orderName.trim()}
                  className="w-full h-12"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  {t(locale, "cart.actions.checkout")}
                </Button>

                <Link href="/products" className="block">
                  <Button variant="ghost" className="w-full">
                    {t(locale, "cart.actions.continueShopping")}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Map Modal */}
      <Dialog open={showMapModal} onOpenChange={setShowMapModal}>
        {showMapModal && (
          <DialogContent className="max-w-4xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                {t(locale, "cart.mapModal.title")}
              </DialogTitle>
              <DialogDescription>
                {t(locale, "cart.mapModal.description")}
              </DialogDescription>
            </DialogHeader>
            <div className="m-6 mt-0">
              <MapPicker onSelect={(sel) => handleLocationSelect(sel)} />
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* Confirmation Modal */}
      <Dialog open={showConfirmationModal} onOpenChange={setShowConfirmationModal}>
        {showConfirmationModal && (
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                {t(locale, "cart.confirmModal.title")}
              </DialogTitle>
              <DialogDescription>
                {t(locale, "cart.confirmModal.description")}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 mt-6 px-6 pb-6">
              {/* Order Items */}
              <div>
                <h3 className="font-semibold mb-3">
                  {t(locale, "cart.confirmModal.summaryTitle")}
                </h3>
                <div className="space-y-2">
                  {cartItems.map((item) => (
                    <div key={String(item.marble.id)} className="flex justify-between items-center py-2 border-b last:border-b-0">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-12 rounded-md overflow-hidden bg-muted">
                          <Image
                            src={item.marble.imageurl}
                            alt={item.marble.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-medium">
                            {item.marble.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {t(locale, "cart.confirmModal.quantity")} {item.count}
                          </p>
                        </div>
                      </div>
                      <span className="font-semibold">
                        {formatPrice(item.marble.price * item.count, { locale: locale === "fr" ? "fr-FR" : locale === "tn" ? "ar-TN" : locale === "it" ? "it-IT" : locale === "zh" ? "zh-CN" : "en-US" })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator className="bg-border" />

              {/* Customer Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">{t(locale, "cart.confirmModal.customerInfo")}</h4>
                  <div className="space-y-1 text-sm">
                    <p className="text-muted-foreground">
                      <span className="font-medium text-foreground">{t(locale, "cart.customer.fullName")}:</span> {orderName}
                    </p>
                    <p className="text-muted-foreground">
                      <span className="font-medium text-foreground">{t(locale, "cart.customer.phoneNumber")}:</span> {phoneNumber}
                    </p>
                  </div>
                </div>
                
                {location && (
                  <div>
                    <h4 className="font-medium mb-2">{t(locale, "cart.confirmModal.deliveryAddress")}</h4>
                    <p className="text-sm text-muted-foreground">
                      {location.address || `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`}
                    </p>
                  </div>
                )}
              </div>

              <Separator className="bg-border" />

              {/* Total */}
              <div className="flex justify-between items-center text-lg font-bold">
                <span>{t(locale, "cart.confirmModal.totalLabel")}</span>
                <span>
                  {formatPrice(calculateSubtotal(), { locale: locale === "fr" ? "fr-FR" : locale === "tn" ? "ar-TN" : locale === "it" ? "it-IT" : locale === "zh" ? "zh-CN" : "en-US" })}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowConfirmationModal(false)}
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  {t(locale, "cart.actions.cancel")}
                </Button>
                <Button
                  onClick={submitOrder}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      <span>{t(locale, "cart.actions.processing")}</span>
                    </div>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      {t(locale, "cart.actions.confirm")}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
