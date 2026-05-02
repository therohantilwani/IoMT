# IoMT Security Intelligence

Real-time threat detection and monitoring dashboard for Internet of Medical Things (IoMT) networks. Powered by a machine learning pipeline trained on the CIC-IoMT-2024 dataset.

## Features

- **Live Threat Monitoring** — Real-time classification of network traffic into attack types and benign flows
- **AI Security Analyst** — Contextual AI assistant powered by local Qwen models via Ollama
- **Attack Analytics** — Confusion matrices, classification reports, and threat distribution charts
- **Export Reports** — Download threat data as CSV for further analysis

## Screenshots

<img width="1917" height="895" alt="1" src="https://github.com/user-attachments/assets/fbd6af4e-9fe3-4dfa-8d7c-56862c6d9ce3" /> </n>


<img width="539" height="614" alt="2" src="https://github.com/user-attachments/assets/d47abe56-eca6-49c1-8ab6-6c7b152ee42c" /> </n>


<img width="539" height="614" alt="3" src="https://github.com/user-attachments/assets/323c57b3-a005-4199-873b-825acabf3491" /> </n>


<img width="1917" height="897" alt="4" src="https://github.com/user-attachments/assets/44a47570-6da9-4e50-a355-039d3eedc066" /> </n>


<img width="1917" height="897" alt="5" src="https://github.com/user-attachments/assets/8e1dae8f-a317-4de5-8679-5e8846214a54" /> </n>


<img width="1917" height="897" alt="6" src="https://github.com/user-attachments/assets/e7ec62d2-8ae0-4912-ae4f-3058148eedb9" /> </n>



## Attack Types

| Attack | Description |
|---|---|
| ARP_Spoofing | Layer-2 man-in-the-middle via forged ARP replies |
| Benign | Normal network traffic |
| MQTT-DDoS-Connect-Flood | MQTT protocol connection flood |
| Recon-Port_Scan | Network reconnaissance via port scanning |
| TCP_IP-DoS-ICMP1 | ICMP flood denial-of-service attack |

## Quick Start

### Prerequisites

- Python 3.10+
- [Ollama](https://ollama.com) (for AI Assistant)
- Qwen model: `ollama pull qwen2.5:latest` or `ollama pull Qwen:latest`

### Install

```bash
pip install flask requests
```

### Run

```bash
python app.py
```

Open [http://127.0.0.1:8000](http://127.0.0.1:8000)

## AI Assistant

Click the AI Assist bubble in the bottom-right corner to ask contextual questions about:
- Most frequent attack types
- Security posture recommendations
- Device safety assessments

The assistant runs locally via Ollama with no data sent externally.

## Project Structure

```
├── app.py                    # Flask backend + AI chat endpoint
├── dashboard/                # Frontend dashboard
│   ├── index.html
│   ├── styles.css
│   ├── app.js
│   └── data/                 # Metrics and alert data
├── src/                      # ML pipeline scripts
├── models/                   # Trained model files
├── data/                     # Cleaned dataset files
└── requirements.txt
```

## Model Performance

| Metric | Score |
|---|---|
| Accuracy | 99.04% |
| Macro F1 | 0.91 |
| MQTT-DDoS F1 | 1.00 |
| TCP_IP-DoS F1 | 1.00 |
