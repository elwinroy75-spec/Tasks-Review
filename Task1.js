const axios = require("axios");
const fs = require("fs");

const limit = 30;

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getAllProducts() {
  let skip = 0;
  let allProducts = [];
  let total = 0;

  while (true) {
    const res = await axios.get(
      `https://dummyjson.com/products?limit=${limit}&skip=${skip}`
    );

    const data = res.data;

    allProducts.push(...data.products);
    total = data.total;

    skip += limit;

    if (allProducts.length >= total) break;

    await wait(300); // 👈 prevents API limit error
  }

  return allProducts;
}

async function main() {
  const products = await getAllProducts();

  console.log(products);

  const result = products.map((product) => ({
  productId: product.id,
  name: product.title,
  category: product.category,
  price: product.price,
  rating: product.rating,
  value: product.rating >= 4 ? "Promote" : "Review",
  stock: product.stock,
  status: product.stock > 20 ? "in-stock" : "low stock"
}));

  result.sort((a, b) => a.name.localeCompare(b.name));

  fs.writeFileSync(
    "products-catalog.json",
    JSON.stringify(result, null, 2)
  );

  console.log("Product Details saved in products-catalog.json file");
}

main().catch(console.error);
