import sqlite3
import os
from typing import Any

DB_PATH = os.getenv("DB_PATH", "../data/db.sqlite")


def get_conn() -> sqlite3.Connection:
    os.makedirs(os.path.dirname(os.path.abspath(DB_PATH)), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db():
    conn = get_conn()
    cur = conn.cursor()

    cur.executescript("""
        CREATE TABLE IF NOT EXISTS settings (
            key   TEXT PRIMARY KEY,
            value TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS owners (
            id   TEXT PRIMARY KEY,
            name TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS categories (
            id    TEXT PRIMARY KEY,
            name  TEXT NOT NULL,
            type  TEXT NOT NULL CHECK(type IN ('ASSET', 'LIABILITY')),
            color TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS accounts (
            id          TEXT PRIMARY KEY,
            name        TEXT NOT NULL,
            currency    TEXT NOT NULL,
            category_id TEXT NOT NULL REFERENCES categories(id),
            owner_id    TEXT NOT NULL REFERENCES owners(id)
        );

        CREATE TABLE IF NOT EXISTS records (
            id         TEXT PRIMARY KEY,
            date       TEXT NOT NULL,
            account_id TEXT NOT NULL REFERENCES accounts(id),
            amount     REAL NOT NULL,
            note       TEXT,
            timestamp  INTEGER NOT NULL
        );
    """)

    # Seed default settings if first run
    cur.execute(
        "INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)",
        ("default_currency", "USD"),
    )
    cur.execute(
        "INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)",
        ("language", "en"),
    )
    # Clean up obsolete keys from prior versions
    cur.execute("DELETE FROM settings WHERE key = 'logo_url'")
    conn.commit()
    conn.close()


# ---------- Settings ----------

def get_settings() -> dict:
    conn = get_conn()
    rows = conn.execute("SELECT key, value FROM settings").fetchall()
    conn.close()
    data = {r["key"]: r["value"] for r in rows}
    return {
        "defaultCurrency": data.get("default_currency", "USD"),
        "language": data.get("language", "en"),
    }


def update_settings(payload: dict):
    conn = get_conn()
    mapping = {
        "defaultCurrency": "default_currency",
        "language": "language",
    }
    for fe_key, db_key in mapping.items():
        if fe_key in payload:
            val = payload[fe_key] if payload[fe_key] is not None else ""
            conn.execute(
                "INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)",
                (db_key, val),
            )
    conn.commit()
    conn.close()
    return get_settings()


# ---------- Owners ----------

def list_owners() -> list:
    conn = get_conn()
    rows = conn.execute("SELECT id, name FROM owners").fetchall()
    conn.close()
    return [dict(r) for r in rows]


def create_owner(id: str, name: str):
    conn = get_conn()
    conn.execute("INSERT INTO owners (id, name) VALUES (?, ?)", (id, name))
    conn.commit()
    row = conn.execute("SELECT id, name FROM owners WHERE id = ?", (id,)).fetchone()
    conn.close()
    return dict(row)


def update_owner(id: str, name: str):
    conn = get_conn()
    conn.execute("UPDATE owners SET name = ? WHERE id = ?", (name, id))
    conn.commit()
    row = conn.execute("SELECT id, name FROM owners WHERE id = ?", (id,)).fetchone()
    conn.close()
    return dict(row) if row else None


def delete_owner(id: str) -> bool:
    conn = get_conn()
    # Check FK usage
    used = conn.execute(
        "SELECT COUNT(*) FROM accounts WHERE owner_id = ?", (id,)
    ).fetchone()[0]
    if used > 0:
        conn.close()
        return False
    conn.execute("DELETE FROM owners WHERE id = ?", (id,))
    conn.commit()
    conn.close()
    return True


# ---------- Categories ----------

def list_categories() -> list:
    conn = get_conn()
    rows = conn.execute("SELECT id, name, type, color FROM categories").fetchall()
    conn.close()
    return [dict(r) for r in rows]


def create_category(id: str, name: str, type: str, color: str):
    conn = get_conn()
    conn.execute(
        "INSERT INTO categories (id, name, type, color) VALUES (?, ?, ?, ?)",
        (id, name, type, color),
    )
    conn.commit()
    row = conn.execute("SELECT id, name, type, color FROM categories WHERE id = ?", (id,)).fetchone()
    conn.close()
    return dict(row)


def update_category(id: str, payload: dict):
    conn = get_conn()
    fields = {k: v for k, v in payload.items() if k in ("name", "type", "color")}
    if fields:
        set_clause = ", ".join(f"{k} = ?" for k in fields)
        conn.execute(
            f"UPDATE categories SET {set_clause} WHERE id = ?",
            (*fields.values(), id),
        )
        conn.commit()
    row = conn.execute("SELECT id, name, type, color FROM categories WHERE id = ?", (id,)).fetchone()
    conn.close()
    return dict(row) if row else None


def delete_category(id: str) -> bool:
    conn = get_conn()
    used = conn.execute(
        "SELECT COUNT(*) FROM accounts WHERE category_id = ?", (id,)
    ).fetchone()[0]
    if used > 0:
        conn.close()
        return False
    conn.execute("DELETE FROM categories WHERE id = ?", (id,))
    conn.commit()
    conn.close()
    return True


# ---------- Accounts ----------

def list_accounts() -> list:
    conn = get_conn()
    rows = conn.execute("""
        SELECT a.id, a.name, a.currency, a.category_id, a.owner_id,
               r.amount AS latest_amount, r.date AS latest_date
        FROM accounts a
        LEFT JOIN (
            SELECT account_id, MAX(timestamp) AS max_ts
            FROM records
            GROUP BY account_id
        ) lts ON a.id = lts.account_id
        LEFT JOIN records r ON r.account_id = lts.account_id AND r.timestamp = lts.max_ts
    """).fetchall()
    conn.close()
    return [_account_row(r) for r in rows]


def _account_row(r) -> dict:
    result = {
        "id": r["id"],
        "name": r["name"],
        "currency": r["currency"],
        "categoryId": r["category_id"],
        "ownerId": r["owner_id"],
    }
    try:
        latest_amount = r["latest_amount"]
        if latest_amount is not None:
            result["latestAmount"] = latest_amount
            result["latestDate"] = r["latest_date"]
    except (IndexError, KeyError):
        pass
    return result


def create_account(id: str, name: str, currency: str, category_id: str, owner_id: str):
    conn = get_conn()
    conn.execute(
        "INSERT INTO accounts (id, name, currency, category_id, owner_id) VALUES (?, ?, ?, ?, ?)",
        (id, name, currency, category_id, owner_id),
    )
    conn.commit()
    row = conn.execute("SELECT id, name, currency, category_id, owner_id FROM accounts WHERE id = ?", (id,)).fetchone()
    conn.close()
    return _account_row(row)


def update_account(id: str, payload: dict):
    conn = get_conn()
    col_map = {"name": "name", "currency": "currency", "categoryId": "category_id", "ownerId": "owner_id"}
    fields = {col_map[k]: v for k, v in payload.items() if k in col_map}
    if fields:
        set_clause = ", ".join(f"{k} = ?" for k in fields)
        conn.execute(
            f"UPDATE accounts SET {set_clause} WHERE id = ?",
            (*fields.values(), id),
        )
        conn.commit()
    row = conn.execute("SELECT id, name, currency, category_id, owner_id FROM accounts WHERE id = ?", (id,)).fetchone()
    conn.close()
    return _account_row(row) if row else None


def delete_account(id: str) -> bool:
    conn = get_conn()
    used = conn.execute(
        "SELECT COUNT(*) FROM records WHERE account_id = ?", (id,)
    ).fetchone()[0]
    if used > 0:
        conn.close()
        return False
    conn.execute("DELETE FROM accounts WHERE id = ?", (id,))
    conn.commit()
    conn.close()
    return True


# ---------- Records ----------

def list_monthly_summaries() -> list:
    """Return the latest record per account per month — one row per (account, month)."""
    conn = get_conn()
    rows = conn.execute("""
        SELECT r.account_id, SUBSTR(r.date, 1, 7) AS month, r.amount, r.date
        FROM records r
        INNER JOIN (
            SELECT account_id, SUBSTR(date, 1, 7) AS month, MAX(timestamp) AS max_ts
            FROM records
            GROUP BY account_id, SUBSTR(date, 1, 7)
        ) latest ON r.account_id = latest.account_id
            AND SUBSTR(r.date, 1, 7) = latest.month
            AND r.timestamp = latest.max_ts
        ORDER BY r.date ASC
    """).fetchall()
    conn.close()
    return [
        {"accountId": r["account_id"], "month": r["month"], "amount": r["amount"], "date": r["date"]}
        for r in rows
    ]


def list_records(account_id: str | None = None, from_date: str | None = None, to_date: str | None = None) -> list:
    conn = get_conn()
    query = "SELECT id, date, account_id, amount, note, timestamp FROM records WHERE 1=1"
    params: list[Any] = []
    if account_id:
        query += " AND account_id = ?"
        params.append(account_id)
    if from_date:
        query += " AND date >= ?"
        params.append(from_date)
    if to_date:
        query += " AND date <= ?"
        params.append(to_date)
    query += " ORDER BY timestamp DESC"
    rows = conn.execute(query, params).fetchall()
    conn.close()
    return [_record_row(r) for r in rows]


def _record_row(r) -> dict:
    return {
        "id": r["id"],
        "date": r["date"],
        "accountId": r["account_id"],
        "amount": r["amount"],
        "note": r["note"],
        "timestamp": r["timestamp"],
    }


def create_record(id: str, date: str, account_id: str, amount: float, timestamp: int, note: str | None = None):
    conn = get_conn()
    conn.execute(
        "INSERT INTO records (id, date, account_id, amount, note, timestamp) VALUES (?, ?, ?, ?, ?, ?)",
        (id, date, account_id, amount, note, timestamp),
    )
    conn.commit()
    row = conn.execute("SELECT id, date, account_id, amount, note, timestamp FROM records WHERE id = ?", (id,)).fetchone()
    conn.close()
    return _record_row(row)


def update_record(id: str, payload: dict):
    conn = get_conn()
    col_map = {"date": "date", "accountId": "account_id", "amount": "amount", "note": "note", "timestamp": "timestamp"}
    fields = {col_map[k]: v for k, v in payload.items() if k in col_map}
    if fields:
        set_clause = ", ".join(f"{k} = ?" for k in fields)
        conn.execute(
            f"UPDATE records SET {set_clause} WHERE id = ?",
            (*fields.values(), id),
        )
        conn.commit()
    row = conn.execute("SELECT id, date, account_id, amount, note, timestamp FROM records WHERE id = ?", (id,)).fetchone()
    conn.close()
    return _record_row(row) if row else None


def delete_record(id: str):
    conn = get_conn()
    conn.execute("DELETE FROM records WHERE id = ?", (id,))
    conn.commit()
    conn.close()


# ---------- Bulk restore ----------

def restore_all(backup: dict):
    """Replace all data with backup contents. Runs in a single transaction."""
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("PRAGMA foreign_keys = OFF")
    try:
        cur.execute("DELETE FROM records")
        cur.execute("DELETE FROM accounts")
        cur.execute("DELETE FROM categories")
        cur.execute("DELETE FROM owners")

        for o in backup.get("owners", []):
            cur.execute("INSERT INTO owners (id, name) VALUES (?, ?)", (o["id"], o["name"]))

        for c in backup.get("categories", []):
            cur.execute(
                "INSERT INTO categories (id, name, type, color) VALUES (?, ?, ?, ?)",
                (c["id"], c["name"], c["type"], c["color"]),
            )

        for a in backup.get("accounts", []):
            cur.execute(
                "INSERT INTO accounts (id, name, currency, category_id, owner_id) VALUES (?, ?, ?, ?, ?)",
                (a["id"], a["name"], a["currency"], a["categoryId"], a["ownerId"]),
            )

        for r in backup.get("records", []):
            cur.execute(
                "INSERT INTO records (id, date, account_id, amount, note, timestamp) VALUES (?, ?, ?, ?, ?, ?)",
                (r["id"], r["date"], r["accountId"], r["amount"], r.get("note"), r["timestamp"]),
            )

        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        cur.execute("PRAGMA foreign_keys = ON")
        conn.close()
