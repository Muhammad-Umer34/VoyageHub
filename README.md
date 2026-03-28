
<div align="center">
  <h1>🌍 Voyage Hub - Itinerary Planner</h1>
  <p>A full-stack itinerary planner with real-time collaboration for seamless trip management.</p>
</div>

---

## 🛠 Project Overview

**Voyage Hub** is a full-stack itinerary planning platform that enables users to collaboratively create, manage, and update travel plans in real-time. Built with scalability and performance in mind, it combines modern web technologies with real-time communication.

---

## 🚀 Features

- ⚡ **Real-Time Collaboration** using WebSockets  
- 🗺️ **Itinerary Creation & Management** (Trips, Activities, Scheduling)  
- 👥 **Multi-User Interaction** with shared updates  
- 🔐 **Secure REST APIs** using FastAPI  
- 🐳 **Dockerized Setup** for easy deployment  
- 📱 **Responsive UI** for seamless user experience  

---

## 🧰 Tech Stack

### 💻 Frontend
- React  
- JavaScript  
- HTML/CSS  

### ⚙️ Backend
- FastAPI (Python)  
- WebSockets  

### 🗄️ Database
- PostgreSQL  

### 🐳 DevOps & Tools
- Docker & Docker Compose  
- Git & GitHub  

---

## 📂 Project Structure

```

voyage-hub/
├── backend/          # FastAPI backend (APIs + WebSockets)
├── frontend/         # React frontend
├── db/               # Database models & migrations
├── docker-compose.yml
└── README.md

````

---

## 🔧 Installation & Setup

### 🐳 Run with Docker (Recommended)

```bash
git clone https://github.com/Muhammad-Umer34/voyage-hub.git
cd voyage-hub
docker-compose up --build
````

👉 This will:

* Start **FastAPI backend**
* Start **React frontend**
* Run **PostgreSQL database**
* Configure networking automatically

---

### ⚙️ Manual Setup (Without Docker)

#### 1️⃣ Clone Repository

```bash
git clone https://github.com/Muhammad-Umer34/voyage-hub.git
cd voyage-hub
```

#### 2️⃣ Backend Setup

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

#### 3️⃣ Frontend Setup

```bash
cd frontend
npm install
npm start
```

---

## 🗄️ Database Setup (PostgreSQL)

1. Install PostgreSQL
2. Create database:

```sql
CREATE DATABASE voyage_hub;
```

3. Add `.env` file:

```
DATABASE_URL=postgresql://username:password@localhost:5432/voyage_hub
```

4. Run migrations (if applicable)

---



---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a branch (`git checkout -b feature/your-feature`)
3. Commit changes (`git commit -m "Add feature"`)
4. Push (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## 📫 Contact

**Muhammad Umer**
📧 Email: [umer.gm89@gmail.com](mailto:umer.gm89@gmail.com)
🔗 LinkedIn: [https://www.linkedin.com/in/muhammad-umer-667089273/](https://www.linkedin.com/in/muhammad-umer-667089273/)
🌐 Portfolio: [https://portfolio-site-nu-sooty.vercel.app/](https://portfolio-site-nu-sooty.vercel.app/)

---

⭐ If you like this project, consider giving it a star!



