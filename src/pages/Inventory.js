import React, { useState, useEffect } from 'react';
import { getInventory } from '../services/inventoryService';

function Inventory() {
    const [inventory, setInventory] = useState([]);

    useEffect(() => {
        async function fetchInventory() {
          const data = await getInventory();
          setInventory(data);
        }
        fetchInventory();
      }, []);
    
      return (
        <div>
          <h1>재고 관리</h1>
          <table>
            <thead>
              <tr>
                <th>메이커</th>
                <th>물품</th>
                <th>수량</th>
                <th>박스</th>
                <th>전체 수량</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => (
                <tr key={item.id}>
                  <td>{item.manufacturer}</td>
                  <td>{item.item}</td>
                  <td>{item.quantity}</td>
                  <td>{item.boxes}</td>
                  <td>{item.totalQuantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
}

export default Inventory;