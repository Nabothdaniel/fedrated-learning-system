import sqlite3
import os
from typing import Dict, Any, List

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data.db")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. System Config Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS system_config (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        num_sites INTEGER NOT NULL DEFAULT 5,
        training_days INTEGER NOT NULL DEFAULT 30,
        fl_rounds INTEGER NOT NULL DEFAULT 10,
        local_epochs INTEGER NOT NULL DEFAULT 2,
        seq_length INTEGER NOT NULL DEFAULT 24,
        learning_rate REAL NOT NULL DEFAULT 0.001,
        aggregation_alg TEXT NOT NULL DEFAULT 'FedAvg',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Seed initial config row if missing
    cursor.execute("SELECT COUNT(*) FROM system_config")
    if cursor.fetchone()[0] == 0:
        cursor.execute("""
        INSERT INTO system_config (id, num_sites, training_days, fl_rounds, local_epochs, seq_length, learning_rate, aggregation_alg)
        VALUES (1, 5, 30, 10, 2, 24, 0.001, 'FedAvg')
        """)

    # 2. Pipeline Execution History Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS pipeline_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        run_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        num_sites INTEGER NOT NULL,
        fl_rounds INTEGER NOT NULL,
        avg_fl_mae REAL,
        avg_cent_mae REAL,
        avg_fl_r2 REAL,
        cum_comm_mb REAL,
        status TEXT NOT NULL DEFAULT 'completed'
    );
    """)

    # 3. Distributed PV Nodes Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS site_nodes (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        icon TEXT NOT NULL,
        mae TEXT NOT NULL,
        payload TEXT NOT NULL,
        participation TEXT NOT NULL,
        compute TEXT NOT NULL,
        trend TEXT NOT NULL
    );
    """)

    # Seed initial site nodes if missing
    cursor.execute("SELECT COUNT(*) FROM site_nodes")
    if cursor.fetchone()[0] == 0:
        initial_nodes = [
            ("site_0", "Solar Farm CA-1", "☀️", "2.61 MW", "2.45", "25.0%", "65%", "-12.8%"),
            ("site_1", "Solar Farm TX-2", "☀️", "2.83 MW", "1.92", "20.1%", "58%", "-9.4%"),
            ("site_2", "Solar Farm NV-3", "⏳", "3.10 MW", "3.01", "18.5%", "72%", "-15.2%"),
            ("site_3", "Solar Farm AZ-4", "☀️", "2.55 MW", "2.10", "36.4%", "49%", "-11.0%"),
            ("site_4", "Solar Farm FL-5", "☀️", "2.48 MW", "2.22", "22.0%", "61%", "-13.5%"),
        ]
        cursor.executemany("""
        INSERT INTO site_nodes (id, name, icon, mae, payload, participation, compute, trend)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, initial_nodes)

    conn.commit()
    conn.close()

def get_config() -> Dict[str, Any]:
    conn = get_db_connection()
    row = conn.execute("SELECT * FROM system_config WHERE id = 1").fetchone()
    conn.close()
    if row:
        return dict(row)
    return {
        "num_sites": 5,
        "training_days": 30,
        "fl_rounds": 10,
        "local_epochs": 2,
        "seq_length": 24,
        "learning_rate": 0.001,
        "aggregation_alg": "FedAvg"
    }

def update_config(new_config: Dict[str, Any]) -> Dict[str, Any]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    UPDATE system_config
    SET num_sites = ?,
        training_days = ?,
        fl_rounds = ?,
        local_epochs = ?,
        seq_length = ?,
        learning_rate = ?,
        aggregation_alg = ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = 1
    """, (
        int(new_config.get("num_sites", 5)),
        int(new_config.get("training_days", new_config.get("sim_days", 30))),
        int(new_config.get("fl_rounds", 10)),
        int(new_config.get("local_epochs", 2)),
        int(new_config.get("seq_length", 24)),
        float(new_config.get("learning_rate", 0.001)),
        str(new_config.get("aggregation_alg", "FedAvg"))
    ))
    conn.commit()
    conn.close()
    return get_config()

def get_nodes() -> List[Dict[str, Any]]:
    conn = get_db_connection()
    rows = conn.execute("SELECT * FROM site_nodes").fetchall()
    conn.close()
    return [dict(r) for r in rows]

def log_pipeline_run(num_sites: int, fl_rounds: int, avg_fl_mae: float, avg_cent_mae: float, avg_fl_r2: float, cum_comm_mb: float, status: str = "completed"):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO pipeline_history (num_sites, fl_rounds, avg_fl_mae, avg_cent_mae, avg_fl_r2, cum_comm_mb, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (num_sites, fl_rounds, avg_fl_mae, avg_cent_mae, avg_fl_r2, cum_comm_mb, status))
    conn.commit()
    conn.close()

def get_pipeline_history() -> List[Dict[str, Any]]:
    conn = get_db_connection()
    rows = conn.execute("SELECT * FROM pipeline_history ORDER BY id DESC LIMIT 20").fetchall()
    conn.close()
    return [dict(r) for r in rows]
