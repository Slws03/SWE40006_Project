import { useEffect, useState } from 'react'
import { supabase } from './supabase'

function App() {

  const [products, setProducts] = useState([])

  useEffect(() => {
    fetchProducts()
  }, [])

  async function fetchProducts() {
    const { data, error } = await supabase
      .from('products')
      .select('*')

    if (error) {
      console.log(error)
    } else {
      setProducts(data)
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Dollar Shop Products</h1>

      {products.map((product) => (
        <div
          key={product.id}
          style={{
            border: '1px solid gray',
            padding: '10px',
            marginBottom: '10px',
            borderRadius: '8px'
          }}
        >
          <h2>{product.name}</h2>
          <p>{product.description}</p>
          <p>Category: {product.category}</p>
          <p>Price: ${product.price}</p>
          <p>Stock: {product.stock}</p>
        </div>
      ))}
    </div>
  )
}

export default App