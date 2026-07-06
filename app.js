const productsContainer = document.getElementById("products");

async function fetchProducts() {
  try {
    const response = await axios.get("https://dummyjson.com/products");

    const products = response.data.products;

    displayProducts(products);

  } catch (error) {
    console.error("Error fetching products:", error);
    productsContainer.innerHTML = "<p>Failed to load products</p>";
  }
}

function displayProducts(products) {
  products.forEach(product => {
    const div = document.createElement("div");
    div.classList.add("product");

    div.innerHTML = `
      <h3>${product.title}</h3>
      <p>Id: ${product.id} </p>
      <p>Price: $${product.price}</p>
      <p>Category: ${product.category}</p>
      <p>Stock: ${product.stock}</p>
      <p>Rating: ${product.rating}</p>
      <p>Reviews: ${product.reviews}</p>
    `;

    productsContainer.appendChild(div);
  });
}

fetchProducts();