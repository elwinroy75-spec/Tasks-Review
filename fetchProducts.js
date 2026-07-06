//const axios = require("axios");
//axios.get("https://dummyjson.com/products?")
//.then(res => console.log(res.data));


//const axios = require("axios");
//axios.get("https://dummyjson.com/products?limit=30&skip=30")
//.then(res => console.log(res.data));

const axios = require("axios");
const limit = 30;
const skip = 0;

async function getAllProducts() {
  const res = await axios.get(
    `https://dummyjson.com/products?limit=${limit}&skip=${skip}`
  );

  console.log(JSON.stringify(res.data.products,null, 2));
}

getAllProducts();