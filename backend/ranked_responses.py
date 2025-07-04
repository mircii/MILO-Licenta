import pickle
import os
import json
import numpy as np
import tensorflow as tf
import random
import spacy
import unicodedata

from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.sequence import pad_sequences
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from fallbackHandler import getFallbackForTag

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "../saved_models")
DATASET_DIR = os.path.join(BASE_DIR, "../dataset")

MILO_03 = load_model(os.path.join(MODEL_DIR, "MILO_03.h5"))
max_len = 12

with open(os.path.join(MODEL_DIR, "tokenizer.pkl"), "rb") as f:
    tokenizer = pickle.load(f)

with open(os.path.join(MODEL_DIR, "label_encoder.pkl"), "rb") as f:
    label_encoder = pickle.load(f)

with open(os.path.join(DATASET_DIR, "data_intents.json"), "r", encoding="utf-8") as f:
    data = json.load(f)

intent_responses = {}
for intent in data["intents"]:
    intent_responses[intent["tag"]] = intent["responses"]

nlp = spacy.load("ro_core_news_sm")

def remove_diacritics(text):
    return ''.join(
        c for c in unicodedata.normalize('NFD', text)
        if unicodedata.category(c) != 'Mn'
    )

def lemmatize_text(text):
    text = remove_diacritics(text.lower())
    doc = nlp(text)
    return " ".join([token.lemma_ for token in doc if token.is_alpha])

all_lemmatized_responses = []
for responses in intent_responses.values():
    all_lemmatized_responses.extend([lemmatize_text(r) for r in responses])

vectorizer = TfidfVectorizer().fit(all_lemmatized_responses)

def ngram_overlap(a, b, n=2):
    def ngrams(text):
        tokens = text.lower().split()
        return set(tuple(tokens[i:i+n]) for i in range(len(tokens)-n+1))
    return len(ngrams(a).intersection(ngrams(b)))

def rank_response(user_input, predicted_intent, top_k=1):
    candidate_responses = intent_responses[predicted_intent]
    lemmatized_input = lemmatize_text(user_input)
    lemmatized_candidates = [lemmatize_text(r) for r in candidate_responses]

    input_vector = vectorizer.transform([lemmatized_input])
    candidate_vectors = vectorizer.transform(lemmatized_candidates)
    similarities = cosine_similarity(input_vector, candidate_vectors).flatten()

    keyword_set = set(lemmatized_input.split())
    boosts = []
    for r in lemmatized_candidates:
        keyword_overlap = sum(1 for word in keyword_set if word in r.split())
        ngram_score = ngram_overlap(lemmatized_input, r, n=2)
        boost = 1.0 + 0.1 * keyword_overlap + 0.2 * ngram_score
        boosts.append(boost)

    boosted_similarities = similarities * np.array(boosts)

    top_indices = boosted_similarities.argsort()[::-1][:top_k]
    top_similarities = boosted_similarities[top_indices]
    top_responses = [candidate_responses[i] for i in top_indices]

    if sum(top_similarities) == 0:
        return random.choice(candidate_responses)

    probabilities = top_similarities / sum(top_similarities)
    print(f"\n{top_responses}\n")
    selected_response = random.choices(top_responses, weights=probabilities, k=1)[0]

    return selected_response

def predict_intent_and_response(user_message, confidence_threshold=0.80):
    user_message_norm = remove_diacritics(user_message.lower())

    seq = tokenizer.texts_to_sequences([user_message_norm])
    padded = pad_sequences(seq, maxlen=max_len, padding="post")

    intent_probs = MILO_03.predict(padded)
    print(intent_probs)
    confidence = np.max(intent_probs)
    intent_index = np.argmax(intent_probs)
    predicted_intent = label_encoder.inverse_transform([intent_index])[0]

    if confidence < confidence_threshold:
        fallback_response = getFallbackForTag(predicted_intent)
        if fallback_response:
            return predicted_intent, fallback_response, confidence
        return predicted_intent, "Îmi pare rău, nu am înțeles întrebarea. Poți să o reformulezi sau să fii puțin mai specific?", confidence

    response = rank_response(user_message, predicted_intent)
    return predicted_intent, response, confidence
