# Ultrasound Analysis

A full-stack web app that classifies breast ultrasound images and segments the tumour region using deep learning. Upload an image from the dashboard, and the app returns a diagnosis class and, for abnormal scans, a segmentation mask.

Trained on the **BUSI** (Breast Ultrasound Images) dataset.

> **Disclaimer:** This is a research and learning project. It is not a medical device and must not be used for clinical diagnosis.

---

## How It Works

The backend runs a two-stage inference pipeline:

1. **Classification:** a ResNet-18 model predicts one of three classes: `benign`, `malignant` or `normal`.
2. **Segmentation:** if the image is not `normal`, an Attention U-Net produces a binary mask of the lesion region.

```
Image upload ──> ResNet-18 classifier ──> normal?   ──> return class
                                      └─> abnormal ──> Attention U-Net ──> return class + mask
```

The mask is resized to the original image dimensions and returned as a base64-encoded PNG, which the dashboard displays alongside the prediction.

---

## Features

- Two-stage ML pipeline (classification, then segmentation only when needed)
- Image upload with instant preview and client-side validation (image type, 10 MB limit)
- REST inference API built with FastAPI
- JWT-based sign-up and login with bcrypt password hashing
- Responsive React UI styled with Tailwind CSS

---

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS 4, React Router, Lucide icons |
| ML API | Python, FastAPI, Uvicorn, PyTorch, torchvision, Pillow, NumPy |
| Auth API | Node.js, Express, JSON Web Tokens, bcryptjs |
| Models | ResNet-18 (classification), Attention U-Net (segmentation) |

---

## Architecture

The app runs as three local services:

| Service | Port | Purpose |
|---|---|---|
| React frontend | `5173` | UI: landing page, login, sign-up, dashboard |
| FastAPI ML service | `8000` | Runs the classification and segmentation models |
| Express auth service | `3000` | Handles user registration and login |

---

## Project Structure

```
Ultrasound_Analysis/
├── backend/
│   ├── controllers/
│   │   └── authController.js     # Register and login logic
│   ├── ml/
│   │   ├── ml_api.py             # FastAPI app and inference pipeline
│   │   ├── resnet.py             # ResNet-18 definition and training script
│   │   ├── resnet.pth            # Classifier weights
│   │   └── best_attention_unet_busi.pth   # Segmentation weights
│   ├── models/
│   │   └── userModel.js          # PostgreSQL user queries
│   ├── routes/
│   │   └── auth.js               # /api/auth routes
│   ├── db.js                     # PostgreSQL connection pool
│   └── server.js                 # Express entry point
├── src/
│   ├── components/
│   │   ├── Dashboard.jsx         # Upload, preview and results
│   │   ├── Hero.jsx
│   │   ├── Login.jsx
│   │   ├── Navbar.jsx
│   │   └── Signup.jsx
│   ├── App.jsx                   # Routes
│   └── main.jsx
├── index.html
├── package.json
└── vite.config.js
```

---

## Getting Started

### Prerequisites

- Python 3.8+
- Node.js 18+

### 1. Clone the repository

```bash
git clone https://github.com/nit-singh/Ultrasound_Analysis.git
cd Ultrasound_Analysis
```

### 2. Start the ML service

```bash
cd backend/ml
pip install fastapi uvicorn python-multipart torch torchvision pillow numpy scikit-learn
uvicorn ml_api:app --reload --port 8000
```

Run this from `backend/ml/`, because the API loads the model weights from that folder.

### 3. Start the auth service

In a new terminal:

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:

```env
PORT=3000
JWT_SECRET=your_jwt_secret
```

Then start the server:

```bash
npm start
```

### 4. Start the frontend

In a new terminal, from the project root:

```bash
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## API Reference

### ML service (port 8000)

#### `POST /segment`

Classifies an ultrasound image and returns a segmentation mask for abnormal cases.

**Request:** `multipart/form-data` with a single field `file` (the image).

**Response:**

```json
{
  "prediction": "malignant",
  "segmentation": "<base64-encoded PNG mask>"
}
```

`segmentation` is `null` when the prediction is `normal`.

### Auth service (port 3000)

| Method | Endpoint | Body | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | `{ name, email, password }` | Creates a user and returns a JWT |
| `POST` | `/api/auth/login` | `{ email, password }` | Returns a JWT for valid credentials |
| `GET` | `/api/health` | none | Health check |

Tokens expire after 24 hours.

---

## Model Details

| | Classifier | Segmenter |
|---|---|---|
| Architecture | ResNet-18 | Attention U-Net (3 encoder / 3 decoder blocks) |
| Input | RGB, 224 × 224, normalised | Grayscale, 256 × 256 |
| Output | `benign` / `malignant` / `normal` | Binary mask (threshold 0.5) |

---

## Current Limitations

- User accounts are stored in memory, so they reset when the auth server restarts. A PostgreSQL user model (`models/userModel.js`, `db.js`) is included but not yet connected.
- Service URLs are hard-coded to `localhost`.
- Inference runs on CPU.

---

## Contributing

1. Fork the repository and create a feature branch.
2. Commit your changes and open a pull request.
3. Report bugs or suggest features through the Issues tab.
