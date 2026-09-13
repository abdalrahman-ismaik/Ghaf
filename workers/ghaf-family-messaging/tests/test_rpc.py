"""Actual isolated PostgreSQL tests. Synthetic claims are not real provider-login evidence."""

import concurrent.futures
import json
import os
from pathlib import Path
import subprocess
import time
import unittest
import uuid


ROOT = Path(__file__).resolve().parent
PSQL = [os.environ["FM_TEST_PSQL"], "-X", "-qAt", "-v", "ON_ERROR_STOP=1"]


def ident(prefix, number):
    return f"{prefix}0000000-0000-4000-8000-{number:012d}"


def quote(value):
    if value is None:
        return "null"
    if isinstance(value, int):
        return str(value)
    return "'" + str(value).replace("'", "''") + "'"


def sql(text):
    result = subprocess.run(PSQL, input=text, text=True, capture_output=True, check=False)
    if result.returncode:
        raise AssertionError(f"SQL command failed: {result.stderr.strip()}")
    return result.stdout.strip()


def claims(user=1, session=None, extra=None):
    data = {"sub": ident(0, user), "session_id": ident(1, session or user), "role": "authenticated"}
    data.update(extra or {})
    return f"set local role authenticated; set local request.jwt.claims = {quote(json.dumps(data))};"


def call_text(name, *args):
    return "select public." + name + "(" + ",".join(quote(arg) for arg in args) + ");"


def rpc(name, *args, user=1, session=None, extra=None):
    return json.loads(sql("begin;" + claims(user, session, extra) + call_text(name, *args) + "commit;"))


class MessagingSQL(unittest.TestCase):
    def setUp(self):
        subprocess.run(PSQL + ["-f", str(ROOT / "fixtures.sql")], capture_output=True, check=True)

    def denied(self, name, *args, user=1, code="not_authorized", session=None, extra=None):
        self.assertEqual(rpc(name, *args, user=user, session=session, extra=extra), {"code": code, "message": code})

    def invite(self, child=1):
        return rpc("fm_invite", ident(3, child))["code"]

    def send(self, body="Synthetic test message", user=1, thread=1, key=None, phrase=None):
        return rpc("fm_send", ident(4, thread), key or str(uuid.uuid4()), body, phrase, user=user)

    def test_success_contract_and_scoped_metadata(self):
        context = rpc("fm_context")
        self.assertEqual(set(context), {"role", "personId", "displayName", "householdId", "deviceId", "ageBand"})
        self.assertEqual(context["role"], "parent")
        self.assertIsNone(context["ageBand"])
        child = rpc("fm_context", user=3)
        self.assertEqual(child["personId"], ident(3, 1))
        self.assertEqual(child["ageBand"], "9_11")
        self.assertEqual(len(rpc("fm_children")), 2)
        self.assertEqual(len(rpc("fm_threads", user=3)), 1)
        self.assertEqual(rpc("fm_threads", user=3)[0]["otherRole"], "parent")
        devices = rpc("fm_devices")
        self.assertEqual(len(devices), 3)
        self.assertEqual(sum(d["current"] for d in devices), 1)
        self.assertTrue(all(set(d) == {"id", "personName", "role", "label", "active", "current"} for d in devices))
        self.assertNotIn(ident(5, 2), [d["id"] for d in devices])

    def test_direct_tables_private_helpers_and_purge_denied(self):
        for role in ["anon", "authenticated"]:
            for statement in ["select * from fm_private.messages", "select fm_private.identity()", "select public.fm_purge_expired()"]:
                result = subprocess.run(PSQL, input=f"set role {role};{statement};", text=True, capture_output=True)
                self.assertNotEqual(result.returncode, 0)
                self.assertIn("permission denied", result.stderr)
        for statement in ["select public.fm_context()", "select public.fm_enroll('a','b')"]:
            result = subprocess.run(PSQL, input=f"set role anon;{statement};", text=True, capture_output=True)
            self.assertNotEqual(result.returncode, 0)
        self.assertEqual(sql("select count(*) from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='fm_private' and c.relkind='r' and not c.relrowsecurity;"), "0")
        self.assertEqual(sql("select count(*) from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname like 'fm_%' and (not p.prosecdef or not ('search_path=\"\"'=any(p.proconfig)));"), "0")
        self.assertEqual(sql("select count(*) from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname like 'fm_%' and has_function_privilege('anon',p.oid,'EXECUTE');"), "0")

    def test_unknown_malformed_deleted_banned_and_mismatched_auth(self):
        for extra in [{"sub": ident(0, 99)}, {"sub": "broken"}, {"session_id": "broken"}, {"session_id": None}]:
            self.denied("fm_context", extra=extra, code="not_authenticated")
        self.denied("fm_context", user=3, session=1, code="not_authenticated")
        sql(f"update auth.users set deleted_at=clock_timestamp() where id={quote(ident(0,1))};")
        self.denied("fm_context", code="not_authenticated")
        sql(f"update auth.users set deleted_at=null,banned_until=clock_timestamp()+interval '1 day' where id={quote(ident(0,1))};")
        self.denied("fm_context", code="not_authenticated")

    def test_expired_and_deleted_provider_sessions_denied_with_claims_retained(self):
        sql(f"update auth.sessions set not_after=clock_timestamp()-interval '1 second' where id={quote(ident(1,3))};")
        self.denied("fm_context", user=3, code="not_authenticated")
        sql(f"delete from auth.sessions where id={quote(ident(1,1))};")
        self.denied("fm_register_parent", "Parent", code="not_authenticated")
        self.denied("fm_messages", ident(4,1), code="not_authenticated")

    def test_client_claims_cannot_provision_parent(self):
        self.denied("fm_register_parent", "unknown", user=5, extra={"user_metadata": {"role":"parent", "parent_id":ident(0,1)}, "role":"parent"})
        self.denied("fm_context", user=5)
        self.denied("fm_messages", ident(4,1), user=5)

    def test_malformed_uuid_arguments_have_safe_contract_errors(self):
        for invalid in ["malformed", "", None]:
            self.denied("fm_invite",invalid,code="invalid_request")
            self.denied("fm_revoke_device",invalid,code="invalid_request")
            self.denied("fm_messages",invalid,code="invalid_request")
            self.denied("fm_send",invalid,str(uuid.uuid4()),"Test",code="invalid_request")
            self.denied("fm_send",ident(4,1),invalid,"Test",code="invalid_request")

    def test_provider_parent_ban_or_deletion_denies_child_and_enrollment(self):
        code = self.invite()
        sql(f"update auth.users set banned_until=clock_timestamp()+interval '1 day' where id={quote(ident(0,1))};")
        self.denied("fm_context",user=3,code="access_revoked")
        self.denied("fm_messages",ident(4,1),user=3,code="access_revoked")
        self.denied("fm_enroll",code,"Test",user=5,code="invalid_invite")
        sql(f"delete from auth.sessions where user_id={quote(ident(0,1))}; delete from auth.users where id={quote(ident(0,1))};")
        self.denied("fm_context",user=3,code="access_revoked")
        self.denied("fm_enroll",code,"Test",user=5,code="invalid_invite")
        self.assertEqual(sql(f"select count(*) from fm_private.parents where id={quote(ident(0,1))};"),"1")

    def test_provider_child_hard_delete_preserves_history_but_denies_old_claims(self):
        self.send(user=3)
        sql(f"delete from auth.sessions where user_id={quote(ident(0,3))}; delete from auth.users where id={quote(ident(0,3))};")
        self.denied("fm_context",user=3,code="not_authenticated")
        self.assertEqual(len(rpc("fm_messages",ident(4,1))),1)

    def test_parent_registration_new_session_idempotent_but_revoked_never_resurrects(self):
        session = ident(1, 30)
        sql(f"insert into auth.sessions(id,user_id) values ({quote(session)},{quote(ident(0,1))});")
        registered = rpc("fm_register_parent", "New test device", session=30)
        self.assertEqual(registered["role"], "parent")
        self.assertEqual(registered, rpc("fm_register_parent", "New test device", session=30))
        self.assertEqual(rpc("fm_revoke_device", registered["deviceId"]), {"ok":True})
        self.denied("fm_register_parent", "Retry", session=30, code="access_revoked")

    def test_create_child_thread_and_validation(self):
        child = rpc("fm_create_child", "Synthetic Child D", "12_14")
        self.assertEqual(set(child), {"id", "displayName", "ageBand", "threadId", "active"})
        self.assertEqual(len(rpc("fm_children")), 3)
        self.assertEqual(sql(f"select count(*) from fm_private.threads where child_id={quote(child['id'])};"), "1")
        self.denied("fm_create_child", "A", "old", code="invalid_request")
        self.denied("fm_create_child", " " * 4, "9_11", code="invalid_request")
        self.denied("fm_create_child", "X" * 61, "9_11", code="invalid_request")

    def test_cross_household_and_sibling_all_privileged_rpcs(self):
        for name, args in [("fm_messages",[ident(4,2)]),("fm_send",[ident(4,2),str(uuid.uuid4()),"No"]),
            ("fm_children",[]),("fm_create_child",["No","9_11"]),("fm_devices",[]),
            ("fm_invite",[ident(3,1)]),("fm_revoke_device",[ident(5,4)]),("fm_revoke_account",[])]:
            self.denied(name,*args,user=3)
        for name, args in [("fm_messages",[ident(4,3)]),("fm_send",[ident(4,3),str(uuid.uuid4()),"No"]),
            ("fm_invite",[ident(3,3)]),("fm_revoke_device",[ident(5,2)])]:
            self.denied(name,*args)

    def test_enrollment_entropy_one_use_same_session_retry_and_hash_only(self):
        code = self.invite()
        self.assertRegex(code, r"^[0-9a-f]{32}$")
        self.assertEqual(code[12], "4")
        self.assertIn(code[16], "89ab")
        self.assertEqual(sql("select octet_length(code_hash) from fm_private.invitations;"), "32")
        enrolled = rpc("fm_enroll", code, "Test new Child", user=5)
        self.assertEqual(enrolled["personId"], ident(3,1))
        self.assertEqual(enrolled, rpc("fm_enroll", code, "Test retry", user=5))
        self.denied("fm_enroll", code, "Test thief", user=6, code="invalid_invite")
        self.denied("fm_messages", ident(4,2), user=5)
        self.denied("fm_enroll", code, "Parent cannot enroll", code="not_authorized")
        sql(f"update auth.users set is_anonymous=false where id={quote(ident(0,6))};")
        self.denied("fm_enroll", code, "Non-anonymous cannot enroll", user=6)

    def test_enrollment_expired_revoked_replaced_and_wrong_code(self):
        first = self.invite()
        second = self.invite()
        self.denied("fm_enroll", first, "Test", user=5, code="invalid_invite")
        sql("update fm_private.invitations set expires_at=clock_timestamp()-interval '1 second';")
        self.denied("fm_enroll", second, "Test", user=5, code="invalid_invite")
        self.denied("fm_enroll", "a"*32, "Test", user=5, code="invalid_invite")
        self.assertEqual(sql(f"select count(*) from fm_private.devices where provider_user_id={quote(ident(0,5))};"), "0")

    def test_invalid_attempts_persist_and_http_status_is_safe(self):
        for _ in range(10):
            self.denied("fm_enroll", "bad", "Test", user=5, code="invalid_invite")
        self.denied("fm_enroll", "bad", "Test", user=5, code="rate_limited")
        self.assertEqual(sql(f"select count from fm_private.attempts where actor_id={quote(ident(0,5))} and action='enroll';"), "11")
        result = sql("begin;"+claims(5)+call_text("fm_enroll", "bad", "Test")+"select current_setting('response.status');commit;").splitlines()
        self.assertEqual(result[-1], "429")
        self.assertEqual(json.loads(result[0]), {"code":"rate_limited", "message":"rate_limited"})

    def test_message_invite_create_and_register_rates(self):
        for _ in range(30):
            self.denied("fm_send", ident(4,1),str(uuid.uuid4())," ",code="invalid_message")
        self.denied("fm_send",ident(4,1),str(uuid.uuid4()),"Valid",code="rate_limited")
        for _ in range(10):
            self.denied("fm_invite", ident(3,99))
        self.denied("fm_invite",ident(3,1),code="rate_limited")
        for _ in range(10):
            self.denied("fm_create_child", "", "9_11",code="invalid_request")
        self.denied("fm_create_child","Valid","9_11",code="rate_limited")
        sql(f"insert into auth.sessions(id,user_id) values ({quote(ident(1,30))},{quote(ident(0,1))});")
        for _ in range(10):
            self.denied("fm_register_parent", "",session=30,code="invalid_request")
        self.denied("fm_register_parent","Valid",session=30,code="rate_limited")

    def test_idempotency_original_conflict_and_authorize_before_lookup(self):
        key = str(uuid.uuid4())
        message = self.send(key=key)
        self.assertEqual(message, self.send(key=key))
        self.denied("fm_send",ident(4,1),key,"Changed",code="idempotency_conflict")
        self.denied("fm_send",ident(4,2),key,"Synthetic test message",code="idempotency_conflict")
        self.denied("fm_send",ident(4,3),key,"Synthetic test message")
        self.assertEqual(set(message), {"id", "threadId", "senderId", "body", "sequence", "createdAt", "clientKey"})
        self.assertEqual(message["senderId"],ident(0,1))
        self.assertEqual(sql("select count(*) from fm_private.messages;"),"1")
        child = self.send(user=3,key=key)
        self.assertEqual(child["senderId"],ident(3,1))
        self.assertNotEqual(child["id"],message["id"])

    def test_unicode_codepoint_bounds_whitespace_and_inert_plain_text(self):
        self.assertEqual(self.send(body="🌳"*500)["body"],"🌳"*500)
        self.assertEqual(self.send(body="a\u0301"*250)["body"],"a\u0301"*250)
        for body in ["🌳"*501, "", " \t\r\n", None, "\u00a0", "\u0085", "\u2007", "\u202f", "\ufeff", "\u2000", "\u3000", "a\u0301"*251]:
            self.denied("fm_send",ident(4,1),str(uuid.uuid4()),body,code="invalid_message")
        plain = '<script>hello</script> https://example.invalid/test **text**'
        self.assertEqual(self.send(body=plain)["body"],plain)

    def test_operator_provisioning_requires_verified_account_and_explicit_restoration(self):
        provision = (ROOT.parent / "provision-parent.sql").read_text()
        untouched = subprocess.run(PSQL,input=provision,text=True,capture_output=True)
        self.assertNotEqual(untouched.returncode,0)
        self.assertIn("Replace the placeholder",untouched.stderr)
        candidate = provision.replace("v_provider_user_id uuid := '00000000-0000-0000-0000-000000000000'",f"v_provider_user_id uuid := '{ident(0,9)}'")
        unverified = subprocess.run(PSQL,input=candidate,text=True,capture_output=True)
        self.assertNotEqual(unverified.returncode,0)
        self.assertIn("confirmed active non-anonymous",unverified.stderr)
        sql(f"update auth.users set is_anonymous=false,email_confirmed_at=clock_timestamp() where id={quote(ident(0,9))};")
        sql(candidate)
        self.assertEqual(rpc("fm_register_parent","Operator-provisioned test",user=9)["role"],"parent")
        self.assertEqual(rpc("fm_revoke_account",user=9),{"ok":True})
        revoked = subprocess.run(PSQL,input=candidate,text=True,capture_output=True)
        self.assertNotEqual(revoked.returncode,0)
        self.assertIn("operator must explicitly review",revoked.stderr)
        sql(candidate.replace("v_restore_inactive boolean := false","v_restore_inactive boolean := true"))
        self.denied("fm_register_parent","Old revoked session",user=9,code="access_revoked")

    def test_retention_operator_script_fails_without_real_cron_extension(self):
        result = subprocess.run(PSQL,input=(ROOT.parent / "retention.sql").read_text(),text=True,capture_output=True)
        self.assertNotEqual(result.returncode,0)
        self.assertIn("Enable the reviewed Supabase Cron extension",result.stderr)

    def test_age_six_to_eight_exact_bilingual_curated_allowlist(self):
        phrases = {
            "help": ["هل يمكنك مساعدتي؟", "Can you help me?"],
            "ready": ["أنا مستعدّ.", "I am ready."],
            "thanks": ["شكرًا لمساعدتك.", "Thank you for helping."],
            "pause": ["أحتاج إلى استراحة قصيرة.", "I need a short break."],
        }
        for phrase, bodies in phrases.items():
            for body in bodies:
                self.assertEqual(self.send(user=4,thread=2,body=body,phrase=phrase)["body"],body)
        for body,phrase in [("Edited", "help"),("Can you help me?",None),("Can you help me? ","help"),("Can you help me?","unknown")]:
            self.denied("fm_send",ident(4,2),str(uuid.uuid4()),body,phrase,user=4,code="invalid_message")
        self.assertEqual(self.send(user=3,body="Editable human message")["body"],"Editable human message")

    def test_cursor_pages_ascending_latest_before_after_and_limits(self):
        for i in range(1,26):
            self.send(body=f"Test message {i}")
        sequences = lambda page: [m["sequence"] for m in page]
        self.assertEqual(sequences(rpc("fm_messages",ident(4,1),None,None,10)),list(range(16,26)))
        self.assertEqual(sequences(rpc("fm_messages",ident(4,1),16,None,10)),list(range(6,16)))
        self.assertEqual(sequences(rpc("fm_messages",ident(4,1),6,None,10)),list(range(1,6)))
        self.assertEqual(sequences(rpc("fm_messages",ident(4,1),None,5,10)),list(range(6,16)))
        self.assertEqual(len(rpc("fm_messages",ident(4,1))),25)
        for args in [(None,None,51),(None,None,0),(5,4,10),(None,-1,10),(0,None,10)]:
            self.denied("fm_messages",ident(4,1),*args,code="invalid_request")

    def test_device_self_revoke_and_parent_revocation_immediate(self):
        key = str(uuid.uuid4())
        self.send(user=3,key=key)
        self.assertEqual(rpc("fm_revoke_device",ident(5,3),user=3),{"ok":True})
        self.denied("fm_context",user=3,code="access_revoked")
        self.denied("fm_messages",ident(4,1),user=3,code="access_revoked")
        self.denied("fm_send",ident(4,1),key,"Synthetic test message",user=3,code="access_revoked")
        self.assertEqual(rpc("fm_revoke_device",ident(5,4)),{"ok":True})
        self.denied("fm_context",user=4,code="access_revoked")

    def test_revoked_child_enrollment_session_cannot_be_reused(self):
        code = self.invite()
        context = rpc("fm_enroll",code,"Test",user=5)
        rpc("fm_revoke_device",context["deviceId"])
        self.denied("fm_enroll",code,"Test",user=5,code="access_revoked")
        new_code = self.invite()
        self.denied("fm_enroll",new_code,"Test",user=5,code="access_revoked")

    def test_account_revocation_disables_every_relationship_and_invitation(self):
        code = self.invite()
        self.assertEqual(rpc("fm_revoke_account"),{"ok":True})
        for user in [1,3,4]:
            self.denied("fm_context",user=user,code="access_revoked")
            self.denied("fm_threads",user=user,code="access_revoked")
        self.denied("fm_register_parent","Retry",code="access_revoked")
        self.denied("fm_enroll",code,"Test",user=5,code="invalid_invite")
        self.assertEqual(sql(f"select count(*) from fm_private.devices where parent_id={quote(ident(0,1))} and active;"),"0")
        self.assertEqual(rpc("fm_context",user=2)["role"],"parent")

    def test_inactive_parent_and_child_fail_closed_without_device_change(self):
        sql(f"update fm_private.parents set active=false where id={quote(ident(0,1))};")
        self.denied("fm_context",user=3,code="access_revoked")
        sql(f"update fm_private.parents set active=true where id={quote(ident(0,1))}; update fm_private.children set active=false where id={quote(ident(3,1))};")
        self.denied("fm_context",user=3,code="access_revoked")
        self.denied("fm_messages",ident(4,1))
        self.assertEqual(len(rpc("fm_threads")),1)

    def test_expired_history_hidden_purged_and_receipt_guarantee_bounded(self):
        key = str(uuid.uuid4())
        old = self.send(key=key)
        sql("update fm_private.messages set created_at=clock_timestamp()-interval '31 days';")
        self.assertEqual(rpc("fm_messages",ident(4,1)),[])
        self.assertEqual(sql("select public.fm_purge_expired();"),"1")
        self.assertEqual(sql("select count(*) from fm_private.messages;"),"0")
        new = self.send(key=key)
        self.assertNotEqual(new["id"],old["id"])
        self.assertEqual(new["sequence"],2)
        sql("update fm_private.messages set created_at=clock_timestamp()-interval '31 days';")
        replaced = self.send(body="New retained attempt",key=key)
        self.assertEqual(replaced["sequence"],3)
        self.assertEqual(len(rpc("fm_messages",ident(4,1))),1)

    def test_concurrent_sends_serialize_until_commit_and_have_no_cursor_gap(self):
        first_sql = "begin;"+claims(1)+call_text("fm_send",ident(4,1),str(uuid.uuid4()),"First held transaction")+"select pg_sleep(1.5);commit;"
        first = subprocess.Popen(PSQL,stdin=subprocess.PIPE,stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True)
        first.stdin.write(first_sql)
        first.stdin.close()
        accepted = json.loads(first.stdout.readline())
        second_sql = "begin;"+claims(3)+call_text("fm_send",ident(4,1),str(uuid.uuid4()),"Second waiting transaction")+"commit;"
        second = subprocess.Popen(PSQL,stdin=subprocess.PIPE,stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True)
        second.stdin.write(second_sql)
        second.stdin.close()
        time.sleep(0.15)
        self.assertIsNone(second.poll(),"Later send must wait for the earlier commit")
        self.assertEqual(sql("select count(*) from fm_private.messages;"),"0")
        self.assertGreater(int(sql("select count(*) from pg_stat_activity where wait_event_type='Lock';")),0)
        first.wait(timeout=5)
        second.wait(timeout=5)
        self.assertEqual(first.returncode,0)
        self.assertEqual(second.returncode,0)
        later = json.loads(second.stdout.read())
        self.assertEqual([accepted["sequence"],later["sequence"]],[1,2])
        self.assertEqual([m["sequence"] for m in rpc("fm_messages",ident(4,1),None,0,50)],[1,2])
        first.stdout.close()
        first.stderr.close()
        second.stdout.close()
        second.stderr.close()

    def test_concurrent_same_key_and_invitation_single_winner(self):
        key = str(uuid.uuid4())
        with concurrent.futures.ThreadPoolExecutor(max_workers=2) as executor:
            records = list(executor.map(lambda _:self.send(key=key),range(2)))
        self.assertEqual(records[0],records[1])
        self.assertEqual(sql("select count(*) from fm_private.messages;"),"1")
        code = self.invite()
        with concurrent.futures.ThreadPoolExecutor(max_workers=2) as executor:
            enrollments = list(executor.map(lambda u:rpc("fm_enroll",code,"Race test",user=u),[5,6]))
        self.assertEqual(sum(e.get("role")=="child" for e in enrollments),1)
        self.assertEqual(sum(e.get("code")=="invalid_invite" for e in enrollments),1)

    def test_rolled_back_insert_does_not_consume_sequence(self):
        sql("begin;"+claims(1)+call_text("fm_send",ident(4,1),str(uuid.uuid4()),"Rollback fixture")+"rollback;")
        self.assertEqual(self.send()["sequence"],1)


if __name__ == "__main__":
    unittest.main(verbosity=2)
