const jwt = require("jsonwebtoken");
const token = jwt.sign({ userId: "user123" }, "my-jwt-secret");
console.log(token);
