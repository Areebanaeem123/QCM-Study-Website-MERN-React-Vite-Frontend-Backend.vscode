"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

export interface BasketItem {
  id: string
  title: string
  price: number
  currency: string
  type: "pack" | "mock_exam"
  image_url?: string
}

export interface VoucherInfo {
  code: string
  valid: boolean
  discount_amount: number
  discount_percentage?: number
}

interface BasketContextType {
  items: BasketItem[]
  addItem: (item: BasketItem) => void
  removeItem: (id: string) => void
  clearBasket: () => void
  totalItems: number
  originalPrice: number
  discountAmount: number
  totalPrice: number
  isInBasket: (id: string) => boolean
  
  // Voucher support
  voucher: VoucherInfo | null
  applyVoucher: (voucher: VoucherInfo, discountAmount: number) => void
  removeVoucher: () => void
  
  // Payment info
  paymentMethod: "card" | "apple_pay" | "google_pay" | null
  setPaymentMethod: (method: "card" | "apple_pay" | "google_pay") => void
}

const BasketContext = createContext<BasketContextType | undefined>(undefined)

export function BasketProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<BasketItem[]>([])
  const [voucher, setVoucher] = useState<VoucherInfo | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<"card" | "apple_pay" | "google_pay" | null>("card")

  // Load basket from local storage on mount
  useEffect(() => {
    const savedBasket = localStorage.getItem("basket")
    if (savedBasket) {
      try {
        setItems(JSON.parse(savedBasket))
      } catch (e) {
        console.error("Failed to parse basket from localStorage", e)
      }
    }

    const savedVoucher = localStorage.getItem("basket_voucher")
    if (savedVoucher) {
      try {
        setVoucher(JSON.parse(savedVoucher))
      } catch (e) {
        console.error("Failed to parse voucher from localStorage", e)
      }
    }

    const savedPaymentMethod = localStorage.getItem("payment_method") as any
    if (savedPaymentMethod) {
      setPaymentMethod(savedPaymentMethod)
    }
  }, [])

  // Save basket to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem("basket", JSON.stringify(items))
  }, [items])

  // Save voucher to local storage whenever it changes
  useEffect(() => {
    if (voucher) {
      localStorage.setItem("basket_voucher", JSON.stringify(voucher))
    } else {
      localStorage.removeItem("basket_voucher")
    }
  }, [voucher])

  // Save payment method
  useEffect(() => {
    if (paymentMethod) {
      localStorage.setItem("payment_method", paymentMethod)
    } else {
      localStorage.removeItem("payment_method")
    }
  }, [paymentMethod])

  const addItem = (item: BasketItem) => {
    setItems((prev) => {
      if (prev.find((i) => i.id === item.id)) return prev
      return [...prev, item]
    })
  }

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  const clearBasket = () => {
    setItems([])
    setVoucher(null)
    setPaymentMethod(null)
  }

  const isInBasket = (id: string) => {
    return items.some((i) => i.id === id)
  }

  const applyVoucher = (voucherInfo: VoucherInfo, discountAmount: number) => {
    setVoucher({
      ...voucherInfo,
      discount_amount: discountAmount
    })
  }

  const removeVoucher = () => {
    setVoucher(null)
  }

  const totalItems = items.length
  const originalPrice = items.reduce((sum, item) => sum + item.price, 0)
  const discountAmount = voucher?.discount_amount || 0
  const totalPrice = originalPrice - discountAmount

  return (
    <BasketContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        clearBasket,
        totalItems,
        originalPrice,
        discountAmount,
        totalPrice,
        isInBasket,
        voucher,
        applyVoucher,
        removeVoucher,
        paymentMethod,
        setPaymentMethod
      }}
    >
      {children}
    </BasketContext.Provider>
  )
}

export function useBasket() {
  const context = useContext(BasketContext)
  if (context === undefined) {
    throw new Error("useBasket must be used within a BasketProvider")
  }
  return context
}
