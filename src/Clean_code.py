import pandas as pd
import os

SELECTED_FEATURES = [
    "Protocol_Type", "TCP", "UDP", "ICMP", "ARP",
    "syn_flag_number", "rst_flag_number", "ack_flag_number",
    "psh_flag_number", "syn_count", "fin_count",
    "Rate", "Duration", "Header_Length",
    "Max", "Variance", "Magnitude",
    "HTTPS", "attack_type",
]

KEEP_COLS = set(SELECTED_FEATURES) - {"attack_type", "Protocol_Type", "Magnitude"}

INPUT_FILES = {
    "ARP_Spoofing":            "datasets/ARP_Spoofing_train_pcap.csv",
    "Recon-Port_Scan":         "datasets/Recon-Port_Scan_train_pcap.csv",
    "TCP_IP-DoS-ICMP1":        "datasets/TCP_IP-DoS-ICMP1_train_pcap.csv",
    "Benign":                  "datasets/benign-trainpcap.csv",
    "MQTT-DDoS-Connect-Flood": "datasets/mqtt-ddos-connect-flood-trainpcap.csv",
}

OUTPUT_PATH = "Cleaned/iomt_merged_clean.csv"


def clean_file(label, path):
    df = pd.read_csv(path)
    df.drop_duplicates(inplace=True)
    zero_var = [c for c in df.columns if df[c].std() == 0 and c not in KEEP_COLS]
    df.drop(columns=zero_var, inplace=True)
    for col in ["Rate", "Srate"]:
        if col in df.columns:
            df[col] = df[col].clip(upper=df[col].quantile(0.999))
    df = df[df["Rate"] > 0].reset_index(drop=True)
    if "Header_Length" in df.columns:
        df["Header_Length"] = df["Header_Length"].clip(upper=df["Header_Length"].quantile(0.99))
    if "Duration" in df.columns:
        df["Duration"] = df["Duration"].clip(upper=df["Duration"].quantile(0.999))
    df["attack_type"] = label
    df.rename(columns={"Protocol Type": "Protocol_Type", "Magnitue": "Magnitude"}, inplace=True)
    return df[SELECTED_FEATURES]


def main():
    dfs = []
    for label, path in INPUT_FILES.items():
        if not os.path.exists(path):
            raise FileNotFoundError(f"Missing: {path}")
        dfs.append(clean_file(label, path))

    merged = pd.concat(dfs, ignore_index=True)
    os.makedirs("Cleaned", exist_ok=True)
    merged.to_csv(OUTPUT_PATH, index=False)
    print(f"Saved: {OUTPUT_PATH}  ({len(merged):,} rows)")


if __name__ == "__main__":
    main()
