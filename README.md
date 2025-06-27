# MILO - AI Chatbot pentru Sfaturi Personalizate

**MILO** este un chatbot AI antrenat pentru a furniza **informații legate de serviciile de consiliere în carieră, consiliere psihologică și voluntariat oferite de Centrul de Consiliere și Orientare în Carieră (CCOC)**, folosind tehnici moderne de **Procesare a Limbajului Natural (NLP)** și **învățare automată**.

## 🧠 Descriere generală

Proiectul combină un model NLP propriu, antrenat de la zero folosind TensorFlow și o rețea neuronală LSTM, cu o arhitectură web modernă: backend în FastAPI și frontend în React.js.

Sistemul se bazează pe clasificarea intențiilor mesajelor utilizatorului și selecția de răspunsuri predefinite, fiind o alternativă **fiabilă și controlabilă** la chatboturile generative.

## 🔍 Funcționalități cheie

- Clasificarea intenției mesajelor utilizatorului cu LSTM
- Selecția răspunsului folosind TF-IDF + similaritate cosinusoidală
- Mecanism de fallback pentru clarificarea mesajelor neclare
- Interfață conversațională React intuitivă și responsive
- Backend REST API cu FastAPI
- Stocare și reutilizare de modele cu `.h5`, `pickle` și fișiere `.json`

## 🛠️ Tehnologii utilizate

- **NLP & ML:** TensorFlow, Keras, Scikit-learn
- **Web Backend:** FastAPI, Pydantic
- **Web Frontend:** React.js, Axios, HTML/CSS
- **Altele:** JSON, Pickle, HDF5 (`.h5`), TF-IDF, cosine similarity

## 🚀 Rulare aplicație local 

### 1. Clonare repository

```bash
git clone https://github.com/mircii/MILO-Licenta.git
cd MILO-Licenta
```

### 2. Instalare dependențe

Backend

```bash
cd backend
pip install -r requirements.txt
```

Frontend

```bash
cd frontend
npm install
```

### 3. Rulare aplicație

Backend

```bash
uvicorn main:app --reload
```

Frontend

```bash
npm run start
```

## 📁 Structură fișiere esențiale

- `data_intents.json`: Baza de cunoștințe cu intenții, pattern-uri și răspunsuri
- `MILO_03.h5`: Modelul LSTM antrenat
- `tokenizer.pkl`, `label_encoder.pkl`: Obiecte serializate necesare pentru inferență
- `main.py`: API FastAPI (endpoint `/predict`)
- `ranked_responses.py`: Logica de selectare a răspunsului
- `frontend/src`: Interfața React a chatbotului

## 💬 Exemple de utilizare

```text
Utilizator: Cum îmi scriu un CV bun?
Chatbot: Iată câteva sfaturi utile pentru redactarea unui CV profesional...
```

## ⚠️ Limitări și Considerații

- Nu se păstrează datele utilizatorilor – fiecare cerere e procesată individual
- Aplicația are un prag de încredere de 80% pentru a activa fallback-ul
- Sfaturile sunt generale și nu înlocuiesc consultanța profesională

🎓 Proiect de licență, Mircea Micicoi, Universitatea Politehnica Timișoara, Automatică și Informatică Aplicată
