# ✨ Text-Editing-Server ✨

![Node.js](https://img.shields.io/badge/Node.js-18+-green?logo=node.js&logoColor=white)
![npm](https://img.shields.io/badge/npm-v9-red?logo=npm)
![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Contributions Welcome](https://img.shields.io/badge/Contributions-Welcome-brightgreen.svg?logo=github)
![Tests](https://img.shields.io/badge/Tests-Passing-success?logo=githubactions&logoColor=white)

📄 **Text-Editing-Server** is a modular text editing service built with **Node.js**, designed with a **Proxy Server** and **Document Server** architecture. It enables secure and flexible remote text manipulation with JWT-based authentication.  

---

## 📌 Features

- ✅ Proxy–Document server architecture  
- ✅ View and edit text files remotely  
- ✅ Insert, replace, and manipulate text content  
- ✅ JWT authentication for secure communication  
- ✅ Extensible and modular design  
- ✅ Ready for scaling in distributed systems  

---

## 📂 Repository Structure

Text-Editing-Server/
├── .nyc_output/ # Code coverage reports
├── data/ # Config/data storage
├── docs-server/ # Document Server (core editing engine)
├── proxy-server/ # Proxy Server (client-facing gateway)
├── test/ # Test suite
├── jwtTokenGetter.js # JWT token utility
├── package.json
├── package-lock.json
└── readme.pdf
