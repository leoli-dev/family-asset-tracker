"""Run with: python -m unittest discover -s backend/tests (requires httpx)."""
import importlib.util
import os
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch

from fastapi.testclient import TestClient


class FrontendRoutesTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.temp = tempfile.TemporaryDirectory()
        root = Path(cls.temp.name)
        (root / "assets").mkdir()
        (root / "index.html").write_text('<div id="root">test app</div>')
        cls.env = patch.dict(os.environ, {
            "STATIC_DIR": str(root),
            "DB_PATH": str(root / "test.sqlite"),
            "ACCESS_TOKEN": "test-only",
        })
        cls.env.start()
        backend = Path(__file__).resolve().parents[1]
        sys.path.insert(0, str(backend))
        import database
        cls.db_path = patch.object(database, "DB_PATH", str(root / "test.sqlite"))
        cls.db_path.start()
        spec = importlib.util.spec_from_file_location("fat_test_server", backend / "main.py")
        server = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(server)
        cls.client = TestClient(server.app)

    @classmethod
    def tearDownClass(cls):
        cls.client.close()
        cls.db_path.stop()
        cls.env.stop()
        sys.path.pop(0)
        cls.temp.cleanup()

    def test_tabs_and_form_deep_links_serve_the_frontend(self):
        paths = ["/", "/login", "/accounts", "/settings", "/records/new"]
        for entity in ("accounts", "owners", "categories"):
            paths.extend([f"/settings/{entity}", f"/{entity}/new", f"/{entity}/example/edit"])
        paths.extend(["/accounts/a/records/new", "/accounts/a/records/r/edit"])
        for path in paths:
            with self.subTest(path=path):
                response = self.client.get(path)
                self.assertEqual(response.status_code, 200)
                self.assertIn('id="root"', response.text)

    def test_missing_api_and_static_files_still_return_404(self):
        for path in ("/api/missing", "/assets/missing.js", "/missing.png"):
            with self.subTest(path=path):
                self.assertEqual(self.client.get(path).status_code, 404)

    def test_frontend_routes_do_not_bypass_api_authentication(self):
        self.assertEqual(self.client.get("/api/accounts").status_code, 403)
        response = self.client.get("/api/accounts", headers={"Authorization": "Bearer test-only"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), [])


if __name__ == "__main__":
    unittest.main()
