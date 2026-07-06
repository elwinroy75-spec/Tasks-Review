const axios = require("axios");

const limit = 30;

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
  }

  console.log(allProducts); 
}

getAllProducts();