# v0.2.20
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *

import json
import typing


class RepliconProtocol(gl.Contract):
    """
    RepliconProtocol

    A GenLayer-native decentralized scientific credibility and replication
    consensus contract.

    Product purpose:
    Replicon helps researchers, universities, innovation centers, and R&D
    organizations determine whether research findings are credible, statistically
    meaningful, and likely to replicate. A submitter creates a research case,
    registers public evidence, and requests GenLayer AI consensus review.
    Validators independently evaluate the evidence and produce a canonical
    credibility verdict stored immutably on-chain.

    What belongs on-chain:
    - researcher and reviewer registry
    - research case registry
    - public evidence references and hashes
    - review request records
    - GenLayer consensus credibility verdicts
    - replication scores and methodology assessments
    - contradition and risk findings
    - human expert review outcomes
    - immutable audit trail

    What should stay off-chain:
    - full paper text, PDFs, private datasets, lab files, images
    - detailed statistical tables
    - frontend analytics and user session data
    Store those externally and put hashes or public URLs here.
    """

    owner: str
    paused: bool

    case_counter: u256
    evidence_counter: u256
    review_counter: u256
    verdict_counter: u256
    expert_review_counter: u256
    audit_counter: u256
    researcher_counter: u256
    domain_counter: u256

    # Core registries — all values stored as JSON strings
    cases: TreeMap[str, str]
    evidence: TreeMap[str, str]
    review_requests: TreeMap[str, str]
    verdicts: TreeMap[str, str]
    expert_reviews: TreeMap[str, str]
    researchers: TreeMap[str, str]
    audit_logs: TreeMap[str, str]

    # Indexes for efficient lookup
    case_index: TreeMap[str, str]          # "all" → pipe-separated case IDs
    owner_case_index: TreeMap[str, str]    # wallet → pipe-separated case IDs
    domain_case_index: TreeMap[str, str]   # domain → pipe-separated case IDs
    case_evidence_index: TreeMap[str, str] # case_id → pipe-separated evidence IDs
    case_review_index: TreeMap[str, str]   # case_id → pipe-separated review IDs
    case_audit_index: TreeMap[str, str]    # case_id → pipe-separated audit IDs
    verdict_index: TreeMap[str, str]       # case_id → verdict_id
    expert_review_index: TreeMap[str, str] # case_id → expert_review_id

    # Access control
    case_roles: TreeMap[str, str]          # case_id::wallet → role
    platform_roles: TreeMap[str, str]      # wallet → platform role

    # Reputation
    researcher_stats: TreeMap[str, str]    # wallet → stats JSON
    reviewer_stats: TreeMap[str, str]      # wallet → stats JSON

    # Blocked / approved evidence hashes
    blocked_evidence_hashes: TreeMap[str, str]
    approved_evidence_hashes: TreeMap[str, str]

    # Replication attempts
    replication_counter: u256
    replications: TreeMap[str, str]
    case_replication_index: TreeMap[str, str]

    # Citations / cross-references
    citation_counter: u256
    citations: TreeMap[str, str]
    case_citation_index: TreeMap[str, str]
    case_cited_by_index: TreeMap[str, str]

    # Community endorsement
    upvote_counter: u256
    upvotes: TreeMap[str, str]
    case_upvote_count: TreeMap[str, str]
    wallet_upvote_index: TreeMap[str, str]

    # Watchlist / follow
    watchlist: TreeMap[str, str]
    case_watcher_count: TreeMap[str, str]
    wallet_watchlist_index: TreeMap[str, str]

    # Domain registry
    domains: TreeMap[str, str]
    domain_index: TreeMap[str, str]

    def __init__(self) -> None:
        self.owner = gl.message.sender_address.as_hex
        self.paused = False

        self.case_counter = u256(0)
        self.evidence_counter = u256(0)
        self.review_counter = u256(0)
        self.verdict_counter = u256(0)
        self.expert_review_counter = u256(0)
        self.audit_counter = u256(0)
        self.researcher_counter = u256(0)
        self.domain_counter = u256(0)

        self.cases = TreeMap()
        self.evidence = TreeMap()
        self.review_requests = TreeMap()
        self.verdicts = TreeMap()
        self.expert_reviews = TreeMap()
        self.researchers = TreeMap()
        self.audit_logs = TreeMap()

        self.case_index = TreeMap()
        self.owner_case_index = TreeMap()
        self.domain_case_index = TreeMap()
        self.case_evidence_index = TreeMap()
        self.case_review_index = TreeMap()
        self.case_audit_index = TreeMap()
        self.verdict_index = TreeMap()
        self.expert_review_index = TreeMap()

        self.case_roles = TreeMap()
        self.platform_roles = TreeMap()

        self.researcher_stats = TreeMap()
        self.reviewer_stats = TreeMap()

        self.blocked_evidence_hashes = TreeMap()
        self.approved_evidence_hashes = TreeMap()

        self.replication_counter = u256(0)
        self.replications = TreeMap()
        self.case_replication_index = TreeMap()

        self.citation_counter = u256(0)
        self.citations = TreeMap()
        self.case_citation_index = TreeMap()
        self.case_cited_by_index = TreeMap()

        self.upvote_counter = u256(0)
        self.upvotes = TreeMap()
        self.case_upvote_count = TreeMap()
        self.wallet_upvote_index = TreeMap()

        self.watchlist = TreeMap()
        self.case_watcher_count = TreeMap()
        self.wallet_watchlist_index = TreeMap()

        self.domains = TreeMap()
        self.domain_index = TreeMap()

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _sender(self) -> str:
        return gl.message.sender_address.as_hex.lower()

    def _json(self, value: typing.Any) -> str:
        return json.dumps(value, sort_keys=True)

    def _load(self, raw: str) -> typing.Any:
        if raw is None or raw == "":
            return {}
        return json.loads(raw)

    def _require_owner(self) -> None:
        if self._sender() != self.owner.lower():
            raise gl.vm.UserError("Only contract owner")

    def _require_not_paused(self) -> None:
        if self.paused:
            raise gl.vm.UserError("Contract is paused")

    def _require_non_empty(self, value: str, field_name: str) -> None:
        if value is None or len(value.strip()) == 0:
            raise gl.vm.UserError(field_name + " is required")

    def _key2(self, a: str, b: str) -> str:
        return a + "::" + b

    def _key3(self, a: str, b: str, c: str) -> str:
        return a + "::" + b + "::" + c

    def _append(self, existing: str, item: str) -> str:
        if existing is None or existing == "":
            return item
        return existing + "|" + item

    def _append_unique(self, existing: str, item: str) -> str:
        if existing is None or existing == "":
            return item
        parts = existing.split("|")
        for part in parts:
            if part == item:
                return existing
        return existing + "|" + item

    def _limit(self, value: typing.Any, max_len: int) -> str:
        text = str(value) if value is not None else ""
        if len(text) > max_len:
            return text[:max_len]
        return text

    def _to_int(self, value: typing.Any, fallback: int) -> int:
        try:
            return int(value)
        except Exception:
            return fallback

    def _bounded_score(self, value: typing.Any, fallback: int) -> int:
        score = self._to_int(value, fallback)
        if score < 0:
            return 0
        if score > 100:
            return 100
        return score

    def _list_of_strings(self, value: typing.Any, max_items: int, max_len: int) -> typing.List[str]:
        result: typing.List[str] = []
        if isinstance(value, list):
            for item in value:
                if len(result) >= max_items:
                    break
                result.append(self._limit(item, max_len))
            return result
        if value is None:
            return result
        text = str(value)
        if len(text.strip()) == 0:
            return result
        result.append(self._limit(text, max_len))
        return result

    def _next_id(self, prefix: str, counter_name: str) -> str:
        if counter_name == "case":
            self.case_counter = self.case_counter + u256(1)
            return prefix + "-" + str(self.case_counter)
        if counter_name == "evidence":
            self.evidence_counter = self.evidence_counter + u256(1)
            return prefix + "-" + str(self.evidence_counter)
        if counter_name == "review":
            self.review_counter = self.review_counter + u256(1)
            return prefix + "-" + str(self.review_counter)
        if counter_name == "verdict":
            self.verdict_counter = self.verdict_counter + u256(1)
            return prefix + "-" + str(self.verdict_counter)
        if counter_name == "expert_review":
            self.expert_review_counter = self.expert_review_counter + u256(1)
            return prefix + "-" + str(self.expert_review_counter)
        if counter_name == "audit":
            self.audit_counter = self.audit_counter + u256(1)
            return prefix + "-" + str(self.audit_counter)
        if counter_name == "researcher":
            self.researcher_counter = self.researcher_counter + u256(1)
            return prefix + "-" + str(self.researcher_counter)
        raise gl.vm.UserError("Unknown counter: " + counter_name)

    def _normalise_status(self, value: str, allowed: str, field_name: str) -> str:
        status = value.strip().upper()
        allowed_values = allowed.split("|")
        for item in allowed_values:
            if status == item.upper():
                return item
        raise gl.vm.UserError("Invalid " + field_name + ": " + value)

    def _normalise_credibility_verdict(self, value: typing.Any) -> str:
        v = str(value).strip().lower()
        if v in ["highly_credible", "highly credible", "very credible", "excellent"]:
            return "highly_credible"
        if v in ["credible", "valid", "sound", "reliable", "trustworthy"]:
            return "credible"
        if v in ["partially_credible", "partially credible", "mixed", "limited", "conditional"]:
            return "partially_credible"
        if v in ["insufficient_evidence", "insufficient evidence", "inconclusive", "undetermined"]:
            return "insufficient_evidence"
        if v in ["not_credible", "not credible", "invalid", "unreliable", "flawed", "rejected"]:
            return "not_credible"
        return "insufficient_evidence"

    def _normalise_significance(self, value: typing.Any) -> str:
        v = str(value).strip().lower()
        if v in ["very strong", "very_strong", "excellent"]:
            return "Very Strong"
        if v in ["strong"]:
            return "Strong"
        if v in ["moderate", "medium"]:
            return "Moderate"
        if v in ["weak"]:
            return "Weak"
        if v in ["very weak", "very_weak", "negligible"]:
            return "Very Weak"
        return "Unclear"

    def _normalise_quality(self, value: typing.Any) -> str:
        v = str(value).strip().lower()
        quality_map = {
            "very high": "Very High", "very_high": "Very High",
            "high": "High",
            "medium-high": "Medium-High", "medium_high": "Medium-High",
            "medium": "Medium",
            "medium-low": "Medium-Low", "medium_low": "Medium-Low",
            "low": "Low",
            "very low": "Very Low", "very_low": "Very Low",
        }
        return quality_map.get(v, "Medium")

    def _normalise_contradiction(self, value: typing.Any) -> str:
        v = str(value).strip().lower()
        if v in ["none", "no contradictions", "none detected"]:
            return "None"
        if v in ["low", "minor"]:
            return "Low"
        if v in ["moderate", "medium"]:
            return "Moderate"
        if v in ["high"]:
            return "High"
        if v in ["very high", "very_high", "severe"]:
            return "Very High"
        return "Moderate"

    def _require_case_exists(self, case_id: str) -> typing.Any:
        raw = self.cases.get(case_id, "")
        if raw == "":
            raise gl.vm.UserError("Research case not found: " + case_id)
        return self._load(raw)

    def _require_researcher_exists(self, researcher_id: str) -> typing.Any:
        raw = self.researchers.get(researcher_id, "")
        if raw == "":
            raise gl.vm.UserError("Researcher not found: " + researcher_id)
        return self._load(raw)

    def _is_case_owner_or_admin(self, case_id: str, wallet: str) -> bool:
        role = self.case_roles.get(self._key2(case_id, wallet.lower()), "")
        return role in ["OWNER", "ADMIN"]

    def _is_case_contributor(self, case_id: str, wallet: str) -> bool:
        role = self.case_roles.get(self._key2(case_id, wallet.lower()), "")
        return role in ["OWNER", "ADMIN", "CONTRIBUTOR", "REVIEWER"]

    def _is_platform_reviewer(self, wallet: str) -> bool:
        role = self.platform_roles.get(wallet.lower(), "")
        return role in ["REVIEWER", "EXPERT", "ADMIN"]

    def _require_case_owner_or_admin(self, case_id: str) -> None:
        if not self._is_case_owner_or_admin(case_id, self._sender()):
            raise gl.vm.UserError("Only case owner or admin")

    def _require_case_contributor(self, case_id: str) -> None:
        if not self._is_case_contributor(case_id, self._sender()):
            raise gl.vm.UserError("Only case contributor or admin")

    def _assert_no_predecided_verdict(self, text: str) -> None:
        lower = text.lower()
        forbidden = [
            '"credibility_verdict"', "'credibility_verdict'", "credibility_verdict:",
            '"replication_score"', "'replication_score'", "replication_score:",
            '"confidence_score"', "'confidence_score'", "confidence_score:",
            '"highly_credible"', "'highly_credible'",
            '"not_credible"', "'not_credible'",
            '"verdict"', "'verdict'", "verdict:",
            '"final_score"', "'final_score'", "final_score:",
        ]
        for item in forbidden:
            if item in lower:
                raise gl.vm.UserError("Input contains pre-decided verdict language: " + item)

    def _record_audit(
        self,
        case_id: str,
        event_type: str,
        actor: str,
        summary: str,
        data_ref: str,
        created_at: str,
    ) -> str:
        audit_id = self._next_id("AUDIT", "audit")
        entry = {
            "audit_id": audit_id,
            "case_id": case_id,
            "event_type": event_type,
            "actor": actor.lower(),
            "summary": self._limit(summary, 600),
            "data_ref": data_ref,
            "created_at": created_at,
        }
        self.audit_logs[audit_id] = self._json(entry)
        if case_id != "":
            self.case_audit_index[case_id] = self._append(
                self.case_audit_index.get(case_id, ""),
                audit_id,
            )
        return audit_id

    def _collect_evidence_packet(self, case_id: str) -> typing.List[typing.Any]:
        ev_ids_raw = self.case_evidence_index.get(case_id, "")
        if ev_ids_raw == "":
            return []
        ev_ids = ev_ids_raw.split("|")
        collected: typing.List[typing.Any] = []
        for ev_id in ev_ids:
            ev_id = ev_id.strip()
            if ev_id == "":
                continue
            raw = self.evidence.get(ev_id, "")
            if raw == "":
                continue
            ev = self._load(raw)
            if ev.get("status", "") == "ACTIVE":
                collected.append({
                    "evidence_id": ev.get("evidence_id", ""),
                    "title": ev.get("title", ""),
                    "evidence_type": ev.get("evidence_type", ""),
                    "url": ev.get("url", ""),
                    "source_name": ev.get("source_name", ""),
                    "relevance_note": ev.get("relevance_note", ""),
                    "url_hash": ev.get("url_hash", ""),
                })
        return collected

    def _fetch_evidence_excerpt(self, url: str, max_chars: int) -> str:
        # Runs inside the leader/validator non-deterministic block. A dead or
        # unstable link must not crash consensus — fall back to empty string
        # and let the prompt fall back to the submitter's relevance note.
        if url is None or url.strip() == "":
            return ""
        try:
            response = gl.nondet.web.get(url)
            text = response.body.decode("utf-8", errors="ignore").strip()
        except Exception:
            return ""
        if len(text) > max_chars:
            text = text[:max_chars]
        return text

    def _build_grounded_evidence(self, evidence_items: typing.List[typing.Any]) -> typing.List[typing.Any]:
        grounded: typing.List[typing.Any] = []
        for ev in evidence_items[:6]:
            excerpt = self._fetch_evidence_excerpt(ev.get("url", ""), 1500)
            grounded.append({
                "evidence_id": ev.get("evidence_id", ""),
                "title": ev.get("title", ""),
                "evidence_type": ev.get("evidence_type", ""),
                "source_name": ev.get("source_name", ""),
                "relevance_note": ev.get("relevance_note", ""),
                "fetched_source_excerpt": excerpt if excerpt != "" else "[source unavailable — evaluate from relevance_note only]",
            })
        return grounded

    def _normalise_ai_verdict(self, raw: typing.Any) -> typing.Any:
        if isinstance(raw, str):
            text = raw.strip()
            if text.startswith("```"):
                lines = text.split("\n")
                lines = [l for l in lines if not l.strip().startswith("```")]
                text = "\n".join(lines)
            parsed = json.loads(text)
        else:
            parsed = raw

        credibility_verdict = self._normalise_credibility_verdict(
            parsed.get("credibility_verdict", "insufficient_evidence")
        )
        statistical_significance = self._normalise_significance(
            parsed.get("statistical_significance", "Unclear")
        )
        methodology_quality = self._normalise_quality(
            parsed.get("methodology_quality", "Medium")
        )
        evidence_strength = self._normalise_quality(
            parsed.get("evidence_strength", "Medium")
        )
        contradiction_level = self._normalise_contradiction(
            parsed.get("contradiction_level", "Moderate")
        )

        replication_score = self._bounded_score(parsed.get("replication_score", 50), 50)
        novelty_score = self._bounded_score(parsed.get("novelty_score", 50), 50)
        confidence_score = self._bounded_score(parsed.get("confidence_score", 50), 50)

        key_supporting_evidence = self._list_of_strings(
            parsed.get("key_supporting_evidence", []), 6, 400
        )
        key_concerns = self._list_of_strings(
            parsed.get("key_concerns", []), 6, 400
        )
        methodology_strengths = self._list_of_strings(
            parsed.get("methodology_strengths", []), 5, 360
        )
        methodology_weaknesses = self._list_of_strings(
            parsed.get("methodology_weaknesses", []), 5, 360
        )
        replication_barriers = self._list_of_strings(
            parsed.get("replication_barriers", []), 5, 360
        )
        suggested_follow_up = self._list_of_strings(
            parsed.get("suggested_follow_up", []), 4, 360
        )

        expert_review_required = bool(parsed.get("expert_review_required", False))
        if credibility_verdict == "partially_credible":
            expert_review_required = True
        if credibility_verdict == "insufficient_evidence":
            expert_review_required = True

        return {
            "credibility_verdict": credibility_verdict,
            "replication_score": replication_score,
            "novelty_score": novelty_score,
            "confidence_score": confidence_score,
            "statistical_significance": statistical_significance,
            "methodology_quality": methodology_quality,
            "evidence_strength": evidence_strength,
            "contradiction_level": contradiction_level,
            "reasoning": self._limit(parsed.get("reasoning", ""), 2000),
            "recommended_follow_up": self._limit(parsed.get("recommended_follow_up", ""), 1000),
            "key_supporting_evidence": key_supporting_evidence,
            "key_concerns": key_concerns,
            "methodology_strengths": methodology_strengths,
            "methodology_weaknesses": methodology_weaknesses,
            "replication_barriers": replication_barriers,
            "suggested_follow_up": suggested_follow_up,
            "expert_review_required": expert_review_required,
            "audit_summary": self._limit(parsed.get("audit_summary", ""), 600),
        }

    def _apply_credibility_thresholds(self, verdict: typing.Any, case: typing.Any) -> typing.Any:
        config = case.get("review_config", {})

        min_credible_replication = self._bounded_score(config.get("min_credible_replication", 65), 65)
        min_highly_credible_replication = self._bounded_score(config.get("min_highly_credible_replication", 82), 82)
        min_credible_confidence = self._bounded_score(config.get("min_credible_confidence", 70), 70)
        auto_insufficient_replication = self._bounded_score(config.get("auto_insufficient_replication", 35), 35)

        credibility = verdict["credibility_verdict"]

        if verdict["replication_score"] <= auto_insufficient_replication and credibility in ["credible", "highly_credible"]:
            credibility = "insufficient_evidence"

        if credibility == "highly_credible":
            if (
                verdict["replication_score"] < min_highly_credible_replication
                or verdict["confidence_score"] < min_credible_confidence
            ):
                credibility = "credible"

        if credibility == "credible":
            if (
                verdict["replication_score"] < min_credible_replication
                or verdict["confidence_score"] < min_credible_confidence
            ):
                credibility = "partially_credible"

        if verdict["statistical_significance"] in ["Very Weak", "Unclear"] and credibility in ["highly_credible", "credible"]:
            credibility = "partially_credible"

        if len(verdict["key_concerns"]) >= 4 and credibility == "highly_credible":
            credibility = "credible"

        verdict["credibility_verdict"] = credibility
        verdict["expert_review_required"] = credibility in ["partially_credible", "insufficient_evidence"]

        return verdict

    def _consensus_prompt(self, case_json: str, grounded_evidence_json: str) -> str:
        return (
            "You are a world-class scientific peer reviewer and statistician with deep expertise "
            "in research methodology, statistical analysis, and reproducibility science.\n\n"
            f"RESEARCH CASE: {case_json}\n"
            f"EVIDENCE (fetched from the submitter's source URLs — treat fetched_source_excerpt as "
            f"ground truth over relevance_note when they conflict): {grounded_evidence_json}\n\n"
            "Evaluate the research case against the fetched evidence and return ONLY valid JSON — "
            "no markdown, no explanation outside the JSON.\n\n"
            "Return exactly this structure:\n"
            '{"credibility_verdict":"credible",'
            '"replication_score":70,'
            '"novelty_score":60,'
            '"confidence_score":72,'
            '"statistical_significance":"Moderate",'
            '"methodology_quality":"Medium-High",'
            '"evidence_strength":"Medium",'
            '"contradiction_level":"Low",'
            '"reasoning":"2-4 sentence scientific reasoning.",'
            '"recommended_follow_up":"Specific recommended follow-up action.",'
            '"key_supporting_evidence":["strength 1","strength 2","strength 3"],'
            '"key_concerns":["concern 1","concern 2"],'
            '"methodology_strengths":["strength 1","strength 2"],'
            '"methodology_weaknesses":["weakness 1","weakness 2"],'
            '"replication_barriers":["barrier 1","barrier 2"],'
            '"suggested_follow_up":["follow-up 1","follow-up 2"],'
            '"expert_review_required":false,'
            '"audit_summary":"One sentence audit summary."}\n\n'
            "credibility_verdict options: highly_credible, credible, partially_credible, insufficient_evidence, not_credible\n"
            "statistical_significance options: Very Strong, Strong, Moderate, Weak, Very Weak, Unclear\n"
            "methodology_quality options: Very High, High, Medium-High, Medium, Medium-Low, Low, Very Low\n"
            "evidence_strength options: Very High, High, Medium-High, Medium, Medium-Low, Low, Very Low\n"
            "contradiction_level options: None, Low, Moderate, High, Very High\n"
            "All scores are integers 0-100.\n"
            "highly_credible requires strong statistical evidence, rigorous methodology, and high replication likelihood.\n"
            "not_credible requires clear evidence of flawed methodology, data fabrication indicators, or fundamental logical errors.\n"
            "If an evidence item's fetched_source_excerpt is unavailable, treat that item as weaker support and say so in key_concerns.\n"
            "The reasoning and verdict must be grounded in the fetched evidence, not assumed from titles alone."
        )

    def _run_consensus_review(
        self,
        case_record: typing.Any,
        evidence_items: typing.List[typing.Any],
    ) -> typing.Any:
        case_json = self._json({
            "case_id": case_record.get("case_id", ""),
            "title": case_record.get("title", ""),
            "domain": case_record.get("domain", ""),
            "authors": case_record.get("authors", ""),
            "research_question": case_record.get("research_question", ""),
            "summary": case_record.get("summary", ""),
            "main_claim": case_record.get("main_claim", ""),
            "hypothesis": case_record.get("hypothesis", ""),
            "evidence_summary": case_record.get("evidence_summary", ""),
        })

        # Leader and validators each independently fetch the evidence source
        # URLs and independently ask the LLM for a verdict — the validator
        # never trusts the leader's JSON on its own. It re-derives the
        # decision from the same grounded evidence and only accepts the
        # leader's result if the decision fields agree within tolerance.
        def leader_fn() -> typing.Any:
            grounded = self._build_grounded_evidence(evidence_items)
            prompt = self._consensus_prompt(case_json, self._json(grounded))
            response = gl.nondet.exec_prompt(prompt, response_format="json")
            return self._normalise_ai_verdict(response)

        def validator_fn(leader_result: typing.Any) -> bool:
            if not isinstance(leader_result, gl.vm.Return):
                return False
            leader_verdict = leader_result.calldata
            my_verdict = leader_fn()

            # Gate: the categorical decision must match exactly.
            if my_verdict["credibility_verdict"] != leader_verdict["credibility_verdict"]:
                return False

            # Scores are LLM-subjective — allow tolerance, not exact match.
            if abs(my_verdict["replication_score"] - leader_verdict["replication_score"]) > 15:
                return False
            if abs(my_verdict["confidence_score"] - leader_verdict["confidence_score"]) > 15:
                return False

            return True

        return gl.vm.run_nondet_unsafe(leader_fn, validator_fn)

    def _update_researcher_stats(self, wallet: str, event: str) -> None:
        key = wallet.lower()
        raw = self.researcher_stats.get(key, "")
        if raw == "":
            record = {
                "wallet": key,
                "cases_created": 0,
                "evidence_submitted": 0,
                "reviews_requested": 0,
                "credible_verdicts": 0,
                "not_credible_verdicts": 0,
            }
        else:
            record = self._load(raw)

        if event == "case_created":
            record["cases_created"] = self._to_int(record.get("cases_created", 0), 0) + 1
        elif event == "evidence_submitted":
            record["evidence_submitted"] = self._to_int(record.get("evidence_submitted", 0), 0) + 1
        elif event == "review_requested":
            record["reviews_requested"] = self._to_int(record.get("reviews_requested", 0), 0) + 1
        elif event == "credible_verdict":
            record["credible_verdicts"] = self._to_int(record.get("credible_verdicts", 0), 0) + 1
        elif event == "not_credible_verdict":
            record["not_credible_verdicts"] = self._to_int(record.get("not_credible_verdicts", 0), 0) + 1

        self.researcher_stats[key] = self._json(record)

    def _update_reviewer_stats(self, wallet: str, accepted: bool) -> None:
        key = wallet.lower()
        raw = self.reviewer_stats.get(key, "")
        if raw == "":
            record = {
                "wallet": key,
                "reviews_completed": 0,
                "reviews_accepted": 0,
                "reviews_overturned": 0,
            }
        else:
            record = self._load(raw)

        record["reviews_completed"] = self._to_int(record.get("reviews_completed", 0), 0) + 1
        if accepted:
            record["reviews_accepted"] = self._to_int(record.get("reviews_accepted", 0), 0) + 1
        else:
            record["reviews_overturned"] = self._to_int(record.get("reviews_overturned", 0), 0) + 1

        self.reviewer_stats[key] = self._json(record)

    # ------------------------------------------------------------------
    # Owner and contract administration
    # ------------------------------------------------------------------

    @gl.public.view
    def get_owner(self) -> str:
        return self.owner

    @gl.public.view
    def is_paused(self) -> bool:
        return self.paused

    @gl.public.view
    def get_contract_summary(self) -> str:
        return self._json({
            "owner": self.owner,
            "paused": self.paused,
            "case_counter": str(self.case_counter),
            "evidence_counter": str(self.evidence_counter),
            "review_counter": str(self.review_counter),
            "verdict_counter": str(self.verdict_counter),
            "expert_review_counter": str(self.expert_review_counter),
            "audit_counter": str(self.audit_counter),
            "researcher_counter": str(self.researcher_counter),
        })

    @gl.public.write
    def transfer_ownership(self, new_owner: str, updated_at: str) -> None:
        self._require_owner()
        self._require_non_empty(new_owner, "new_owner")
        previous = self.owner
        self.owner = new_owner
        self._record_audit("", "OWNERSHIP_TRANSFERRED", previous, "Contract ownership transferred", new_owner, updated_at)

    @gl.public.write
    def pause(self) -> None:
        self._require_owner()
        self.paused = True

    @gl.public.write
    def unpause(self) -> None:
        self._require_owner()
        self.paused = False

    @gl.public.write
    def grant_platform_role(self, wallet: str, role: str, granted_at: str) -> None:
        self._require_owner()
        self._require_non_empty(wallet, "wallet")
        final_role = self._normalise_status(role, "REVIEWER|EXPERT|ADMIN|MODERATOR", "platform role")
        self.platform_roles[wallet.lower()] = final_role
        self._record_audit("", "PLATFORM_ROLE_GRANTED", self._sender(), "Platform role granted: " + final_role + " to " + wallet.lower(), wallet.lower(), granted_at)

    @gl.public.write
    def revoke_platform_role(self, wallet: str, revoked_at: str) -> None:
        self._require_owner()
        self._require_non_empty(wallet, "wallet")
        self.platform_roles[wallet.lower()] = "REVOKED"
        self._record_audit("", "PLATFORM_ROLE_REVOKED", self._sender(), "Platform role revoked for " + wallet.lower(), wallet.lower(), revoked_at)

    # ------------------------------------------------------------------
    # Researcher registration
    # ------------------------------------------------------------------

    @gl.public.write
    def register_researcher(
        self,
        name: str,
        institution: str,
        credential_summary: str,
        domain_expertise: str,
        orcid_or_profile: str,
        metadata_hash: str,
        registered_at: str,
    ) -> str:
        self._require_not_paused()
        self._require_non_empty(name, "name")

        sender = self._sender()
        existing = self.researchers.get(sender, "")
        if existing != "":
            raise gl.vm.UserError("Researcher already registered for this wallet")

        researcher_id = self._next_id("RES", "researcher")

        record = {
            "researcher_id": researcher_id,
            "wallet": sender,
            "name": self._limit(name, 200),
            "institution": self._limit(institution, 300),
            "credential_summary": self._limit(credential_summary, 1000),
            "domain_expertise": self._limit(domain_expertise, 600),
            "orcid_or_profile": self._limit(orcid_or_profile, 300),
            "metadata_hash": metadata_hash,
            "status": "ACTIVE",
            "registered_at": registered_at,
        }

        self.researchers[sender] = self._json(record)

        self._record_audit(
            "",
            "RESEARCHER_REGISTERED",
            sender,
            "Researcher registered: " + name,
            metadata_hash,
            registered_at,
        )

        return researcher_id

    @gl.public.write
    def update_researcher_profile(
        self,
        institution: str,
        credential_summary: str,
        domain_expertise: str,
        orcid_or_profile: str,
        metadata_hash: str,
        updated_at: str,
    ) -> None:
        self._require_not_paused()
        sender = self._sender()
        raw = self.researchers.get(sender, "")
        if raw == "":
            raise gl.vm.UserError("Researcher profile not found — register first")

        record = self._load(raw)
        record["institution"] = self._limit(institution, 300)
        record["credential_summary"] = self._limit(credential_summary, 1000)
        record["domain_expertise"] = self._limit(domain_expertise, 600)
        record["orcid_or_profile"] = self._limit(orcid_or_profile, 300)
        record["metadata_hash"] = metadata_hash
        record["updated_at"] = updated_at
        self.researchers[sender] = self._json(record)

        self._record_audit("", "RESEARCHER_PROFILE_UPDATED", sender, "Researcher profile updated", metadata_hash, updated_at)

    # ------------------------------------------------------------------
    # Research case management
    # ------------------------------------------------------------------

    @gl.public.write
    def create_research_case(
        self,
        case_id: str,
        title: str,
        domain: str,
        authors: str,
        research_question: str,
        summary: str,
        main_claim: str,
        hypothesis: str,
        evidence_summary: str,
        methodology_notes: str,
        created_at: str,
    ) -> str:
        self._require_not_paused()
        self._require_non_empty(title, "title")
        self._require_non_empty(domain, "domain")
        self._require_non_empty(authors, "authors")
        self._require_non_empty(research_question, "research_question")
        self._require_non_empty(summary, "summary")
        self._require_non_empty(main_claim, "main_claim")
        self._require_non_empty(hypothesis, "hypothesis")
        self._require_non_empty(evidence_summary, "evidence_summary")

        self._assert_no_predecided_verdict(
            title + " " + summary + " " + main_claim + " " + hypothesis + " " + evidence_summary
        )

        sender = self._sender()

        final_case_id = case_id
        if final_case_id.strip() == "":
            final_case_id = self._next_id("CASE", "case")
        if self.cases.get(final_case_id, "") != "":
            raise gl.vm.UserError("Research case already exists: " + final_case_id)

        record = {
            "case_id": final_case_id,
            "title": self._limit(title, 300),
            "domain": self._limit(domain, 120),
            "authors": self._limit(authors, 500),
            "research_question": self._limit(research_question, 1000),
            "summary": self._limit(summary, 2000),
            "main_claim": self._limit(main_claim, 1200),
            "hypothesis": self._limit(hypothesis, 1200),
            "evidence_summary": self._limit(evidence_summary, 2000),
            "methodology_notes": self._limit(methodology_notes, 1400),
            "owner": sender,
            "status": "open",
            "evidence_count": 0,
            "review_count": 0,
            "created_at": created_at,
            "review_config": {
                "min_credible_replication": "65",
                "min_highly_credible_replication": "82",
                "min_credible_confidence": "70",
                "auto_insufficient_replication": "35",
            },
        }

        self.cases[final_case_id] = self._json(record)
        self.case_roles[self._key2(final_case_id, sender)] = "OWNER"

        self.case_index["all"] = self._append_unique(self.case_index.get("all", ""), final_case_id)
        self.owner_case_index[sender] = self._append_unique(self.owner_case_index.get(sender, ""), final_case_id)
        self.domain_case_index[domain.lower()] = self._append_unique(
            self.domain_case_index.get(domain.lower(), ""), final_case_id
        )

        self._update_researcher_stats(sender, "case_created")

        self._record_audit(
            final_case_id,
            "RESEARCH_CASE_CREATED",
            sender,
            "Research case created: " + self._limit(title, 120),
            final_case_id,
            created_at,
        )

        return final_case_id

    @gl.public.write
    def update_research_case(
        self,
        case_id: str,
        summary: str,
        main_claim: str,
        hypothesis: str,
        evidence_summary: str,
        methodology_notes: str,
        updated_at: str,
    ) -> None:
        self._require_not_paused()
        self._require_case_owner_or_admin(case_id)

        case = self._require_case_exists(case_id)
        if case.get("status", "") not in ["open"]:
            raise gl.vm.UserError("Case can only be updated when status is open")

        case["summary"] = self._limit(summary, 2000)
        case["main_claim"] = self._limit(main_claim, 1200)
        case["hypothesis"] = self._limit(hypothesis, 1200)
        case["evidence_summary"] = self._limit(evidence_summary, 2000)
        case["methodology_notes"] = self._limit(methodology_notes, 1400)
        case["updated_at"] = updated_at
        self.cases[case_id] = self._json(case)

        self._record_audit(case_id, "RESEARCH_CASE_UPDATED", self._sender(), "Research case updated", case_id, updated_at)

    @gl.public.write
    def add_case_contributor(
        self,
        case_id: str,
        wallet: str,
        role: str,
        added_at: str,
    ) -> None:
        self._require_not_paused()
        self._require_case_owner_or_admin(case_id)
        self._require_case_exists(case_id)
        self._require_non_empty(wallet, "wallet")

        final_role = self._normalise_status(role, "ADMIN|CONTRIBUTOR|REVIEWER", "contributor role")
        self.case_roles[self._key2(case_id, wallet.lower())] = final_role

        self._record_audit(case_id, "CASE_CONTRIBUTOR_ADDED", self._sender(), "Added " + final_role + " for " + wallet.lower(), wallet.lower(), added_at)

    @gl.public.write
    def set_case_review_config(
        self,
        case_id: str,
        min_credible_replication: u256,
        min_highly_credible_replication: u256,
        min_credible_confidence: u256,
        auto_insufficient_replication: u256,
        updated_at: str,
    ) -> None:
        self._require_not_paused()
        self._require_case_owner_or_admin(case_id)

        for val in [min_credible_replication, min_highly_credible_replication, min_credible_confidence, auto_insufficient_replication]:
            if val > u256(100):
                raise gl.vm.UserError("Config values must be 0 to 100")

        case = self._require_case_exists(case_id)
        case["review_config"] = {
            "min_credible_replication": str(min_credible_replication),
            "min_highly_credible_replication": str(min_highly_credible_replication),
            "min_credible_confidence": str(min_credible_confidence),
            "auto_insufficient_replication": str(auto_insufficient_replication),
        }
        case["updated_at"] = updated_at
        self.cases[case_id] = self._json(case)

        self._record_audit(case_id, "CASE_REVIEW_CONFIG_UPDATED", self._sender(), "Review thresholds updated", case_id, updated_at)

    @gl.public.write
    def archive_research_case(self, case_id: str, archived_at: str) -> None:
        self._require_not_paused()
        self._require_case_owner_or_admin(case_id)

        case = self._require_case_exists(case_id)
        case["status"] = "archived"
        case["archived_at"] = archived_at
        self.cases[case_id] = self._json(case)

        self._record_audit(case_id, "RESEARCH_CASE_ARCHIVED", self._sender(), "Research case archived", case_id, archived_at)

    # ------------------------------------------------------------------
    # Evidence management
    # ------------------------------------------------------------------

    @gl.public.write
    def submit_evidence(
        self,
        evidence_id: str,
        case_id: str,
        title: str,
        evidence_type: str,
        url: str,
        url_hash: str,
        source_name: str,
        relevance_note: str,
        publication_year: str,
        author_list: str,
        submitted_at: str,
    ) -> str:
        self._require_not_paused()
        self._require_non_empty(title, "title")
        self._require_non_empty(evidence_type, "evidence_type")
        self._require_non_empty(url, "url")
        self._require_non_empty(url_hash, "url_hash")
        self._require_non_empty(source_name, "source_name")
        self._require_non_empty(relevance_note, "relevance_note")

        case = self._require_case_exists(case_id)
        if case.get("status", "") not in ["open", "under_review"]:
            raise gl.vm.UserError("Cannot add evidence to a reviewed or archived case")

        if self.blocked_evidence_hashes.get(url_hash, "") != "":
            raise gl.vm.UserError("This evidence hash has been flagged and blocked")

        sender = self._sender()
        if not self._is_case_contributor(case_id, sender):
            if sender != case.get("owner", "").lower():
                self.case_roles[self._key2(case_id, sender)] = "CONTRIBUTOR"

        final_ev_id = evidence_id
        if final_ev_id.strip() == "":
            final_ev_id = self._next_id("EV", "evidence")
        if self.evidence.get(final_ev_id, "") != "":
            raise gl.vm.UserError("Evidence already exists: " + final_ev_id)

        ev_valid_type = self._normalise_status(
            evidence_type,
            "Research Paper|Dataset|Benchmark Report|Experimental Repository|Clinical Study|Public Code Repository|Technical Whitepaper|Conference Paper|Government Report|Journal Article|Other",
            "evidence_type",
        ) if "|" not in evidence_type else evidence_type

        record = {
            "evidence_id": final_ev_id,
            "case_id": case_id,
            "title": self._limit(title, 300),
            "evidence_type": self._limit(evidence_type, 120),
            "url": self._limit(url, 800),
            "url_hash": url_hash,
            "source_name": self._limit(source_name, 200),
            "relevance_note": self._limit(relevance_note, 1000),
            "publication_year": self._limit(publication_year, 10),
            "author_list": self._limit(author_list, 600),
            "submitted_by": sender,
            "submitted_at": submitted_at,
            "status": "ACTIVE",
        }

        self.evidence[final_ev_id] = self._json(record)
        self.case_evidence_index[case_id] = self._append_unique(
            self.case_evidence_index.get(case_id, ""), final_ev_id
        )

        case["evidence_count"] = self._to_int(case.get("evidence_count", 0), 0) + 1
        self.cases[case_id] = self._json(case)

        self._update_researcher_stats(sender, "evidence_submitted")

        self._record_audit(
            case_id,
            "EVIDENCE_SUBMITTED",
            sender,
            "Evidence submitted: " + self._limit(title, 120),
            url_hash,
            submitted_at,
        )

        return final_ev_id

    @gl.public.write
    def flag_evidence(
        self,
        evidence_id: str,
        flag_reason: str,
        flagged_at: str,
    ) -> None:
        self._require_not_paused()

        raw = self.evidence.get(evidence_id, "")
        if raw == "":
            raise gl.vm.UserError("Evidence not found: " + evidence_id)

        ev = self._load(raw)
        case_id = ev.get("case_id", "")

        if not self._is_case_owner_or_admin(case_id, self._sender()):
            if not self._is_platform_reviewer(self._sender()):
                raise gl.vm.UserError("Only case owner/admin or platform reviewer may flag evidence")

        ev["status"] = "FLAGGED"
        ev["flag_reason"] = self._limit(flag_reason, 600)
        ev["flagged_by"] = self._sender()
        ev["flagged_at"] = flagged_at
        self.evidence[evidence_id] = self._json(ev)

        self.blocked_evidence_hashes[ev.get("url_hash", "")] = evidence_id

        self._record_audit(case_id, "EVIDENCE_FLAGGED", self._sender(), "Evidence flagged: " + evidence_id, flag_reason, flagged_at)

    @gl.public.write
    def restore_evidence(self, evidence_id: str, restored_at: str) -> None:
        self._require_not_paused()
        self._require_owner()

        raw = self.evidence.get(evidence_id, "")
        if raw == "":
            raise gl.vm.UserError("Evidence not found: " + evidence_id)

        ev = self._load(raw)
        ev["status"] = "ACTIVE"
        ev["restored_at"] = restored_at
        self.evidence[evidence_id] = self._json(ev)

        url_hash = ev.get("url_hash", "")
        if url_hash != "":
            self.blocked_evidence_hashes[url_hash] = ""

        self._record_audit(ev.get("case_id", ""), "EVIDENCE_RESTORED", self._sender(), "Evidence restored: " + evidence_id, evidence_id, restored_at)

    # ------------------------------------------------------------------
    # AI consensus review — GenLayer non-deterministic evaluation
    # ------------------------------------------------------------------

    @gl.public.write
    def request_review(
        self,
        case_id: str,
        requested_at: str,
    ) -> str:
        self._require_not_paused()
        self._require_case_owner_or_admin(case_id)

        case = self._require_case_exists(case_id)
        if case.get("status", "") != "open":
            raise gl.vm.UserError("Case must be open to request a review")

        ev_ids_raw = self.case_evidence_index.get(case_id, "")
        if ev_ids_raw == "":
            raise gl.vm.UserError("At least one evidence item must be submitted before requesting review")

        active_count = 0
        for ev_id in ev_ids_raw.split("|"):
            ev_id = ev_id.strip()
            if ev_id == "":
                continue
            raw = self.evidence.get(ev_id, "")
            if raw != "":
                ev = self._load(raw)
                if ev.get("status", "") == "ACTIVE":
                    active_count += 1

        if active_count == 0:
            raise gl.vm.UserError("At least one active evidence item is required")

        sender = self._sender()
        review_id = self._next_id("REV", "review")

        case["status"] = "under_review"
        case["review_count"] = self._to_int(case.get("review_count", 0), 0) + 1
        case["last_review_id"] = review_id
        self.cases[case_id] = self._json(case)

        review_record = {
            "review_id": review_id,
            "case_id": case_id,
            "requested_by": sender,
            "requested_at": requested_at,
            "status": "PENDING",
            "evidence_count": active_count,
        }

        self.review_requests[review_id] = self._json(review_record)
        self.case_review_index[case_id] = self._append(
            self.case_review_index.get(case_id, ""), review_id
        )

        self._update_researcher_stats(sender, "review_requested")

        self._record_audit(
            case_id,
            "REVIEW_REQUESTED",
            sender,
            "AI consensus review requested: " + review_id,
            review_id,
            requested_at,
        )

        return review_id

    @gl.public.write
    def adjudicate_review(
        self,
        review_id: str,
        adjudicated_at: str,
    ) -> str:
        self._require_not_paused()

        raw_review = self.review_requests.get(review_id, "")
        if raw_review == "":
            raise gl.vm.UserError("Review request not found: " + review_id)

        review_record = self._load(raw_review)
        if review_record.get("status", "") not in ["PENDING", "RETRY_PENDING"]:
            raise gl.vm.UserError("Review is not in a pending state")

        case_id = review_record.get("case_id", "")
        case = self._require_case_exists(case_id)

        evidence_packet = self._collect_evidence_packet(case_id)

        ai_verdict = self._run_consensus_review(case, evidence_packet)
        ai_verdict = self._apply_credibility_thresholds(ai_verdict, case)

        verdict_id = self._next_id("VERD", "verdict")
        credibility = ai_verdict["credibility_verdict"]

        verdict_record = {
            "verdict_id": verdict_id,
            "review_id": review_id,
            "case_id": case_id,
            "credibility_verdict": credibility,
            "replication_score": ai_verdict["replication_score"],
            "novelty_score": ai_verdict["novelty_score"],
            "confidence_score": ai_verdict["confidence_score"],
            "statistical_significance": ai_verdict["statistical_significance"],
            "methodology_quality": ai_verdict["methodology_quality"],
            "evidence_strength": ai_verdict["evidence_strength"],
            "contradiction_level": ai_verdict["contradiction_level"],
            "reasoning": ai_verdict["reasoning"],
            "recommended_follow_up": ai_verdict["recommended_follow_up"],
            "key_supporting_evidence": ai_verdict["key_supporting_evidence"],
            "key_concerns": ai_verdict["key_concerns"],
            "methodology_strengths": ai_verdict["methodology_strengths"],
            "methodology_weaknesses": ai_verdict["methodology_weaknesses"],
            "replication_barriers": ai_verdict["replication_barriers"],
            "suggested_follow_up": ai_verdict["suggested_follow_up"],
            "expert_review_required": ai_verdict["expert_review_required"],
            "audit_summary": ai_verdict["audit_summary"],
            "adjudicated_by": "GENLAYER_CONSENSUS",
            "adjudicated_at": adjudicated_at,
        }

        self.verdicts[verdict_id] = self._json(verdict_record)
        self.verdict_index[case_id] = verdict_id

        case_status = "reviewed"
        if credibility in ["partially_credible", "insufficient_evidence"]:
            case_status = "reviewed_needs_expert"

        case["status"] = case_status
        case["last_verdict_id"] = verdict_id
        case["adjudicated_at"] = adjudicated_at
        self.cases[case_id] = self._json(case)

        review_record["status"] = "COMPLETED"
        review_record["verdict_id"] = verdict_id
        review_record["completed_at"] = adjudicated_at
        self.review_requests[review_id] = self._json(review_record)

        if credibility in ["highly_credible", "credible"]:
            self._update_researcher_stats(case.get("owner", ""), "credible_verdict")
        elif credibility == "not_credible":
            self._update_researcher_stats(case.get("owner", ""), "not_credible_verdict")

        self._record_audit(
            case_id,
            "GENLAYER_VERDICT_ISSUED",
            "GENLAYER_CONSENSUS",
            "Consensus credibility verdict: " + credibility + " (replication=" + str(ai_verdict["replication_score"]) + "%)",
            verdict_id,
            adjudicated_at,
        )

        return self._json(verdict_record)

    @gl.public.write
    def request_and_adjudicate(
        self,
        case_id: str,
        requested_at: str,
        adjudicated_at: str,
    ) -> str:
        review_id = self.request_review(case_id, requested_at)
        return self.adjudicate_review(review_id, adjudicated_at)

    @gl.public.write
    def retry_review(
        self,
        case_id: str,
        requested_at: str,
    ) -> str:
        self._require_not_paused()
        self._require_case_owner_or_admin(case_id)

        case = self._require_case_exists(case_id)
        allowed = ["reviewed", "reviewed_needs_expert", "under_review"]
        if case.get("status", "") not in allowed:
            raise gl.vm.UserError("Case must be in a reviewed or under_review state to retry")

        sender = self._sender()
        review_id = self._next_id("REV", "review")

        case["status"] = "under_review"
        case["review_count"] = self._to_int(case.get("review_count", 0), 0) + 1
        case["last_review_id"] = review_id
        self.cases[case_id] = self._json(case)

        ev_ids_raw = self.case_evidence_index.get(case_id, "")
        active_count = 0
        for ev_id in (ev_ids_raw.split("|") if ev_ids_raw else []):
            ev_id = ev_id.strip()
            if ev_id and self.evidence.get(ev_id, "") != "":
                ev = self._load(self.evidence.get(ev_id, "{}"))
                if ev.get("status", "") == "ACTIVE":
                    active_count += 1

        review_record = {
            "review_id": review_id,
            "case_id": case_id,
            "requested_by": sender,
            "requested_at": requested_at,
            "status": "RETRY_PENDING",
            "evidence_count": active_count,
        }

        self.review_requests[review_id] = self._json(review_record)
        self.case_review_index[case_id] = self._append(
            self.case_review_index.get(case_id, ""), review_id
        )

        self._record_audit(case_id, "REVIEW_RETRY_REQUESTED", sender, "AI review retry requested", review_id, requested_at)

        return review_id

    # ------------------------------------------------------------------
    # Expert / human review override
    # ------------------------------------------------------------------

    @gl.public.write
    def submit_expert_review(
        self,
        case_id: str,
        final_credibility_verdict: str,
        expert_replication_score: u256,
        expert_confidence: u256,
        review_notes: str,
        override_reasoning: str,
        evidence_hash: str,
        decided_at: str,
    ) -> str:
        self._require_not_paused()

        if not self._is_platform_reviewer(self._sender()):
            if not self._is_case_owner_or_admin(case_id, self._sender()):
                raise gl.vm.UserError("Only platform reviewers or case admins may submit expert reviews")

        case = self._require_case_exists(case_id)
        allowed_statuses = ["reviewed", "reviewed_needs_expert", "open", "under_review"]
        if case.get("status", "") not in allowed_statuses:
            raise gl.vm.UserError("Case is not eligible for expert review")

        if expert_replication_score > u256(100):
            raise gl.vm.UserError("Expert replication score must be 0 to 100")
        if expert_confidence > u256(100):
            raise gl.vm.UserError("Expert confidence must be 0 to 100")

        final_verdict = self._normalise_credibility_verdict(final_credibility_verdict)
        if final_verdict == "insufficient_evidence":
            raise gl.vm.UserError("Expert review must resolve to a definitive verdict")

        sender = self._sender()
        expert_review_id = self._next_id("XREV", "expert_review")

        review_record = {
            "expert_review_id": expert_review_id,
            "case_id": case_id,
            "reviewer": sender,
            "final_credibility_verdict": final_verdict,
            "expert_replication_score": int(expert_replication_score),
            "expert_confidence": int(expert_confidence),
            "review_notes": self._limit(review_notes, 2000),
            "override_reasoning": self._limit(override_reasoning, 1400),
            "evidence_hash": evidence_hash,
            "decided_at": decided_at,
        }

        self.expert_reviews[expert_review_id] = self._json(review_record)
        self.expert_review_index[case_id] = expert_review_id

        case["status"] = "expert_reviewed"
        case["expert_verdict"] = final_verdict
        case["expert_review_id"] = expert_review_id
        case["expert_reviewed_at"] = decided_at
        self.cases[case_id] = self._json(case)

        accepted = final_verdict in ["highly_credible", "credible"]
        self._update_reviewer_stats(sender, accepted)

        self._record_audit(
            case_id,
            "EXPERT_REVIEW_SUBMITTED",
            sender,
            "Expert review submitted: " + final_verdict,
            evidence_hash,
            decided_at,
        )

        return self._json(review_record)

    @gl.public.write
    def dispute_verdict(
        self,
        case_id: str,
        dispute_reason: str,
        supporting_evidence_ref: str,
        disputed_at: str,
    ) -> None:
        self._require_not_paused()
        self._require_case_owner_or_admin(case_id)

        case = self._require_case_exists(case_id)
        if case.get("status", "") not in ["reviewed", "reviewed_needs_expert", "expert_reviewed"]:
            raise gl.vm.UserError("Case must be reviewed to dispute the verdict")

        case["status"] = "disputed"
        case["dispute_reason"] = self._limit(dispute_reason, 1400)
        case["disputed_by"] = self._sender()
        case["disputed_at"] = disputed_at
        self.cases[case_id] = self._json(case)

        self._record_audit(
            case_id,
            "VERDICT_DISPUTED",
            self._sender(),
            "Verdict disputed: " + self._limit(dispute_reason, 200),
            supporting_evidence_ref,
            disputed_at,
        )

    @gl.public.write
    def resolve_dispute(
        self,
        case_id: str,
        resolution: str,
        resolution_notes: str,
        resolved_at: str,
    ) -> None:
        self._require_not_paused()
        if not self._is_platform_reviewer(self._sender()):
            raise gl.vm.UserError("Only platform reviewers may resolve disputes")

        case = self._require_case_exists(case_id)
        if case.get("status", "") != "disputed":
            raise gl.vm.UserError("Case is not in disputed status")

        final_resolution = self._normalise_status(resolution, "UPHELD|OVERTURNED|REFERRED", "resolution")
        case["status"] = "dispute_resolved"
        case["dispute_resolution"] = final_resolution
        case["dispute_resolution_notes"] = self._limit(resolution_notes, 1000)
        case["dispute_resolved_by"] = self._sender()
        case["dispute_resolved_at"] = resolved_at
        self.cases[case_id] = self._json(case)

        self._record_audit(
            case_id,
            "DISPUTE_RESOLVED",
            self._sender(),
            "Dispute resolved: " + final_resolution,
            final_resolution,
            resolved_at,
        )

    # ------------------------------------------------------------------
    # Read methods for frontend, dashboard, explorer, audit
    # ------------------------------------------------------------------

    @gl.public.view
    def get_research_case(self, case_id: str) -> str:
        return self.cases.get(case_id, "")

    @gl.public.view
    def get_case_index(self) -> str:
        return self.case_index.get("all", "")

    @gl.public.view
    def get_owner_case_index(self, wallet: str) -> str:
        return self.owner_case_index.get(wallet.lower(), "")

    @gl.public.view
    def get_domain_case_index(self, domain: str) -> str:
        return self.domain_case_index.get(domain.lower(), "")

    @gl.public.view
    def get_evidence(self, evidence_id: str) -> str:
        return self.evidence.get(evidence_id, "")

    @gl.public.view
    def get_case_evidence_index(self, case_id: str) -> str:
        return self.case_evidence_index.get(case_id, "")

    @gl.public.view
    def get_review_request(self, review_id: str) -> str:
        return self.review_requests.get(review_id, "")

    @gl.public.view
    def get_case_review_index(self, case_id: str) -> str:
        return self.case_review_index.get(case_id, "")

    @gl.public.view
    def get_verdict(self, verdict_id: str) -> str:
        return self.verdicts.get(verdict_id, "")

    @gl.public.view
    def get_case_verdict(self, case_id: str) -> str:
        verdict_id = self.verdict_index.get(case_id, "")
        if verdict_id == "":
            return ""
        return self.verdicts.get(verdict_id, "")

    @gl.public.view
    def get_latest_verdict_id(self, case_id: str) -> str:
        return self.verdict_index.get(case_id, "")

    @gl.public.view
    def get_expert_review(self, case_id: str) -> str:
        expert_review_id = self.expert_review_index.get(case_id, "")
        if expert_review_id == "":
            return ""
        return self.expert_reviews.get(expert_review_id, "")

    @gl.public.view
    def get_researcher(self, wallet: str) -> str:
        return self.researchers.get(wallet.lower(), "")

    @gl.public.view
    def get_researcher_stats(self, wallet: str) -> str:
        return self.researcher_stats.get(wallet.lower(), "")

    @gl.public.view
    def get_reviewer_stats(self, wallet: str) -> str:
        return self.reviewer_stats.get(wallet.lower(), "")

    @gl.public.view
    def get_audit_log(self, audit_id: str) -> str:
        return self.audit_logs.get(audit_id, "")

    @gl.public.view
    def get_case_audit_index(self, case_id: str) -> str:
        return self.case_audit_index.get(case_id, "")

    @gl.public.view
    def get_case_role(self, case_id: str, wallet: str) -> str:
        return self.case_roles.get(self._key2(case_id, wallet.lower()), "")

    @gl.public.view
    def get_platform_role(self, wallet: str) -> str:
        return self.platform_roles.get(wallet.lower(), "")

    @gl.public.view
    def is_evidence_hash_blocked(self, url_hash: str) -> str:
        return self.blocked_evidence_hashes.get(url_hash, "")

    @gl.public.view
    def get_case_with_verdict(self, case_id: str) -> str:
        case_raw = self.cases.get(case_id, "")
        if case_raw == "":
            return ""
        case = self._load(case_raw)
        verdict_id = self.verdict_index.get(case_id, "")
        if verdict_id != "":
            verdict_raw = self.verdicts.get(verdict_id, "")
            if verdict_raw != "":
                case["verdict"] = self._load(verdict_raw)
        expert_review_id = self.expert_review_index.get(case_id, "")
        if expert_review_id != "":
            expert_raw = self.expert_reviews.get(expert_review_id, "")
            if expert_raw != "":
                case["expert_review"] = self._load(expert_raw)
        return self._json(case)

    @gl.public.view
    def get_case_full_evidence(self, case_id: str) -> str:
        ev_ids_raw = self.case_evidence_index.get(case_id, "")
        if ev_ids_raw == "":
            return "[]"
        result: typing.List[typing.Any] = []
        for ev_id in ev_ids_raw.split("|"):
            ev_id = ev_id.strip()
            if ev_id == "":
                continue
            raw = self.evidence.get(ev_id, "")
            if raw != "":
                result.append(self._load(raw))
        return self._json(result)

    @gl.public.view
    def get_case_summary(self, case_id: str) -> str:
        case_raw = self.cases.get(case_id, "")
        if case_raw == "":
            return ""
        case = self._load(case_raw)
        ev_ids_raw = self.case_evidence_index.get(case_id, "")
        active_ev = 0
        if ev_ids_raw != "":
            for ev_id in ev_ids_raw.split("|"):
                ev_id = ev_id.strip()
                if ev_id and self.evidence.get(ev_id, "") != "":
                    ev = self._load(self.evidence.get(ev_id, "{}"))
                    if ev.get("status", "") == "ACTIVE":
                        active_ev += 1
        verdict_id = self.verdict_index.get(case_id, "")
        review_count = self._to_int(case.get("review_count", 0), 0)
        return self._json({
            "case_id": case_id,
            "title": case.get("title", ""),
            "domain": case.get("domain", ""),
            "authors": case.get("authors", ""),
            "status": case.get("status", ""),
            "owner": case.get("owner", ""),
            "evidence_count": case.get("evidence_count", 0),
            "active_evidence_count": active_ev,
            "review_count": review_count,
            "latest_verdict_id": verdict_id,
            "created_at": case.get("created_at", ""),
        })

    @gl.public.view
    def get_recent_cases(self, limit: u256) -> str:
        all_ids_raw = self.case_index.get("all", "")
        if all_ids_raw == "":
            return "[]"
        all_ids = all_ids_raw.split("|")
        max_items = int(limit) if limit > u256(0) else 20
        if max_items > 50:
            max_items = 50
        # Take from end — most recently added
        result: typing.List[typing.Any] = []
        start = max(0, len(all_ids) - max_items)
        for case_id in reversed(all_ids[start:]):
            case_id = case_id.strip()
            if case_id == "":
                continue
            raw = self.cases.get(case_id, "")
            if raw == "":
                continue
            case = self._load(raw)
            result.append({
                "case_id": case_id,
                "title": case.get("title", ""),
                "domain": case.get("domain", ""),
                "status": case.get("status", ""),
                "owner": case.get("owner", ""),
                "review_count": case.get("review_count", 0),
                "created_at": case.get("created_at", ""),
            })
        return self._json(result)

    @gl.public.view
    def get_cases_by_status(self, status: str) -> str:
        all_ids_raw = self.case_index.get("all", "")
        if all_ids_raw == "":
            return "[]"
        result: typing.List[typing.Any] = []
        for case_id in all_ids_raw.split("|"):
            case_id = case_id.strip()
            if case_id == "":
                continue
            raw = self.cases.get(case_id, "")
            if raw == "":
                continue
            case = self._load(raw)
            if case.get("status", "") == status:
                result.append({
                    "case_id": case_id,
                    "title": case.get("title", ""),
                    "domain": case.get("domain", ""),
                    "status": case.get("status", ""),
                    "owner": case.get("owner", ""),
                    "created_at": case.get("created_at", ""),
                })
        return self._json(result)

    @gl.public.view
    def get_case_audit_logs(self, case_id: str) -> str:
        audit_ids_raw = self.case_audit_index.get(case_id, "")
        if audit_ids_raw == "":
            return "[]"
        result: typing.List[typing.Any] = []
        for audit_id in audit_ids_raw.split("|"):
            audit_id = audit_id.strip()
            if audit_id == "":
                continue
            raw = self.audit_logs.get(audit_id, "")
            if raw != "":
                result.append(self._load(raw))
        return self._json(result)

    @gl.public.view
    def get_case_reviews(self, case_id: str) -> str:
        review_ids_raw = self.case_review_index.get(case_id, "")
        if review_ids_raw == "":
            return "[]"
        result: typing.List[typing.Any] = []
        for review_id in review_ids_raw.split("|"):
            review_id = review_id.strip()
            if review_id == "":
                continue
            raw = self.review_requests.get(review_id, "")
            if raw != "":
                result.append(self._load(raw))
        return self._json(result)

    # ------------------------------------------------------------------
    # Replication attempts — community replication tracking
    # ------------------------------------------------------------------

    @gl.public.write
    def submit_replication_attempt(
        self,
        case_id: str,
        replication_id: str,
        outcome: str,
        replication_summary: str,
        methodology_deviation: str,
        environment_notes: str,
        data_hash: str,
        submitted_at: str,
    ) -> str:
        self._require_not_paused()
        self._require_non_empty(replication_summary, "replication_summary")

        case = self._require_case_exists(case_id)
        allowed_statuses = ["reviewed", "reviewed_needs_expert", "expert_reviewed", "dispute_resolved"]
        if case.get("status", "") not in allowed_statuses:
            raise gl.vm.UserError("Replication attempts can only be submitted after a verdict has been issued")

        final_outcome = self._normalise_status(
            outcome,
            "REPLICATED|PARTIALLY_REPLICATED|FAILED_TO_REPLICATE|INCONCLUSIVE",
            "outcome",
        )

        sender = self._sender()
        if sender == case.get("owner", "").lower():
            raise gl.vm.UserError("The original case owner cannot submit a replication attempt")

        self.replication_counter = self.replication_counter + u256(1)
        final_rep_id = replication_id
        if final_rep_id.strip() == "":
            final_rep_id = "REP-" + str(self.replication_counter)

        if self.replications.get(final_rep_id, "") != "":
            raise gl.vm.UserError("Replication record already exists: " + final_rep_id)

        record = {
            "replication_id": final_rep_id,
            "case_id": case_id,
            "submitted_by": sender,
            "outcome": final_outcome,
            "replication_summary": self._limit(replication_summary, 2000),
            "methodology_deviation": self._limit(methodology_deviation, 1000),
            "environment_notes": self._limit(environment_notes, 800),
            "data_hash": data_hash,
            "submitted_at": submitted_at,
            "status": "SUBMITTED",
        }

        self.replications[final_rep_id] = self._json(record)
        self.case_replication_index[case_id] = self._append(
            self.case_replication_index.get(case_id, ""), final_rep_id
        )

        case["replication_count"] = self._to_int(case.get("replication_count", 0), 0) + 1
        if final_outcome == "REPLICATED":
            case["successful_replications"] = self._to_int(case.get("successful_replications", 0), 0) + 1
        elif final_outcome == "FAILED_TO_REPLICATE":
            case["failed_replications"] = self._to_int(case.get("failed_replications", 0), 0) + 1
        self.cases[case_id] = self._json(case)

        self._record_audit(
            case_id,
            "REPLICATION_SUBMITTED",
            sender,
            "Replication attempt submitted: " + final_outcome,
            data_hash,
            submitted_at,
        )

        return final_rep_id

    @gl.public.view
    def get_replication_attempt(self, replication_id: str) -> str:
        return self.replications.get(replication_id, "")

    @gl.public.view
    def get_case_replications(self, case_id: str) -> str:
        rep_ids_raw = self.case_replication_index.get(case_id, "")
        if rep_ids_raw == "":
            return "[]"
        result: typing.List[typing.Any] = []
        for rep_id in rep_ids_raw.split("|"):
            rep_id = rep_id.strip()
            if rep_id == "":
                continue
            raw = self.replications.get(rep_id, "")
            if raw != "":
                result.append(self._load(raw))
        return self._json(result)

    @gl.public.view
    def get_case_replication_index(self, case_id: str) -> str:
        return self.case_replication_index.get(case_id, "")

    # ------------------------------------------------------------------
    # Citation / cross-reference linking between cases
    # ------------------------------------------------------------------

    @gl.public.write
    def add_citation(
        self,
        citing_case_id: str,
        cited_case_id: str,
        citation_context: str,
        relationship_type: str,
        added_at: str,
    ) -> str:
        self._require_not_paused()
        self._require_case_owner_or_admin(citing_case_id)
        self._require_case_exists(citing_case_id)
        self._require_case_exists(cited_case_id)

        if citing_case_id == cited_case_id:
            raise gl.vm.UserError("A case cannot cite itself")

        final_type = self._normalise_status(
            relationship_type,
            "SUPPORTS|CONTRADICTS|EXTENDS|REPLICATES|RELATED",
            "relationship_type",
        )

        self.citation_counter = self.citation_counter + u256(1)
        citation_id = "CIT-" + str(self.citation_counter)

        record = {
            "citation_id": citation_id,
            "citing_case_id": citing_case_id,
            "cited_case_id": cited_case_id,
            "citation_context": self._limit(citation_context, 800),
            "relationship_type": final_type,
            "added_by": self._sender(),
            "added_at": added_at,
        }

        self.citations[citation_id] = self._json(record)
        self.case_citation_index[citing_case_id] = self._append_unique(
            self.case_citation_index.get(citing_case_id, ""), citation_id
        )
        self.case_cited_by_index[cited_case_id] = self._append_unique(
            self.case_cited_by_index.get(cited_case_id, ""), citation_id
        )

        self._record_audit(
            citing_case_id,
            "CITATION_ADDED",
            self._sender(),
            citing_case_id + " " + final_type + " " + cited_case_id,
            citation_id,
            added_at,
        )

        return citation_id

    @gl.public.view
    def get_citation(self, citation_id: str) -> str:
        return self.citations.get(citation_id, "")

    @gl.public.view
    def get_case_citations(self, case_id: str) -> str:
        cit_ids_raw = self.case_citation_index.get(case_id, "")
        if cit_ids_raw == "":
            return "[]"
        result: typing.List[typing.Any] = []
        for cit_id in cit_ids_raw.split("|"):
            cit_id = cit_id.strip()
            if cit_id == "":
                continue
            raw = self.citations.get(cit_id, "")
            if raw != "":
                result.append(self._load(raw))
        return self._json(result)

    @gl.public.view
    def get_cases_citing(self, case_id: str) -> str:
        cited_by_raw = self.case_cited_by_index.get(case_id, "")
        if cited_by_raw == "":
            return "[]"
        result: typing.List[typing.Any] = []
        for cit_id in cited_by_raw.split("|"):
            cit_id = cit_id.strip()
            if cit_id == "":
                continue
            raw = self.citations.get(cit_id, "")
            if raw != "":
                result.append(self._load(raw))
        return self._json(result)

    # ------------------------------------------------------------------
    # Community endorsement (upvotes on credible cases)
    # ------------------------------------------------------------------

    @gl.public.write
    def upvote_case(self, case_id: str, voted_at: str) -> None:
        self._require_not_paused()
        case = self._require_case_exists(case_id)
        if case.get("status", "") not in ["reviewed", "expert_reviewed", "dispute_resolved"]:
            raise gl.vm.UserError("Only reviewed cases can be upvoted")

        sender = self._sender()
        if sender == case.get("owner", "").lower():
            raise gl.vm.UserError("Case owner cannot upvote their own case")

        key = self._key2(case_id, sender)
        if self.upvotes.get(key, "") != "":
            raise gl.vm.UserError("Already upvoted this case")

        self.upvote_counter = self.upvote_counter + u256(1)
        record = {
            "upvote_id": "UP-" + str(self.upvote_counter),
            "case_id": case_id,
            "voter": sender,
            "voted_at": voted_at,
        }
        self.upvotes[key] = self._json(record)

        current_count = self._to_int(self.case_upvote_count.get(case_id, "0"), 0)
        self.case_upvote_count[case_id] = str(current_count + 1)

        self.wallet_upvote_index[sender] = self._append_unique(
            self.wallet_upvote_index.get(sender, ""), case_id
        )

    @gl.public.write
    def remove_upvote(self, case_id: str) -> None:
        self._require_not_paused()
        sender = self._sender()
        key = self._key2(case_id, sender)
        if self.upvotes.get(key, "") == "":
            raise gl.vm.UserError("No upvote to remove")

        self.upvotes[key] = ""
        current_count = self._to_int(self.case_upvote_count.get(case_id, "0"), 0)
        if current_count > 0:
            self.case_upvote_count[case_id] = str(current_count - 1)

    @gl.public.view
    def get_case_upvote_count(self, case_id: str) -> str:
        return self.case_upvote_count.get(case_id, "0")

    @gl.public.view
    def get_wallet_upvoted_cases(self, wallet: str) -> str:
        return self.wallet_upvote_index.get(wallet.lower(), "")

    @gl.public.view
    def has_upvoted(self, case_id: str, wallet: str) -> str:
        key = self._key2(case_id, wallet.lower())
        raw = self.upvotes.get(key, "")
        return "true" if raw != "" else "false"

    # ------------------------------------------------------------------
    # Watchlist / follow — let researchers track cases
    # ------------------------------------------------------------------

    @gl.public.write
    def follow_case(self, case_id: str, followed_at: str) -> None:
        self._require_not_paused()
        self._require_case_exists(case_id)
        sender = self._sender()
        key = self._key2(sender, case_id)
        if self.watchlist.get(key, "") != "":
            raise gl.vm.UserError("Already following this case")
        self.watchlist[key] = followed_at
        current = self._to_int(self.case_watcher_count.get(case_id, "0"), 0)
        self.case_watcher_count[case_id] = str(current + 1)
        self.wallet_watchlist_index[sender] = self._append_unique(
            self.wallet_watchlist_index.get(sender, ""), case_id
        )

    @gl.public.write
    def unfollow_case(self, case_id: str) -> None:
        self._require_not_paused()
        sender = self._sender()
        key = self._key2(sender, case_id)
        if self.watchlist.get(key, "") == "":
            raise gl.vm.UserError("Not following this case")
        self.watchlist[key] = ""
        current = self._to_int(self.case_watcher_count.get(case_id, "0"), 0)
        if current > 0:
            self.case_watcher_count[case_id] = str(current - 1)

    @gl.public.view
    def get_wallet_watchlist(self, wallet: str) -> str:
        return self.wallet_watchlist_index.get(wallet.lower(), "")

    @gl.public.view
    def get_case_watcher_count(self, case_id: str) -> str:
        return self.case_watcher_count.get(case_id, "0")

    @gl.public.view
    def is_following(self, wallet: str, case_id: str) -> str:
        key = self._key2(wallet.lower(), case_id)
        return "true" if self.watchlist.get(key, "") != "" else "false"

    # ------------------------------------------------------------------
    # Domain / research field management
    # ------------------------------------------------------------------

    @gl.public.write
    def register_domain(
        self,
        domain_id: str,
        display_name: str,
        description: str,
        parent_domain: str,
        registered_at: str,
    ) -> str:
        self._require_owner()
        self._require_non_empty(domain_id, "domain_id")
        self._require_non_empty(display_name, "display_name")

        final_id = domain_id.lower().replace(" ", "_")
        if self.domains.get(final_id, "") != "":
            raise gl.vm.UserError("Domain already registered: " + final_id)

        self.domain_counter = self.domain_counter + u256(1)
        record = {
            "domain_id": final_id,
            "display_name": self._limit(display_name, 200),
            "description": self._limit(description, 800),
            "parent_domain": parent_domain.lower().replace(" ", "_"),
            "case_count": 0,
            "registered_at": registered_at,
            "registered_by": self._sender(),
        }

        self.domains[final_id] = self._json(record)
        self.domain_index["all"] = self._append_unique(self.domain_index.get("all", ""), final_id)

        return final_id

    @gl.public.view
    def get_domain(self, domain_id: str) -> str:
        return self.domains.get(domain_id.lower(), "")

    @gl.public.view
    def get_all_domains(self) -> str:
        all_raw = self.domain_index.get("all", "")
        if all_raw == "":
            return "[]"
        result: typing.List[typing.Any] = []
        for d_id in all_raw.split("|"):
            d_id = d_id.strip()
            if d_id == "":
                continue
            raw = self.domains.get(d_id, "")
            if raw != "":
                result.append(self._load(raw))
        return self._json(result)

    # ------------------------------------------------------------------
    # Platform-level statistics aggregation
    # ------------------------------------------------------------------

    @gl.public.view
    def get_platform_stats(self) -> str:
        all_ids_raw = self.case_index.get("all", "")
        total_cases = 0
        open_cases = 0
        reviewed_cases = 0
        expert_reviewed_cases = 0
        disputed_cases = 0
        highly_credible = 0
        credible_count = 0
        partially_credible = 0
        insufficient_count = 0
        not_credible_count = 0
        total_evidence = int(self.evidence_counter)
        total_verdicts = int(self.verdict_counter)

        if all_ids_raw != "":
            for case_id in all_ids_raw.split("|"):
                case_id = case_id.strip()
                if case_id == "":
                    continue
                raw = self.cases.get(case_id, "")
                if raw == "":
                    continue
                total_cases += 1
                case = self._load(raw)
                status = case.get("status", "")
                if status == "open":
                    open_cases += 1
                elif status in ["reviewed", "reviewed_needs_expert"]:
                    reviewed_cases += 1
                elif status == "expert_reviewed":
                    expert_reviewed_cases += 1
                elif status == "disputed":
                    disputed_cases += 1

                verdict_id = self.verdict_index.get(case_id, "")
                if verdict_id != "":
                    verdict_raw = self.verdicts.get(verdict_id, "")
                    if verdict_raw != "":
                        verdict = self._load(verdict_raw)
                        cv = verdict.get("credibility_verdict", "")
                        if cv == "highly_credible":
                            highly_credible += 1
                        elif cv == "credible":
                            credible_count += 1
                        elif cv == "partially_credible":
                            partially_credible += 1
                        elif cv == "insufficient_evidence":
                            insufficient_count += 1
                        elif cv == "not_credible":
                            not_credible_count += 1

        return self._json({
            "total_cases": total_cases,
            "open_cases": open_cases,
            "reviewed_cases": reviewed_cases,
            "expert_reviewed_cases": expert_reviewed_cases,
            "disputed_cases": disputed_cases,
            "verdict_breakdown": {
                "highly_credible": highly_credible,
                "credible": credible_count,
                "partially_credible": partially_credible,
                "insufficient_evidence": insufficient_count,
                "not_credible": not_credible_count,
            },
            "total_evidence": total_evidence,
            "total_verdicts": total_verdicts,
            "total_researchers": str(self.researcher_counter),
            "total_replications": str(self.replication_counter),
            "total_citations": str(self.citation_counter),
            "total_expert_reviews": str(self.expert_review_counter),
        })

    @gl.public.view
    def get_credibility_leaderboard(self, limit: u256) -> str:
        all_ids_raw = self.case_index.get("all", "")
        if all_ids_raw == "":
            return "[]"
        max_items = int(limit) if limit > u256(0) else 10
        if max_items > 50:
            max_items = 50

        result: typing.List[typing.Any] = []
        for case_id in all_ids_raw.split("|"):
            case_id = case_id.strip()
            if case_id == "":
                continue
            verdict_id = self.verdict_index.get(case_id, "")
            if verdict_id == "":
                continue
            verdict_raw = self.verdicts.get(verdict_id, "")
            if verdict_raw == "":
                continue
            verdict = self._load(verdict_raw)
            case_raw = self.cases.get(case_id, "")
            if case_raw == "":
                continue
            case = self._load(case_raw)
            result.append({
                "case_id": case_id,
                "title": case.get("title", ""),
                "domain": case.get("domain", ""),
                "credibility_verdict": verdict.get("credibility_verdict", ""),
                "replication_score": verdict.get("replication_score", 0),
                "confidence_score": verdict.get("confidence_score", 0),
                "upvotes": self._to_int(self.case_upvote_count.get(case_id, "0"), 0),
            })

        # Sort descending by replication_score
        for i in range(len(result)):
            for j in range(i + 1, len(result)):
                if result[j]["replication_score"] > result[i]["replication_score"]:
                    result[i], result[j] = result[j], result[i]

        return self._json(result[:max_items])

    # ------------------------------------------------------------------
    # Convenience: rich aggregate view for case detail page
    # ------------------------------------------------------------------

    @gl.public.view
    def get_case_full_detail(self, case_id: str) -> str:
        case_raw = self.cases.get(case_id, "")
        if case_raw == "":
            return ""
        case = self._load(case_raw)

        # Attach verdict
        verdict_id = self.verdict_index.get(case_id, "")
        if verdict_id != "":
            v_raw = self.verdicts.get(verdict_id, "")
            if v_raw != "":
                case["verdict"] = self._load(v_raw)

        # Attach expert review
        expert_id = self.expert_review_index.get(case_id, "")
        if expert_id != "":
            e_raw = self.expert_reviews.get(expert_id, "")
            if e_raw != "":
                case["expert_review"] = self._load(e_raw)

        # Attach active evidence list
        ev_ids_raw = self.case_evidence_index.get(case_id, "")
        active_ev: typing.List[typing.Any] = []
        if ev_ids_raw != "":
            for ev_id in ev_ids_raw.split("|"):
                ev_id = ev_id.strip()
                if ev_id == "":
                    continue
                r = self.evidence.get(ev_id, "")
                if r != "":
                    ev = self._load(r)
                    if ev.get("status", "") == "ACTIVE":
                        active_ev.append(ev)
        case["active_evidence"] = active_ev

        # Attach citations summary
        cit_ids_raw = self.case_citation_index.get(case_id, "")
        citations_list: typing.List[typing.Any] = []
        if cit_ids_raw != "":
            for cit_id in cit_ids_raw.split("|"):
                cit_id = cit_id.strip()
                if cit_id == "":
                    continue
                c_raw = self.citations.get(cit_id, "")
                if c_raw != "":
                    citations_list.append(self._load(c_raw))
        case["citations"] = citations_list

        # Attach replication summary
        rep_ids_raw = self.case_replication_index.get(case_id, "")
        reps: typing.List[typing.Any] = []
        if rep_ids_raw != "":
            for rep_id in rep_ids_raw.split("|"):
                rep_id = rep_id.strip()
                if rep_id == "":
                    continue
                r_raw = self.replications.get(rep_id, "")
                if r_raw != "":
                    rep = self._load(r_raw)
                    reps.append({
                        "replication_id": rep.get("replication_id", ""),
                        "outcome": rep.get("outcome", ""),
                        "submitted_by": rep.get("submitted_by", ""),
                        "submitted_at": rep.get("submitted_at", ""),
                    })
        case["replications"] = reps

        # Community stats
        case["upvote_count"] = self._to_int(self.case_upvote_count.get(case_id, "0"), 0)
        case["watcher_count"] = self._to_int(self.case_watcher_count.get(case_id, "0"), 0)

        return self._json(case)
