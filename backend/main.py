import os
import io
import csv
from datetime import datetime
from typing import Optional

from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi.staticfiles import StaticFiles
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel

import database as db

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

ACCESS_TOKEN = os.getenv("ACCESS_TOKEN", "")
STATIC_DIR = os.getenv("STATIC_DIR", "../frontend/dist")
PORT = int(os.getenv("PORT", "8000"))

if not ACCESS_TOKEN:
    raise RuntimeError("ACCESS_TOKEN is not set in .env")

# ---------------------------------------------------------------------------
# App setup
# ---------------------------------------------------------------------------

app = FastAPI(title="Family Asset Tracker API")

# Allow all origins in dev (FE on :3000, BE on :8000).
# In production FE is served from the same origin so CORS is irrelevant,
# but keeping it here avoids pain during local development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

db.init_db()

# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------

bearer_scheme = HTTPBearer()


def verify_token(credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)):
    if credentials.credentials != ACCESS_TOKEN:
        raise HTTPException(status_code=401, detail="Invalid token")
    return credentials.credentials


# ---------------------------------------------------------------------------
# Pydantic models
# ---------------------------------------------------------------------------

class SettingsUpdate(BaseModel):
    defaultCurrency: Optional[str] = None
    language: Optional[str] = None
    logoUrl: Optional[str] = None


class OwnerCreate(BaseModel):
    id: str
    name: str


class OwnerUpdate(BaseModel):
    name: str


class CategoryCreate(BaseModel):
    id: str
    name: str
    type: str
    color: str


class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    color: Optional[str] = None


class AccountCreate(BaseModel):
    id: str
    name: str
    currency: str
    categoryId: str
    ownerId: str


class AccountUpdate(BaseModel):
    name: Optional[str] = None
    currency: Optional[str] = None
    categoryId: Optional[str] = None
    ownerId: Optional[str] = None


class RecordCreate(BaseModel):
    id: str
    date: str
    accountId: str
    amount: float
    timestamp: int
    note: Optional[str] = None


class RecordUpdate(BaseModel):
    date: Optional[str] = None
    accountId: Optional[str] = None
    amount: Optional[float] = None
    timestamp: Optional[int] = None
    note: Optional[str] = None


class RestorePayload(BaseModel):
    metadata: Optional[dict] = None
    records: list
    accounts: list
    categories: list
    owners: list


# ---------------------------------------------------------------------------
# Routes — Auth
# ---------------------------------------------------------------------------

@app.get("/api/auth/verify")
def auth_verify(token: str = Depends(verify_token)):
    return {"ok": True}


# ---------------------------------------------------------------------------
# Routes — Settings
# ---------------------------------------------------------------------------

@app.get("/api/settings")
def get_settings(token: str = Depends(verify_token)):
    return db.get_settings()


@app.put("/api/settings")
def put_settings(payload: SettingsUpdate, token: str = Depends(verify_token)):
    return db.update_settings(payload.model_dump(exclude_none=False))


# ---------------------------------------------------------------------------
# Routes — Owners
# ---------------------------------------------------------------------------

@app.get("/api/owners")
def get_owners(token: str = Depends(verify_token)):
    return db.list_owners()


@app.post("/api/owners", status_code=201)
def post_owner(body: OwnerCreate, token: str = Depends(verify_token)):
    return db.create_owner(body.id, body.name)


@app.put("/api/owners/{id}")
def put_owner(id: str, body: OwnerUpdate, token: str = Depends(verify_token)):
    result = db.update_owner(id, body.name)
    if result is None:
        raise HTTPException(status_code=404, detail="Owner not found")
    return result


@app.delete("/api/owners/{id}", status_code=204)
def del_owner(id: str, token: str = Depends(verify_token)):
    ok = db.delete_owner(id)
    if not ok:
        raise HTTPException(status_code=409, detail="Owner is referenced by one or more accounts")


# ---------------------------------------------------------------------------
# Routes — Categories
# ---------------------------------------------------------------------------

@app.get("/api/categories")
def get_categories(token: str = Depends(verify_token)):
    return db.list_categories()


@app.post("/api/categories", status_code=201)
def post_category(body: CategoryCreate, token: str = Depends(verify_token)):
    return db.create_category(body.id, body.name, body.type, body.color)


@app.put("/api/categories/{id}")
def put_category(id: str, body: CategoryUpdate, token: str = Depends(verify_token)):
    result = db.update_category(id, body.model_dump(exclude_none=True))
    if result is None:
        raise HTTPException(status_code=404, detail="Category not found")
    return result


@app.delete("/api/categories/{id}", status_code=204)
def del_category(id: str, token: str = Depends(verify_token)):
    ok = db.delete_category(id)
    if not ok:
        raise HTTPException(status_code=409, detail="Category is referenced by one or more accounts")


# ---------------------------------------------------------------------------
# Routes — Accounts
# ---------------------------------------------------------------------------

@app.get("/api/accounts")
def get_accounts(token: str = Depends(verify_token)):
    return db.list_accounts()


@app.post("/api/accounts", status_code=201)
def post_account(body: AccountCreate, token: str = Depends(verify_token)):
    return db.create_account(body.id, body.name, body.currency, body.categoryId, body.ownerId)


@app.put("/api/accounts/{id}")
def put_account(id: str, body: AccountUpdate, token: str = Depends(verify_token)):
    result = db.update_account(id, body.model_dump(exclude_none=True))
    if result is None:
        raise HTTPException(status_code=404, detail="Account not found")
    return result


@app.delete("/api/accounts/{id}", status_code=204)
def del_account(id: str, token: str = Depends(verify_token)):
    ok = db.delete_account(id)
    if not ok:
        raise HTTPException(status_code=409, detail="Account has existing records")


# ---------------------------------------------------------------------------
# Routes — Records
# ---------------------------------------------------------------------------

@app.get("/api/records")
def get_records(
    token: str = Depends(verify_token),
    accountId: Optional[str] = Query(None),
    from_date: Optional[str] = Query(None, alias="from"),
    to_date: Optional[str] = Query(None, alias="to"),
):
    return db.list_records(accountId, from_date, to_date)


@app.post("/api/records", status_code=201)
def post_record(body: RecordCreate, token: str = Depends(verify_token)):
    return db.create_record(body.id, body.date, body.accountId, body.amount, body.timestamp, body.note)


@app.put("/api/records/{id}")
def put_record(id: str, body: RecordUpdate, token: str = Depends(verify_token)):
    result = db.update_record(id, body.model_dump(exclude_none=True))
    if result is None:
        raise HTTPException(status_code=404, detail="Record not found")
    return result


@app.delete("/api/records/{id}", status_code=204)
def del_record(id: str, token: str = Depends(verify_token)):
    db.delete_record(id)


# ---------------------------------------------------------------------------
# Routes — Backup / Restore / CSV export
# ---------------------------------------------------------------------------

@app.get("/api/backup")
def get_backup(token: str = Depends(verify_token)):
    return {
        "metadata": {
            "version": "2.0",
            "timestamp": int(datetime.utcnow().timestamp() * 1000),
            "exportDate": datetime.utcnow().isoformat(),
        },
        "records": db.list_records(),
        "accounts": db.list_accounts(),
        "categories": db.list_categories(),
        "owners": db.list_owners(),
    }


@app.post("/api/restore", status_code=204)
def post_restore(payload: RestorePayload, token: str = Depends(verify_token)):
    db.restore_all(payload.model_dump())


def _escape_csv(value) -> str:
    if value is None:
        return ""
    s = str(value)
    if any(c in s for c in (',', '"', '\n')):
        return '"' + s.replace('"', '""') + '"'
    return s


@app.get("/api/export/csv")
def get_export_csv(token: str = Depends(verify_token)):
    records = db.list_records()
    accounts = db.list_accounts()
    categories = db.list_categories()
    owners = db.list_owners()

    acc_map = {a["id"]: a for a in accounts}
    cat_map = {c["id"]: c for c in categories}
    own_map = {o["id"]: o for o in owners}

    headers = [
        "Date",
        "Account Name", "Account ID",
        "Owner Name", "Owner ID",
        "Category Name", "Category ID",
        "Amount", "Currency", "Note", "Record ID",
    ]

    output = io.StringIO()
    output.write(",".join(headers) + "\n")
    for r in records:
        acc = acc_map.get(r["accountId"], {})
        cat = cat_map.get(acc.get("categoryId", ""), {})
        own = own_map.get(acc.get("ownerId", ""), {})
        row = [
            _escape_csv(r["date"]),
            _escape_csv(acc.get("name", "Unknown")),
            _escape_csv(r["accountId"]),
            _escape_csv(own.get("name", "Unknown")),
            _escape_csv(acc.get("ownerId", "")),
            _escape_csv(cat.get("name", "Unknown")),
            _escape_csv(acc.get("categoryId", "")),
            _escape_csv(r["amount"]),
            _escape_csv(acc.get("currency", "")),
            _escape_csv(r.get("note")),
            _escape_csv(r["id"]),
        ]
        output.write(",".join(row) + "\n")

    date_str = datetime.utcnow().strftime("%Y-%m-%d")
    filename = f"family_asset_tracker_{date_str}.csv"
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


# ---------------------------------------------------------------------------
# Serve frontend static files (must be last — catch-all)
# ---------------------------------------------------------------------------

if os.path.isdir(STATIC_DIR):
    from starlette.responses import FileResponse

    app.mount("/assets", StaticFiles(directory=os.path.join(STATIC_DIR, "assets")), name="assets")

    # Serve all other files from dist root (icons, manifest, etc.)
    app.mount("/", StaticFiles(directory=STATIC_DIR, html=True), name="static")
