const axios = require("axios");
const fs = require("fs");

const limit = 30;

// Task 1: Fetch all products
async function fetchAllProducts() {
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

    if (allProducts.length >= total) {
      break;
    }
  }

  return allProducts;
}

// Task 2: Keep only required fields
function filterProducts(products) {
  return products.map((product) => ({
    id: product.id,
    title: product.title,
    category: product.category,
    price: product.price,
    rating: product.rating,
  }));
}

// Task 3: Rename fields
function renameFields(products) {
  return products.map((product) => ({
    productId: product.id,
    name: product.title,
    category: product.category,
    price: product.price,
    rating: product.rating,
  }));
}

// Task 4: Sort by product name
function sortProducts(products) {
  return products.sort((a, b) => a.name.localeCompare(b.name));
}

// Task 5: Save output to JSON file
function saveToFile(products) {
  fs.writeFileSync(
    "products.json",
    JSON.stringify(products, null, 2),
    "utf8"
  );
}

async function main() {
    
  const products = await fetchAllProducts();

  const filteredProducts = filterProducts(products);

  const renamedProducts = renameFields(filteredProducts);

  const sortedProducts = sortProducts(renamedProducts);

  saveToFile(sortedProducts);

  console.log("Products saved successfully.");
}
main().catch(console.error);