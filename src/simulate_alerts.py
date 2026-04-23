import os
import sys
import json
import random
import pandas as pd
from datetime import datetime, timedelta

def load_data():
    base_path = "data/Cleaned"
    files = [
        ("ARP_Spoofing", "ARP_Spoofing_cleaned.csv"),
        ("Recon-Port_Scan", "Recon-Port_Scan_cleaned.csv"),
        ("TCP_IP-DoS-ICMP1", "TCP_IP-DoS-ICMP1_cleaned.csv"),
        ("Benign", "benign-trainpcap-2026-03-30.csv"),
        ("MQTT-DDoS-Connect-Flood", "mqtt-ddos-connect-flood-trainpcap-2026-03-30.csv")
    ]
    
    alerts = []
    
    # Let's take the last 24 hours
    now = datetime.fromisoformat("2026-04-16T12:00:00")
    
    for label, filename in files:
        filepath = os.path.join(base_path, filename)
        if not os.path.exists(filepath):
            print(f"Skipping {filepath}, file not found")
            continue
            
        print(f"Loading {filepath}...")
        df = pd.read_csv(filepath)
        
        # sample points
        n_samples = 40 if label != "Benign" else 100
        n_samples = min(n_samples, len(df))
        
        sampled = df.sample(n=n_samples, random_state=42)
        
        for idx, row in sampled.iterrows():
            # generate random time within 24h
            rand_secs = random.randint(0, 86400)
            alert_time = now - timedelta(seconds=rand_secs)
            
            # Confidence
            conf = round(random.uniform(0.92, 0.99), 4) if label != "Benign" else round(random.uniform(0.85, 0.95), 4)
            
            alerts.append({
                "id": f"evt_{random.randint(10000, 99999)}",
                "timestamp": alert_time.isoformat() + "Z",
                "attack_type": label if label != "Benign" else "None",
                "confidence": conf,
                "severity": "high" if "DoS" in label or "Flood" in label else ("medium" if label != "Benign" else "low"),
                "details": {
                    "Protocol": row.get("Protocol", "TCP/UDP"),
                    "Rate": float(row.get("Rate", 0)) if "Rate" in row else 0,
                    "Magnitue": float(row.get("Magnitude", row.get("Magnitue", 0))),
                    "syn_flag": int(row.get("syn_flag_number", 0)) if "syn_flag_number" in row else 0
                }
            })
            
    alerts.sort(key=lambda x: x["timestamp"], reverse=True)
    return alerts

def main():
    alerts = load_data()
    
    # Filter threats to show in alert feed
    threats = [a for a in alerts if a["attack_type"] != "None"]
    
    print(f"Generated {len(alerts)} events ({len(threats)} threats)")
    
    # Metrics
    metrics = {
        "totalTraffic": 1420500,
        "blockedAttacks": len(threats) * 23, # scaled up for dash
        "accuracy": 0.9848,
        "activeThreats": 4,
        "breakdown": {
            "ARP_Spoofing": sum(1 for a in threats if a["attack_type"] == "ARP_Spoofing"),
            "Recon_Port_Scan": sum(1 for a in threats if "Recon" in a["attack_type"]),
            "DoS_ICMP": sum(1 for a in threats if "DoS-ICMP" in a["attack_type"]),
            "MQTT_Flood": sum(1 for a in threats if "Flood" in a["attack_type"])
        }
    }
    
    os.makedirs("dashboard/data", exist_ok=True)
    with open("dashboard/data/alerts.json", "w") as f:
        json.dump(threats, f, indent=2)
        
    with open("dashboard/data/metrics.json", "w") as f:
        json.dump(metrics, f, indent=2)
        
    print("Saved to dashboard/data/alerts.json and metrics.json")

if __name__ == "__main__":
    main()
