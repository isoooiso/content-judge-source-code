Deploy `contract.py` in GenLayer Studio.

After deployment, copy the contract address to:
- `.env` (local dev)
- `.env.production` (GitHub Pages build)

Functions used by the frontend:
- judge_content(mode, title, url, content) -> write
- get_last_result(user) -> view (JSON string)
- get_gallery() -> view (JSON string array)
- get_last_debug(user) -> view (JSON string)
