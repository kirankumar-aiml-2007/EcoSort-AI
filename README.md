# ♻️ EcoSort AI – Smart Recycling & Circular Economy Platform

EcoSort AI is an AI-powered waste management platform that combines **Computer Vision, Generative AI, and 3D Digital Twin technology** to promote smart waste segregation, recycling, and sustainable waste management.

The platform helps users identify waste materials, receive personalized recycling recommendations, track material journeys, and understand their environmental impact.

## 🚀 Key Features

- **AI Waste Detection:** Identifies waste materials using YOLO-based object detection with bounding boxes.
- **Smart Waste Segregation:** Classifies waste into recyclable, biodegradable, reusable, and hazardous categories.
- **Generative AI:** Uses Google Gemini to provide personalized recycling and upcycling recommendations.
- **Citizen Dashboard:** Waste scanning history, material tracking, and eco-rewards.
- **Volunteer Management:** Collection assignments and recycling lifecycle tracking.
- **Admin Dashboard:** User management, smart bin monitoring, and operational analytics.
- **3D Digital Twin:** Interactive visualization of recycling facilities and material flow.
- **Sustainability Analytics:** Carbon impact estimation and environmental insights.
- **Eco-Rewards:** Encourages responsible waste disposal through reward points and leaderboards.

## 🛠️ Technologies Used

| Technology | Purpose |
|---|---|
| React.js & TypeScript | Frontend development |
| Tailwind CSS | UI styling |
| Node.js & Express.js | Backend development |
| Python | Computer vision |
| YOLOv8 | Object detection |
| Google Gemini AI | AI recommendations |
| Three.js | 3D Digital Twin |
| Recharts | Data visualization |
| Git & GitHub | Version control |

## 🏗️ System Architecture

```text
       User / Citizen
             |
             v
    React + TypeScript
             |
             v
       Express Backend
             |
       +-----+------+
       |            |
       v            v
   YOLO Model    Gemini AI
       |            |
       +-----+------+
             |
             v
    Waste Classification
             |
       +-----+------+
       |            |
       v            v
  Material Flow   Eco Rewards
       |
       v
    3D Digital Twin
       |
       v
  Analytics Dashboard
```

## ⚙️ Installation & Setup

**1. Clone the repository**

```bash
git clone https://github.com/kirankumar-aiml-2007/EcoSort-AI.git
```

**2. Navigate to the project**

```bash
cd EcoSort-AI
```

**3. Install dependencies**

```bash
npm ci
pip install -r requirements.txt
```

**4. Configure environment variables**

Create a `.env` file using `.env.example` and add the required Gemini API key and other configurations.

**5. Run the application**

```bash
npm run dev
```

## 🌍 Sustainability Impact

EcoSort AI supports the following UN Sustainable Development Goals:

- **SDG 11:** Sustainable Cities and Communities.
- **SDG 12:** Responsible Consumption and Production.
- **SDG 13:** Climate Action.

## 🔮 Future Enhancements

- Physical IoT smart bin integration.
- Mobile application development.
- Real-time cloud database integration.
- Advanced waste detection models.
- Blockchain-based material tracking.
- Integration with municipal waste management systems.

## 👥 Team Members

| Team Member | GitHub Profile |
|---|---|
| **Brunda S** | [@Brunda-tech](https://github.com/Brunda-tech) |
| **Chandhan Kumar** | [@chandhankumargv](https://github.com/chandhankumargv) |
| **Kiran Kumar** | [@kirankumar-aiml-2007](https://github.com/kirankumar-aiml-2007) |

## 🤝 Collaboration

We collaboratively developed EcoSort AI by combining Artificial Intelligence, Computer Vision, Full-Stack Development, and 3D Visualization to create a smarter and more sustainable waste management ecosystem.

---

### ♻️ Identify Smartly. Recycle Responsibly. Build a Sustainable Future. 🌍
