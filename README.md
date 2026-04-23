# IoMT Attack Detection — Logistic Regression Classifier

Multi-class attack detection for Internet of Medical Things (IoMT) network traffic.  
Dataset: [CIC-IoMT 2024](https://www.unb.ca/cic/datasets/iomt-dataset-2024.html) — University of New Brunswick

## Detects

| Class | Description |
|---|---|
| ARP_Spoofing | Layer-2 man-in-the-middle via forged ARP replies |
| Benign | Normal network traffic |
| MQTT-DDoS-Connect-Flood | MQTT protocol connection flood |
| Recon-Port_Scan | Network reconnaissance via port scanning |
| TCP_IP-DoS-ICMP1 | ICMP flood denial-of-service attack |

## Results

| Metric | Score |
|---|---|
| Accuracy | 95.49% |
| Macro F1 | 0.8916 |
| Weighted F1 | 0.9576 |

## Project structure

```
├── Cleaned/                                    # Cleaned merged CSV (generated)
├── datasets/                                   # Raw CSV files (not tracked in git)
├── reports/                                    # Figures, outputs
├── src/
│   ├── models/
│   │   ├── logistic_regression_pipeline.joblib
│   │   └── label_encoder.joblib
│   ├── Clean_code.py                           # Step 1: clean and merge raw data
│   └── train.py                                # Step 2: train model, print metrics
├── .gitignore
├── README.md
└── requirements.txt
```

## Setup

```bash
pip install -r requirements.txt
```

## Usage

### Step 1 — Clean the data

Place the 5 raw CSV files in `datasets/` then run:

```bash
python src/Clean_code.py
```

Output: `Cleaned/iomt_merged_clean.csv`

### Step 2 — Train the model

```bash
python src/train.py
```

Output: `src/models/logistic_regression_pipeline.joblib` and `src/models/label_encoder.joblib`

### Load the model in your own script

```python
import joblib

lr_model      = joblib.load("src/models/logistic_regression_pipeline.joblib")
label_encoder = joblib.load("src/models/label_encoder.joblib")

predictions = lr_model.predict(X_new)
labels      = label_encoder.inverse_transform(predictions)
```
