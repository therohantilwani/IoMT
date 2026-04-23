import pandas as pd
import joblib
import os
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import accuracy_score, f1_score, classification_report
from sklearn.pipeline import Pipeline

MODEL_NAME                  = "Logistic Regression"
PIPELINE_FILENAME           = "models/logistic_regression_pipeline.joblib"
LABEL_ENCODER_FILENAME      = "models/label_encoder.joblib"
CLEANED_DATA_PATH           = "data/Cleaned/iomt_merged_clean.csv"


def build_logistic_regression_model():
    return Pipeline([
        ("scaler",              StandardScaler()),
        ("logistic_regression", LogisticRegression(
            max_iter=1000,
            class_weight="balanced",
            random_state=42,
            n_jobs=-1,
            solver="lbfgs"
        ))
    ])


def train():
    print(f"Model: {MODEL_NAME}\n")

    if not os.path.exists(CLEANED_DATA_PATH):
        raise FileNotFoundError(f"Cleaned data not found: {CLEANED_DATA_PATH}\nRun Clean_code.py first.")

    df = pd.read_csv(CLEANED_DATA_PATH)
    features = [c for c in df.columns if c != "attack_type"]

    label_encoder = LabelEncoder()
    y = label_encoder.fit_transform(df["attack_type"])
    X = df[features]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    lr_model = build_logistic_regression_model()
    lr_model.fit(X_train, y_train)
    y_pred = lr_model.predict(X_test)

    accuracy    = accuracy_score(y_test, y_pred)
    macro_f1    = f1_score(y_test, y_pred, average="macro")
    weighted_f1 = f1_score(y_test, y_pred, average="weighted")

    print(f"Accuracy     : {accuracy * 100:.4f}%")
    print(f"Macro F1     : {macro_f1:.4f}")
    print(f"Weighted F1  : {weighted_f1:.4f}")
    print()
    print(classification_report(y_test, y_pred, target_names=label_encoder.classes_))

    os.makedirs("models", exist_ok=True)
    joblib.dump(lr_model,      PIPELINE_FILENAME)
    joblib.dump(label_encoder, LABEL_ENCODER_FILENAME)

    print(f"Saved: {PIPELINE_FILENAME}")
    print(f"Saved: {LABEL_ENCODER_FILENAME}")


if __name__ == "__main__":
    train()
