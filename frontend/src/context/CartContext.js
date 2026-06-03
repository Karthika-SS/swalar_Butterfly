import React, { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_CART': {
      // Match by BOTH id AND size so S and M of the same product are separate cart entries
      const existing = state.find(
        i => i.id === action.product.id && i.size === action.product.size
      );
      if (existing) {
        return state.map(i =>
          (i.id === action.product.id && i.size === action.product.size)
            ? { ...i, quantity: Math.min(i.quantity + 1, i.stock) }
            : i
        );
      }
      // New entry — spread product so size is included
      return [...state, { ...action.product, quantity: 1 }];
    }

    case 'REMOVE_FROM_CART':
      // Match by id + size so only the right variant is removed
      return state.filter(
        i => !(i.id === action.id && i.size === action.size)
      );

    case 'UPDATE_QUANTITY':
      return state.map(i =>
        (i.id === action.id && i.size === action.size)
          ? { ...i, quantity: Math.max(1, Math.min(action.quantity, i.stock)) }
          : i
      );

    case 'CLEAR_CART':
      return [];

    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [cart, dispatch] = useReducer(cartReducer, [], () => {
    try {
      return JSON.parse(localStorage.getItem('cart')) || [];
    } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart    = (product)            => dispatch({ type: 'ADD_TO_CART', product });
  const removeFromCart = (id, size = null)  => dispatch({ type: 'REMOVE_FROM_CART', id, size });
  const updateQuantity = (id, quantity, size = null) =>
    dispatch({ type: 'UPDATE_QUANTITY', id, quantity, size });
  const clearCart    = ()                   => dispatch({ type: 'CLEAR_CART' });

  const cartTotal = cart.reduce((sum, i) => sum + parseFloat(i.price) * i.quantity, 0);
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);