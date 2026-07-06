const axios = require("axios");
const fs = require("fs");

async function getProducts() {
  let products = [];
  let skip = 0;
  const limit = 30;

  while (true) {
    const { data } = await axios.get(
      `https://dummyjson.com/products?limit=${limit}&skip=${skip}`
    );

    products.push(...data.products);

    if (products.length >= data.total) 
      break;

    skip += limit;
  }

  // fetch only the required fields & renaming id and title fields
  const result = products.map((product) => ({
    productId: product.id,
    name: product.title,
    category: product.category,
    price: product.price,
    rating: product.rating,
  }));

// sort products by name
result.sort((a,b) => a.name.localeCompare(b.name));

// saving products data in products-catalog.json
fs.writeFileSync("products-catalog.json",JSON.stringify(result,null,2));
console.log("Product Details saved in products-catalog.json file");

}

getProducts().catch(console.error);