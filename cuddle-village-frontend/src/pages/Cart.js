import React, { useContext } from "react";
import { CartContext } from "../context/CartContext";
import { Link } from "react-router-dom";

function Cart() {
  const { cart, increaseQty, decreaseQty, removeItem } = useContext(CartContext);
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');

        .cart-page {
          font-family: 'Nunito', sans-serif;
          background: #faf9fe;
          min-height: 100vh;
          padding: 40px 60px;
        }

        .cart-header {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 36px;
        }

        .cart-header h1 {
          font-size: 28px;
          font-weight: 900;
          color: #2d2640;
          margin: 0;
        }

        .cart-count {
          background: #f0edff;
          color: #8b7fd4;
          font-size: 14px;
          font-weight: 800;
          padding: 4px 12px;
          border-radius: 20px;
        }

        .cart-layout {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 28px;
          align-items: start;
        }

        .cart-items {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .cart-item {
          background: #fff;
          border-radius: 18px;
          padding: 20px 24px;
          display: grid;
          grid-template-columns: 72px 1fr auto;
          gap: 20px;
          align-items: center;
          border: 1.5px solid #f0f0f0;
          transition: box-shadow 0.2s;
        }

        .cart-item:hover {
          box-shadow: 0 8px 28px rgba(175,167,231,0.12);
          border-color: #e4dffa;
        }

        .item-thumb {
          width: 72px;
          height: 72px;
          background: linear-gradient(135deg, #f0edff, #fdf6ff);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 30px;
          flex-shrink: 0;
        }

        .item-info h4 {
          font-size: 16px;
          font-weight: 800;
          color: #2d2640;
          margin: 0 0 4px;
        }

        .item-price {
          font-size: 14px;
          color: #afa7e7;
          font-weight: 700;
        }

        .item-controls {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-top: 10px;
        }

        .qty-btn {
          width: 30px;
          height: 30px;
          border-radius: 8px;
          border: 1.5px solid #e8e4f8;
          background: #f8f6ff;
          color: #8b7fd4;
          font-size: 16px;
          font-weight: 800;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s;
          font-family: 'Nunito', sans-serif;
        }

        .qty-btn:hover {
          background: #afa7e7;
          color: #fff;
          border-color: #afa7e7;
        }

        .qty-num {
          font-size: 16px;
          font-weight: 800;
          color: #2d2640;
          min-width: 20px;
          text-align: center;
        }

        .remove-btn {
          background: #fff5f5;
          border: 1.5px solid #ffe4e4;
          color: #e88;
          padding: 6px 14px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s;
          font-family: 'Nunito', sans-serif;
        }

        .remove-btn:hover {
          background: #ffe4e4;
        }

        .item-subtotal {
          font-size: 16px;
          font-weight: 900;
          color: #2d2640;
          text-align: right;
          white-space: nowrap;
        }

        /* Summary Box */
        .cart-summary {
          background: #fff;
          border-radius: 20px;
          padding: 28px;
          border: 1.5px solid #f0f0f0;
          position: sticky;
          top: 90px;
        }

        .cart-summary h3 {
          font-size: 18px;
          font-weight: 900;
          color: #2d2640;
          margin: 0 0 20px;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
          color: #888;
          font-weight: 600;
          margin-bottom: 12px;
        }

        .summary-divider {
          height: 1.5px;
          background: #f0f0f0;
          margin: 16px 0;
        }

        .summary-total {
          display: flex;
          justify-content: space-between;
          font-size: 18px;
          font-weight: 900;
          color: #2d2640;
          margin-bottom: 24px;
        }

        .checkout-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #C3B1E1, #afa7e7);
          color: #fff;
          border: none;
          border-radius: 14px;
          font-size: 15px;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.2s;
          font-family: 'Nunito', sans-serif;
          box-shadow: 0 8px 24px rgba(175,167,231,0.4);
          text-decoration: none;
        }

        .checkout-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 28px rgba(175,167,231,0.5);
        }

        .empty-cart {
          text-align: center;
          padding: 80px 20px;
        }

        .empty-cart .emoji { font-size: 64px; margin-bottom: 16px; }
        .empty-cart h3 { font-size: 20px; color: #888; font-weight: 800; margin-bottom: 8px; }
        .empty-cart p { color: #bbb; font-size: 14px; margin-bottom: 24px; }

        .browse-btn {
          display: inline-flex;
          padding: 12px 28px;
          background: linear-gradient(135deg, #C3B1E1, #afa7e7);
          color: #fff;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 700;
          text-decoration: none;
          box-shadow: 0 6px 18px rgba(175,167,231,0.4);
        }
      `}</style>

      <div className="cart-page">
        <div className="cart-header">
          <h1>Your Cart</h1>
          <span className="cart-count">{cart.length} item{cart.length !== 1 ? "s" : ""}</span>
        </div>

        {cart.length === 0 ? (
          <div className="empty-cart">
            <div className="emoji">🛒</div>
            <h3>Your cart is empty</h3>
            <p>Add some lovely items to get started!</p>
            <Link to="/products" className="browse-btn">Browse Products</Link>
          </div>
        ) : (
          <div className="cart-layout">
            <div className="cart-items">
              {cart.map(item => (
                <div key={item._id} className="cart-item">
                  <div className="item-thumb">🧸</div>

                  <div className="item-info">
                    <h4>{item.name}</h4>
                    <div className="item-price">KES {item.price} each</div>
                    <div className="item-controls">
                      <button className="qty-btn" onClick={() => decreaseQty(item._id)}>−</button>
                      <span className="qty-num">{item.quantity}</span>
                      <button className="qty-btn" onClick={() => increaseQty(item._id)}>+</button>
                      <button className="remove-btn" onClick={() => removeItem(item._id)}>Remove</button>
                    </div>
                  </div>

                  <div className="item-subtotal">KES {item.price * item.quantity}</div>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <h3>Order Summary</h3>
              {cart.map(item => (
                <div key={item._id} className="summary-row">
                  <span>{item.name} ×{item.quantity}</span>
                  <span>KES {item.price * item.quantity}</span>
                </div>
              ))}
              <div className="summary-divider" />
              <div className="summary-row">
                <span>Shipping</span>
                <span style={{ color: "#B5D99C", fontWeight: 800 }}>Free</span>
              </div>
              <div className="summary-divider" />
              <div className="summary-total">
                <span>Total</span>
                <span>KES {total}</span>
              </div>
              <Link to="/checkout" className="checkout-btn">
                Proceed to Checkout →
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Cart;