from flask import Flask, send_from_directory, request, jsonify
from collections import Counter
import json
import os
import requests

app = Flask(__name__, static_folder='dashboard', static_url_path='')

@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.get_json()
    user_message = data.get('message', '')
    
    context_data = {}
    try:
        with open('dashboard/data/metrics.json', 'r') as f:
            metrics = json.load(f)
            context_data['metrics'] = metrics
    except Exception: pass

    try:
        with open('dashboard/data/alerts.json', 'r') as f:
            alerts = json.load(f)
            attack_counts = Counter([a.get('attack_type') for a in alerts if a.get('attack_type') != 'None'])
            context_data['top_attacks'] = dict(attack_counts.most_common(5))
            context_data['total_alerts'] = len(alerts)
    except Exception: pass

    system_prompt = (
        f"You are an elite AI Cybersecurity Analyst for the IoMT Security Intelligence Dashboard. "
        f"Project Context: You analyze the UNB CIC-IoMT-2024 dataset using a high-performance XGBoost pipeline (99.04% accuracy). "
        f"You detect 4 attacks: ARP_Spoofing, MQTT-DDoS-Connect-Flood, Recon-Port_Scan, and TCP_IP-DoS-ICMP1, plus Benign traffic.\n\n"
        f"CURRENT INTELLIGENCE CONTEXT:\n"
        f"- Total Alerts Analyzed: {context_data.get('total_alerts', 'N/A')}\n"
        f"- Most Frequent Attacks: {json.dumps(context_data.get('top_attacks', {}))}\n"
        f"- System Metrics: {json.dumps(context_data.get('metrics', {}))}\n\n"
        f"DEMO RULES:\n"
        f"1. Be concise, professional, and confident. Never apologize.\n"
        f"2. For device safety: Explain we monitor network protocols. High counts of 'ARP_Spoofing' or 'Recon-Port_Scan' indicate devices are being targeted.\n"
        f"3. For security posture: Suggest blocking high-risk IPs, isolating affected subnets, and updating firmware on vulnerable IoMT nodes.\n"
        f"4. Use the provided JSON metrics to back up your answers."
    )

    prompt = f"{system_prompt}\n\nUser: {user_message}\nAnalyst:"

    try:
        ollama_url = "http://localhost:11434/api/generate"
        payload = {
            "model": "Qwen:latest",
            "prompt": prompt,
            "stream": False,
            "options": { "temperature": 0.3 }
        }
        response = requests.post(ollama_url, json=payload, timeout=45)
        response.raise_for_status()
        reply = response.json().get("response", "I could not generate a response.")
        return jsonify({"reply": reply})
    except Exception as e:
        return jsonify({"reply": f"Error: Ensure Ollama is running (`ollama serve`) and qwen2.5 is pulled (`ollama pull qwen2.5`). Details: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True, port=8000)
