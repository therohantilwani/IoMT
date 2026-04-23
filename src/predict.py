import pandas as pd
import pickle
import sys


def load_logistic_regression_model(model_path="models/logistic_regression_iomt.pkl"):
    with open(model_path, "rb") as f:
        bundle = pickle.load(f)
    return bundle["model"], bundle["label_encoder"], bundle["features"]


def predict(input_path, model_path="models/logistic_regression_iomt.pkl"):
    lr_model, label_encoder, features = load_logistic_regression_model(model_path)

    df = pd.read_csv(input_path)
    df.rename(columns={"Protocol Type": "Protocol_Type", "Magnitue": "Magnitude"}, inplace=True)

    missing = [f for f in features if f not in df.columns]
    if missing:
        raise ValueError(f"Input file is missing columns: {missing}")

    X = df[features]
    lr_predictions     = lr_model.predict(X)
    lr_probabilities   = lr_model.predict_proba(X)

    df["predicted_attack"] = label_encoder.inverse_transform(lr_predictions)
    df["confidence"]       = lr_probabilities.max(axis=1).round(4)

    output_path = input_path.replace(".csv", "_predictions.csv")
    df.to_csv(output_path, index=False)
    print(f"Logistic Regression predictions saved to: {output_path}")

    print("\nPrediction summary:")
    print(df["predicted_attack"].value_counts().to_string())

    return df


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python src/predict.py <path_to_csv>")
        print("Example: python src/predict.py data/new_traffic.csv")
        sys.exit(1)
    predict(sys.argv[1])
