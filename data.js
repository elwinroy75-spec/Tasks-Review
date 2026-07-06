const axios = require("axios");

async function fetchProducts() {
  try {
    const response = await axios.get("https://dummyjson.com/products");

    const products = response.data.products;

    console.log("Products fetched successfully\n");

    products.forEach((product) => {
      console.log("ID:", product.id);
      console.log("Title:", product.title);
      console.log("Price:", product.price);
      console.log("Category:", product.category);
    });

  } catch (error) {
    console.log("Error fetching data:", error.message);
  }
}

fetchProducts();