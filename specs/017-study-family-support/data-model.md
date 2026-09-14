# Study contracts and authority

`StudyState` schema 1 owns only plans and academic goals. It is keyed by the local
family's optional schema-4 `studyInstanceId`, assigned on the first authorized study
entry. A new family has no token. Before assigning one, initialization verifies removal
of any orphan study records, writes the token into the family record and reads it back.
Failure cannot publish an initialized view. Timestamps, nicknames and shared synthetic
Child IDs are never sufficient family bindings. Ordinary handoffs retain the token;
reset and family replacement clear study records. Existing historical family schemas
remain valid without a token; only current schema 4 accepts this additive field.

`getStudy` and `dispatchStudy` derive the actor from the existing role controllers.
Child views include only their own records; Parent selects an enrolled Child. A command
loads the full authorized family state, applies the pure domain transition, verifies
storage write/readback and only then publishes a revision. No progression authority is
imported by study behavior.

Plans move from Parent proposal → Child choice → planned → active/paused → completed.
A Child-created plan starts planned. A manageable duration is a suggestion, not a timer
or completion proof. Help requests and revisit dates are explicit; Parent resolves a
help request after review, while Child controls work and revisiting.

Goals carry a revision, Parent approval, Child acceptance and immutable accepted terms.
Editing before acceptance clears approvals. Either party may propose; Parent reviews,
Child accepts/declines/pauses/requests change, Child self-reports and Parent acknowledges.
Results name practice count, an observable achievement or a mark with denominator.
Below-target review returns to active without loss. Repeated report IDs, confirmation
and fulfilment do not duplicate evidence. Nonessential optional promises use
`promised → unlocked → given`, with unlock only on Parent acknowledgement of the agreed
criterion. Changing an accepted agreement requires a new proposal.

Repositories bound record counts, strings, dates and submission history, detach reads,
reject corrupt/wrong-family writes and preserve accepted terms and unlocked evidence.
Academic records never contribute to Seeds, existing Family Rewards, League, badges,
garden or canopy.
