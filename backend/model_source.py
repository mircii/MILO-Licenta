import json
import numpy as np
import random
import nltk
import tensorflow as tf
import unicodedata
import re
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Embedding, LSTM, Dense, Dropout, Bidirectional, GlobalMaxPooling1D
from nltk.stem import WordNetLemmatizer
from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split

def remove_diacritics(text):
    text = unicodedata.normalize('NFD', text)
    text = ''.join(ch for ch in text if unicodedata.category(ch) != 'Mn')
    return text

def clean_text(text):
    text = text.lower()
    text = remove_diacritics(text)
    text = re.sub(r"[^\w\s]", "", text)
    return text

with open("data_intents.json", "r", encoding="utf-8") as file:
    data = json.load(file)

# Extract patterns and responses
patterns, tags, responses = [], [], {}
for intent in data["intents"]:
    for pattern in intent["patterns"]:
        patterns.append(pattern)
        tags.append(intent["tag"])
    responses[intent["tag"]] = intent["responses"]

patterns = [clean_text(p) for p in patterns]

# Encode the labels
label_encoder = LabelEncoder()
tags_encoded = label_encoder.fit_transform(tags)

# Tokenize and pad the sequences
tokenizer = Tokenizer(oov_token="<OOV>")
tokenizer.fit_on_texts(patterns)
sequences = tokenizer.texts_to_sequences(patterns)
max_len = max(len(seq) for seq in sequences)
X = pad_sequences(sequences, maxlen=max_len, padding="post")

# Convert labels to categorical
y = np.array(tags_encoded)

# Define model architecture
MILO_03 = Sequential([
    Embedding(input_dim=len(tokenizer.word_index)+1, output_dim=32, input_length=max_len),
    Bidirectional(LSTM(32, return_sequences=True)),
    GlobalMaxPooling1D(),
    Dropout(0.4),
    Dense(32, activation='relu'),
    Dropout(0.3),
    Dense(len(set(tags)), activation='softmax')
], name = "MILO_03")

# Compile the model
MILO_03.compile(loss="sparse_categorical_crossentropy", optimizer=tf.keras.optimizers.Adam(learning_rate = 0.001), metrics=["accuracy"])

# Train the model
X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)

history = MILO_03.fit(X_train, y_train, epochs=30, batch_size=8, validation_data=(X_val, y_val))