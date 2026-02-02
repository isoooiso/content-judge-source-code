# { "Depends": "py-genlayer:test" }

from genlayer import *
import json
import hashlib


class ContentJudge(gl.Contract):
    titles: DynArray[str]
    urls: DynArray[str]
    totals: DynArray[u8]
    feedbacks: DynArray[str]
    tags_json: DynArray[str]
    modes: DynArray[str]
    authors: DynArray[Address]
    max_gallery: u32
    min_save_total: u8

    last_result_json: TreeMap[Address, str]
    last_fallback: TreeMap[Address, bool]
    last_debug: TreeMap[Address, str]

    def __init__(self):
        self.max_gallery = u32(20)
        self.min_save_total = u8(35)

    def _clamp(self, s: str, n: int) -> str:
        s = (s or "").strip()
        if len(s) > n:
            return s[:n]
        return s

    def _clean_spaces(self, s: str) -> str:
        s = (s or "").replace("\n", " ").replace("\r", " ").strip()
        while "  " in s:
            s = s.replace("  ", " ")
        return s

    def _extract_json(self, s: str) -> str:
        s = (s or "").strip()
        first = s.find("{")
        last = s.rfind("}")
        if first != -1 and last != -1 and last > first:
            s = s[first:last + 1]
        s = s.replace("\u201c", '"').replace("\u201d", '"').replace("\u2018", "'").replace("\u2019", "'")
        s = s.replace("\n", " ").replace("\r", " ")
        return self._clean_spaces(s)

    def _resolve_eq_fn(self):
        candidates = []

        for name in [
            "eq_principle_prompt_non_comparative",
            "eq_principle_prompt",
            "eq_prompt",
            "eq_principle_non_comparative",
        ]:
            fn = getattr(gl, name, None)
            if callable(fn):
                candidates.append((name, fn))

        mod = getattr(gl, "eq_principle", None)
        if mod is not None:
            for sub in ["prompt_non_comparative", "prompt", "run", "call"]:
                fn = getattr(mod, sub, None)
                if callable(fn):
                    candidates.append((f"eq_principle.{sub}", fn))

        mod2 = getattr(gl, "eq", None)
        if mod2 is not None:
            for sub in ["prompt_non_comparative", "prompt", "run", "call"]:
                fn = getattr(mod2, sub, None)
                if callable(fn):
                    candidates.append((f"eq.{sub}", fn))

        if len(candidates) == 0:
            raise AttributeError("No callable eq-principle function found in this GenLayer runtime")

        return candidates[0]

    def _call_eq(self, prompt: str, task: str, criteria: str):
        name, fn = self._resolve_eq_fn()

        try:
            return name, fn(lambda: prompt, task=task, criteria=criteria)
        except TypeError:
            pass

        try:
            return name, fn(lambda: prompt, task=task)
        except TypeError:
            pass

        return name, fn(lambda: prompt)

    def _normalize_mode(self, mode: str) -> str:
        m = (mode or "").strip().lower()
        if m in ["genlayer", "genlayer project", "genlayer_project", "dapp", "project"]:
            return "genlayer"
        if m in ["startup", "startup pitch", "pitch", "startup_pitch"]:
            return "startup"
        if m in ["article", "blog", "essay", "post"]:
            return "article"
        if m in ["meme", "meme idea", "meme_idea", "joke"]:
            return "meme"
        if m in ["general", "other", "misc", "default", ""]:
            return "general"
        return "general"

    def _mode_brief(self, mode: str) -> str:
        if mode == "genlayer":
            return (
                "Mode: GENLAYER PROJECT. Evaluate as a GenLayer dApp concept.
"
                "Focus on: on-chain usefulness, trust/verification, consensus/AI appropriateness, UX, feasibility, uniqueness.
"
                "Be strict about what must be on-chain vs off-chain.
"
            )
        if mode == "startup":
            return (
                "Mode: STARTUP PITCH. Evaluate as a startup idea/pitch.
"
                "Focus on: differentiation, market clarity, user pain, business model, execution plan, defensibility.
"
                "Be strict about vague claims.
"
            )
        if mode == "article":
            return (
                "Mode: ARTICLE. Evaluate as a written article/blog draft.
"
                "Focus on: clarity, structure, thesis, specificity, usefulness, readability, originality.
"
                "Be strict about fluff.
"
            )
        if mode == "meme":
            return (
                "Mode: MEME IDEA. Evaluate as a meme/punchline concept.
"
                "Focus on: originality, comedic clarity, punch, relatability, shareability, brevity.
"
                "Be strict about weak or generic jokes.
"
            )
        return (
            "Mode: GENERAL. Evaluate as general content.
"
            "Focus on: originality, clarity, value, execution, virality.
"
        )

    def _fallback_result(self, mode: str, title: str, url: str, content: str, sender: Address):
        h = hashlib.sha256((mode + "|" + content + str(sender)).encode()).digest()

        o = int(h[0] % 4) + 6
        c = int(h[1] % 4) + 6
        v = int(h[2] % 4) + 6
        e = int(h[3] % 4) + 6
        vi = int(h[4] % 4) + 6

        total = o + c + v + e + vi

        base_feedback = "Solid start. Make the hook sharper, define the audience, and add one unique twist to stand out."
        if mode == "genlayer":
            base_feedback = "Good direction. Clarify what must be on-chain, why GenLayer is essential, and define the core user loop."
        elif mode == "startup":
            base_feedback = "Promising. Tighten the ICP, sharpen differentiation, and outline a realistic go-to-market path."
        elif mode == "article":
            base_feedback = "Decent draft. Improve structure, add concrete examples, and make the thesis more explicit."
        elif mode == "meme":
            base_feedback = "Nice attempt. Make the punchline clearer, add a unique twist, and cut extra words."

        improvements = [
            "State the target audience in one line",
            "Add a unique differentiator or mechanic",
            "Give a concrete example of use"
        ]
        if mode == "genlayer":
            improvements = [
                "Explain why it must be on-chain",
                "Define the core on-chain action and data",
                "Add one concrete user journey"
            ]
        elif mode == "startup":
            improvements = [
                "Define the ICP and pain point",
                "Add a defensible differentiator",
                "Outline a first acquisition channel"
            ]
        elif mode == "article":
            improvements = [
                "Add a clear thesis in the first paragraph",
                "Use 2–3 concrete examples",
                "Improve structure with headings"
            ]
        elif mode == "meme":
            improvements = [
                "Make the setup shorter",
                "Add a sharper twist/punchline",
                "Increase relatability with one detail"
            ]

        tags = ["mvp", "iteration", "clarity"]
        if mode == "genlayer":
            tags = ["genlayer", "onchain", "ux"]
        elif mode == "startup":
            tags = ["startup", "icp", "gtm"]
        elif mode == "article":
            tags = ["writing", "structure", "clarity"]
        elif mode == "meme":
            tags = ["meme", "punchline", "shareable"]

        return {
            "mode": mode,
            "title": title,
            "url": url,
            "scores": {
                "originality": o,
                "clarity": c,
                "value": v,
                "execution": e,
                "virality": vi
            },
            "total": total,
            "feedback": base_feedback,
            "improvements": improvements,
            "tags": tags
        }

    def _save_to_gallery(self, entry: dict, sender: Address):
        mode = self._clamp(str(entry.get("mode", "general")), 20)
        title = self._clamp(str(entry.get("title", "")), 90)
        url = self._clamp(str(entry.get("url", "")), 180)
        total = int(entry.get("total", 0))
        feedback = self._clamp(str(entry.get("feedback", "")), 320)
        tags = entry.get("tags", [])
        tags_str = json.dumps(tags) if isinstance(tags, list) else "[]"

        if total < int(self.min_save_total):
            return False

        if len(self.titles) >= int(self.max_gallery):
            self.titles.pop(0)
            self.urls.pop(0)
            self.totals.pop(0)
            self.feedbacks.pop(0)
            self.tags_json.pop(0)
            self.modes.pop(0)
            self.authors.pop(0)

        self.titles.append(title)
        self.urls.append(url)
        self.totals.append(u8(total))
        self.feedbacks.append(feedback)
        self.tags_json.append(tags_str)
        self.modes.append(mode)
        self.authors.append(sender)

        return True

    @gl.public.write
    def judge_content(self, mode: str, title: str, url: str, content: str) -> bool:
        sender = gl.message.sender_address

        m = self._normalize_mode(mode)
        t = self._clamp(title or "", 120)
        u = self._clamp(url or "", 220)
        x = (content or "").strip()

        if len(x) < 50:
            raise Rollback("Content is too short")
        if len(x) > 4000:
            raise Rollback("Content is too long")

        prompt = (
            "You are a strict but helpful content evaluator.
"
            + self._mode_brief(m) +
            "Return ONLY valid JSON with exactly these keys:
"
            '{ "scores": { "originality":1..10, "clarity":1..10, "value":1..10, "execution":1..10, "virality":1..10 },'
            ' "feedback": string (<= 280 chars), "improvements": array of 3 short strings (<= 90 chars each),'
            ' "tags": array of 3 to 6 short strings, "total": integer 0..50 }
'
            "Rules:
"
            "- No markdown.
"
            "- No extra keys.
"
            "- Keep strings single-line (no newlines).

"
            f"Title: {t}
"
            f"URL: {u}
"
            f"Content:
{x}
"
        )

        task = "Evaluate content as JSON"
        criteria = "JSON only. Must match schema exactly."

        used_fallback = False
        raw_preview = ""
        eq_used = ""
        entry = None

        try:
            eq_used, raw = self._call_eq(prompt, task, criteria)

            if isinstance(raw, dict):
                data = raw
                raw_preview = json.dumps(raw)
            else:
                raw_preview = str(raw)
                s = self._extract_json(raw_preview)
                data = json.loads(s)

            scores = data.get("scores", {})
            entry = {
                "mode": m,
                "title": t,
                "url": u,
                "scores": {
                    "originality": int(scores.get("originality", 0)),
                    "clarity": int(scores.get("clarity", 0)),
                    "value": int(scores.get("value", 0)),
                    "execution": int(scores.get("execution", 0)),
                    "virality": int(scores.get("virality", 0))
                },
                "feedback": self._clamp(str(data.get("feedback", "")), 280),
                "improvements": data.get("improvements", []),
                "tags": data.get("tags", []),
                "total": int(data.get("total", 0))
            }

            used_fallback = False
            self.last_debug[sender] = json.dumps({
                "error": "",
                "eq": eq_used,
                "raw": self._clamp(raw_preview, 900)
            })

        except Exception as e:
            used_fallback = True
            entry = self._fallback_result(m, t, u, x, sender)
            self.last_debug[sender] = json.dumps({
                "error": self._clamp(str(e), 300),
                "eq": eq_used,
                "raw": self._clamp(raw_preview, 900)
            })

        total = int(entry.get("total", 0))
        if total < 0:
            total = 0
        if total > 50:
            total = 50
        entry["total"] = total

        saved = self._save_to_gallery(entry, sender)

        result_obj = {
            "mode": entry.get("mode", "general"),
            "title": entry.get("title", ""),
            "url": entry.get("url", ""),
            "scores": entry.get("scores", {}),
            "total": total,
            "feedback": entry.get("feedback", ""),
            "improvements": entry.get("improvements", []),
            "tags": entry.get("tags", []),
            "saved": bool(saved),
            "fallback": bool(used_fallback)
        }

        self.last_result_json[sender] = json.dumps(result_obj)
        self.last_fallback[sender] = used_fallback

        return True

    @gl.public.view
    def get_last_result(self, user_address: str) -> str:
        try:
            addr = Address(user_address)
            return self.last_result_json[addr]
        except Exception:
            return json.dumps({
                "mode": "general",
                "title": "",
                "url": "",
                "scores": {},
                "total": 0,
                "feedback": "",
                "improvements": [],
                "tags": [],
                "saved": False,
                "fallback": False
            })

    @gl.public.view
    def get_last_debug(self, user_address: str) -> str:
        try:
            addr = Address(user_address)
            return self.last_debug[addr]
        except Exception:
            return json.dumps({ "error": "no debug", "eq": "", "raw": "" })

    @gl.public.view
    def get_gallery(self) -> str:
        result = []
        i = 0
        while i < len(self.titles):
            try:
                tags = json.loads(self.tags_json[i])
            except Exception:
                tags = []
            result.append({
                "mode": self.modes[i] if i < len(self.modes) else "general",
                "title": self.titles[i],
                "url": self.urls[i],
                "total": int(self.totals[i]),
                "feedback": self.feedbacks[i],
                "tags": tags,
                "author": str(self.authors[i])
            })
            i += 1

        return json.dumps(result)
