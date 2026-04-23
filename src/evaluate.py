import pandas as pd
import pickle
import sys
from sklearn.metrics import accuracy_score, f1_score, classification_report, confusion_matrix


def load_logistic_regression_model(model_path="models/logistic_regression_iomt.pkl"):
    with open(model_path, "rb") as f:
        bundle = pickle.load(f)
    return bundle["model"], bundle["label_encoder"], bundle["features"]


def evaluate(input_path, model_path="models/logistic_regression_iomt.pkl"):
    lr_model, label_encoder, features = load_logistic_regression_model(model_path)

    df = pd.read_csv(input_path)
    df.rename(columns={"Protocol Type": "Protocol_Type", "Magnitue": "Magnitude"}, inplace=True)

    if "attack_type" not in df.columns:
        raise ValueError("Input file must have an 'attack_type' column for evaluation.")

    X      = df[features]
    y_true = label_encoder.transform(df["attack_type"])
    y_pred = lr_model.predict(X)

    accuracy    = accuracy_score(y_true, y_pred)
    macro_f1    = f1_score(y_true, y_pred, average="macro")
    weighted_f1 = f1_score(y_true, y_pred, average="weighted")

    print("Model: Logistic Regression\n")
    print(f"Accuracy     : {accuracy * 100:.4f}%")
    print(f"Macro F1     : {macro_f1:.4f}")
    print(f"Weighted F1  : {weighted_f1:.4f}")
    print()
    print(classification_report(y_true, y_pred, target_names=label_encoder.classes_))
    print("Confusion Matrix:")
    print(confusion_matrix(y_true, y_pred))


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python src/evaluate.py <path_to_labeled_csv>")
        print("Example: python src/evaluate.py data/iomt_merged_clean.csv")
        sys.exit(1)
    evaluate(sys.argv[1])
