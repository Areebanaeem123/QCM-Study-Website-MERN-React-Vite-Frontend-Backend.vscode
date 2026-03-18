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

interface BasketContextType {
  items: BasketItem[]
  addItem: (item: BasketItem) => void
  removeItem: (id: string) => void
  clearBasket: () => void
  totalItems: number
  totalPrice: number
  isInBasket: (id: string) => boolean
}

const BasketContext = createContext<BasketContextType | undefined>(undefined)

export function BasketProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<BasketItem[]>([])

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
  }, [])

  // Save basket to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem("basket", JSON.stringify(items))
  }, [items])

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
  }

  const isInBasket = (id: string) => {
    return items.some((i) => i.id === id)
  }

  const totalItems = items.length
  const totalPrice = items.reduce((sum, item) => sum + item.price, 0)

  return (
    <BasketContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        clearBasket,
        totalItems,
        totalPrice,
        isInBasket,
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
