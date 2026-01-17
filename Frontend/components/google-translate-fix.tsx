"use client"
import { useEffect } from "react"
/**
 * Component to fix Google Translate hydration issues
 * This prevents Google Translate from interfering with React's DOM management
 * by handling DOM mutations gracefully
 */
export function GoogleTranslateFix() {
  useEffect(() => {
    // Only override if we're in the browser
    if (typeof window === "undefined") return

    // Override removeChild to handle Google Translate's DOM modifications
    const originalRemoveChild = Node.prototype.removeChild
    Node.prototype.removeChild = function<T extends Node>(child: T): T {
      try {
        return originalRemoveChild.call(this, child) as T
      } catch (error) {
        // If the node is not a child (possibly modified by Google Translate), 
        // handle it gracefully
        if (error instanceof DOMException && error.name === "NotFoundError") {
          // The node is not a child of this node (likely moved by Google Translate)
          // Check if the node still exists and has a different parent
          if (child.parentNode && child.parentNode !== this) {
            // The node has been moved by Google Translate, try to remove it from its current parent
            try {
              return originalRemoveChild.call(child.parentNode, child) as T
            } catch {
              // If that also fails, the node might have already been removed
              // Return the child to satisfy the return type, but it's effectively removed
              return child
            }
          }
          // If the node has no parent, it's already been removed
          return child
        }
        // Re-throw other errors
        throw error
      }
    }

    // Cleanup: restore original removeChild
    return () => {
      Node.prototype.removeChild = originalRemoveChild
    }
  }, [])

  return null
}

