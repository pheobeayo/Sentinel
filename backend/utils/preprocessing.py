import re
import string
import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from nltk.tokenize import word_tokenize

# Download required NLTK data on first run
def ensure_nltk_data():
    resources = [
        ("tokenizers/punkt_tab", "punkt_tab"),
        ("corpora/stopwords", "stopwords"),
        ("corpora/wordnet", "wordnet"),
    ]
    for path, name in resources:
        try:
            nltk.data.find(path)
        except LookupError:
            nltk.download(name, quiet=True)
        except OSError:
            nltk.download(name, quiet=True)

ensure_nltk_data()

_lemmatizer = WordNetLemmatizer()
_stop_words = set(stopwords.words("english"))


def preprocess(text: str) -> str:
    """Full NLP pipeline: lowercase → strip URLs → punctuation → tokenize → stop-words → lemmatize."""
    text = text.lower()
    text = re.sub(r"http\S+|www\S+", " ", text)
    text = re.sub(r"\d+", " ", text)
    text = text.translate(str.maketrans("", "", string.punctuation))
    tokens = word_tokenize(text)
    tokens = [_lemmatizer.lemmatize(t) for t in tokens if t not in _stop_words and len(t) > 1]
    return " ".join(tokens)


def extract_raw_features(text: str) -> dict:
    """Hand-crafted signal features used alongside TF-IDF."""
    text_lower = text.lower()

    urgency_words = ["urgent", "immediately", "expire", "limited", "act now", "final notice", "last chance"]
    money_words = ["won", "prize", "lottery", "reward", "cash", "bitcoin", "crypto", "transfer", "payment", "fee"]
    personal_words = ["password", "otp", "pin", "account number", "ssn", "credit card", "bank details"]
    threat_words = ["suspended", "blocked", "legal action", "arrest", "penalty", "cancel"]
    link_pattern = re.compile(r"http\S+|www\S+|bit\.ly|tinyurl")

    return {
        "urgency_count": sum(1 for w in urgency_words if w in text_lower),
        "money_count": sum(1 for w in money_words if w in text_lower),
        "personal_info_request": sum(1 for w in personal_words if w in text_lower),
        "threat_count": sum(1 for w in threat_words if w in text_lower),
        "has_suspicious_link": int(bool(link_pattern.search(text_lower))),
        "exclamation_count": text.count("!"),
        "caps_ratio": sum(1 for c in text if c.isupper()) / max(len(text), 1),
        "word_count": len(text.split()),
    }
