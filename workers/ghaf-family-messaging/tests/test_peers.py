"""Synthetic PostgreSQL peer authorization tests; no hosted acceptance is implied."""

import concurrent.futures
import subprocess
import unittest
import uuid

from test_rpc import ROOT, PSQL, ident, quote, rpc, sql


class PeerMessagingSQL(unittest.TestCase):
    def setUp(self):
        subprocess.run(PSQL + ["-f", str(ROOT / "fixtures.sql")], capture_output=True, check=True)

    def denied(self, name, *args, user=1, code="not_authorized"):
        self.assertEqual(rpc(name, *args, user=user), {"code": code, "message": code})

    def enable(self, first=1, second=2):
        self.assertEqual(rpc("fm_set_peer_permission", ident(3, first), ident(3, second), True), {"ok": True})
        return rpc("fm_peer_permissions")[0]["threadId"]

    def send(self, thread, user=3, body="Can you help me?", phrase="help", key=None):
        return rpc("fm_send", thread, key or str(uuid.uuid4()), body, phrase, user=user)

    def test_explicit_canonical_permission_preserves_parent_threads_and_children(self):
        parents = rpc("fm_threads")
        inventory = rpc("fm_children")
        permission = rpc("fm_peer_permissions")[0]
        self.assertFalse(permission["enabled"])
        self.assertIsNone(permission["threadId"])
        self.assertTrue(permission["available"])
        peer = self.enable(2, 1)
        self.assertEqual(self.enable(1, 2), peer)
        self.assertEqual(rpc("fm_threads"), parents)
        self.assertEqual(rpc("fm_children"), inventory)
        self.assertEqual(sql("select count(*) from fm_private.threads where kind='child_child';"), "1")
        for user, other in [(3, 2), (4, 1)]:
            threads = rpc("fm_threads", user=user)
            self.assertEqual(len(threads), 2)
            item = next(t for t in threads if t["kind"] == "child_child")
            self.assertEqual(item["childId"], ident(3, other))
            self.assertEqual(item["otherRole"], "child")

    def test_parent_can_manage_but_cannot_read_send_or_leave_peer_content(self):
        peer = self.enable()
        sent = self.send(peer)
        self.assertEqual(rpc("fm_messages", peer, user=4), [sent])
        self.denied("fm_messages", peer)
        self.denied("fm_send", peer, str(uuid.uuid4()), "Parent intrusion")
        self.denied("fm_leave_peer_thread", peer)
        self.assertNotIn(peer, [t["id"] for t in rpc("fm_threads")])
        self.assertNotIn("body", str(rpc("fm_peer_permissions")))

    def test_peer_management_denies_children_cross_family_unknown_and_inactive(self):
        self.denied("fm_peer_permissions", user=3)
        self.denied("fm_set_peer_permission", ident(3, 1), ident(3, 2), True, user=3)
        self.denied("fm_set_peer_permission", ident(3, 1), ident(3, 3), True)
        self.denied("fm_set_peer_permission", ident(3, 1), ident(3, 99), True)
        self.denied("fm_set_peer_permission", ident(3, 1), ident(3, 2), True, user=2)
        sql(f"update fm_private.children set active=false where id={quote(ident(3, 2))};")
        self.denied("fm_set_peer_permission", ident(3, 1), ident(3, 2), True)
        self.assertEqual(rpc("fm_peer_permissions"), [])

    def test_permission_requires_real_enrolled_devices_not_created_child_ids(self):
        sql(f"update fm_private.devices set active=false where child_id={quote(ident(3, 2))};")
        self.assertFalse(rpc("fm_peer_permissions")[0]["available"])
        self.denied("fm_set_peer_permission", ident(3, 1), ident(3, 2), True)
        sql(f"update fm_private.devices set active=true where child_id={quote(ident(3, 2))};")
        sql(f"delete from auth.sessions where id={quote(ident(1, 4))};")
        self.denied("fm_set_peer_permission", ident(3, 1), ident(3, 2), True)

    def test_malformed_equal_and_null_permissions_fail_without_creating_thread(self):
        for first, second, enabled in [("broken", ident(3, 2), True), (None, ident(3, 2), True),
                                        (ident(3, 1), ident(3, 1), True), (ident(3, 1), ident(3, 2), None)]:
            self.denied("fm_set_peer_permission", first, second, enabled, code="invalid_request")
        self.denied("fm_leave_peer_thread", "bad", user=3, code="invalid_request")
        self.assertEqual(sql("select count(*) from fm_private.threads where kind='child_child';"), "0")

    def test_revocation_immediately_denies_reads_sends_and_retry_receipts(self):
        peer = self.enable()
        key = str(uuid.uuid4())
        accepted = self.send(peer, key=key)
        self.assertEqual(self.send(peer, key=key), accepted)
        rpc("fm_set_peer_permission", ident(3, 2), ident(3, 1), False)
        for user in [3, 4]:
            self.denied("fm_messages", peer, user=user)
            self.denied("fm_send", peer, key, "Can you help me?", "help", user=user)
            self.assertEqual(len(rpc("fm_threads", user=user)), 1)
        self.assertEqual(self.enable(), peer)
        self.assertEqual(rpc("fm_messages", peer, user=4), [accepted])

    def test_either_child_can_leave_idempotently_but_only_parent_can_reenable(self):
        peer = self.enable()
        for user in [3, 4]:
            self.assertEqual(rpc("fm_leave_peer_thread", peer, user=user), {"ok": True})
            self.assertEqual(rpc("fm_leave_peer_thread", peer, user=user), {"ok": True})
            self.assertFalse(rpc("fm_peer_permissions")[0]["enabled"])
            self.denied("fm_set_peer_permission", ident(3, 1), ident(3, 2), True, user=user)
            self.assertEqual(self.enable(), peer)
        self.denied("fm_leave_peer_thread", ident(4, 1), user=3)
        self.denied("fm_leave_peer_thread", peer, user=2)

    def test_peer_checks_both_active_children_and_current_provider_session(self):
        peer = self.enable()
        sql(f"update fm_private.children set active=false where id={quote(ident(3, 2))};")
        self.denied("fm_messages", peer, user=3)
        self.denied("fm_send", peer, str(uuid.uuid4()), "Test", user=3)
        sql(f"update fm_private.children set active=true where id={quote(ident(3, 2))};")
        sql(f"delete from auth.sessions where id={quote(ident(1, 3))};")
        self.denied("fm_messages", peer, user=3, code="not_authenticated")
        self.denied("fm_leave_peer_thread", peer, user=3, code="not_authenticated")

    def test_peer_sender_age_and_message_limit_are_still_enforced(self):
        peer = self.enable()
        self.denied("fm_send", peer, str(uuid.uuid4()), "Uncurated text", None, user=4, code="invalid_message")
        self.assertEqual(self.send(peer, user=4)["body"], "Can you help me?")
        self.denied("fm_send", peer, str(uuid.uuid4()), "x" * 501, None, user=3, code="invalid_message")
        self.assertEqual(self.send(peer, body="🌳" * 500, phrase=None)["body"], "🌳" * 500)

    def test_concurrent_reversed_enables_have_one_pair_and_same_key_one_message(self):
        with concurrent.futures.ThreadPoolExecutor(max_workers=2) as executor:
            results = list(executor.map(lambda pair: rpc("fm_set_peer_permission", ident(3, pair[0]), ident(3, pair[1]), True), [(1, 2), (2, 1)]))
        self.assertEqual(results, [{"ok": True}, {"ok": True}])
        self.assertEqual(sql("select count(*) from fm_private.threads where kind='child_child';"), "1")
        peer = rpc("fm_peer_permissions")[0]["threadId"]
        key = str(uuid.uuid4())
        with concurrent.futures.ThreadPoolExecutor(max_workers=2) as executor:
            records = list(executor.map(lambda _: self.send(peer, key=key), range(2)))
        self.assertEqual(records[0], records[1])
        self.assertEqual(sql("select count(*) from fm_private.messages;"), "1")

    def test_nonparticipant_same_household_child_cannot_discover_read_send_or_leave(self):
        peer = self.enable()
        third = rpc("fm_create_child", "Synthetic third sibling", "12_14")
        invitation = rpc("fm_invite", third["id"])
        rpc("fm_enroll", invitation["code"], "Third test device", user=5)
        self.assertNotIn(peer, [t["id"] for t in rpc("fm_threads", user=5)])
        self.denied("fm_messages", peer, user=5)
        self.denied("fm_send", peer, str(uuid.uuid4()), "No access", user=5)
        self.denied("fm_leave_peer_thread", peer, user=5)

    def test_other_household_parent_and_enrolled_child_have_no_peer_access(self):
        peer = self.enable()
        invitation = rpc("fm_invite", ident(3, 3), user=2)
        rpc("fm_enroll", invitation["code"], "Other household device", user=5)
        for user in [2, 5]:
            self.assertNotIn(peer, [t["id"] for t in rpc("fm_threads", user=user)])
            self.denied("fm_messages", peer, user=user)
            self.denied("fm_send", peer, str(uuid.uuid4()), "No access", user=user)
            self.denied("fm_leave_peer_thread", peer, user=user)


if __name__ == "__main__":
    unittest.main(verbosity=2)
