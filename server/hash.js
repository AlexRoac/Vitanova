const bcrypt = require("bcrypt");

async function generarHash() {
  const password = "1234"; 
  const hash = await bcrypt.hash(password, 10);
  console.log(hash);
}

generarHash();