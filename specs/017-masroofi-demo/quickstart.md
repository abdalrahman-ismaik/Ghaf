# Masroofi competition workflow

For the seeded competition entry, restart Expo from PowerShell with:

```powershell
$env:EXPO_PUBLIC_GHAF_DEMO_ENTRY='true'
$env:EXPO_PUBLIC_GHAF_MASROOFI='true'
npm.cmd start
```

Use the displayed Parent/Child demo access paths in the same running app. The fixture for this
rehearsal is Alya, age 11; Salem, age 9, is deliberately ineligible for the card.

1. Enter the synthetic Parent experience. Assign Alya (11) an eligible unaccepted task: canonical
   recycling, HR01, HR05, or GI01–GI03. The catalog's other tasks remain available without money.
2. Open **Family → Masroofi / مصروفي**. Choose Alya, confirm age 10+, and activate the demo card.
   The new balance is zero. For age band 9–11, Parent attestation is required; age band 6–8 is denied.
   In explicit demo mode, Salem's known age of 9 blocks activation even with Parent attestation.
3. Choose the approved task, select a fixed reward (for example AED 5), and lock it. It cannot be
   reduced or removed. The Child sees that a fixed reward exists, but never its unearned amount.
4. Return through the existing signed-out/Child access flow. Alya accepts and completes the task.
   Permitted help earns the same fixed reward. Submission alone creates neither money nor Seeds.
5. Return to Parent, review the submission, present praise and apply the existing recognition.
   The task award/growth completes and Masroofi records exactly one simulated AED 5 credit.
6. Return to Alya's Today → My Masroofi card. The card reveals the earned reward and balance.
   Buy the practice notebook for AED 3: balance becomes AED 2. Try the AED 12 online game: it is
   declined under default category/online rules and the balance stays AED 2. Choose **Games**
   in the shop's category picker to reveal that purchase.
7. Parent may change per-purchase/daily limits, category permissions, online permission or freeze
   purchases, then explicitly save. Changes apply prospectively. A freeze preserves earned money.
   Parent may add AED 20 demo funds to rehearse controls independently of task recognition.
8. Use the existing Parent prototype reset. All cards, promises and transactions clear, along
   with the ordinary Arabic-first signed-out demo reset. Family replacement also clears the card.

The shop now has eight spending categories: stationery, books, sports, arts and crafts, outings,
snacks, gifts, and games. Each category shows one fixed example. Only stationery is allowed by
default; Parent can enable categories individually and save. An online museum ticket also needs
online permission. To rehearse: add AED 20 practice funds, enable Books and Snacks, then buy the
AED 8 storybook and AED 4 fruit cup. A museum ticket remains blocked unless both Outings and
online purchases are allowed, and all purchases still obey balance and spending limits.

The revised pearl/red-woven card has a UAE flag and architectural engraving. It carries no DEMO
stamp; one visible notice below it identifies all balances and purchases as virtual.

This is one-device, in-memory competition state, like task progress. Reloading/restarting does
not restore a financial history. No accounts, actual funds, issuer, card network or checkout exists.
Both roles must use the same app session for the demonstration; real cross-device money sync is
not implemented. The Child is told that the Parent sees activity; nothing is shared to the League.

The independent build switch `EXPO_PUBLIC_GHAF_MASROOFI=false` hides both entries, redirects
the routes and denies card commands. It changes no R002b/live-AI flag. Default is enabled for the
explicitly authorized competition simulation. Build-time Expo variables require a bundle restart.

An accepted pre-task adaptation produces a new task version. The old promise remains immutable
and cannot pay a different version; Parent can attach a separate fixed promise to the new
unaccepted version. The Child notice always matches the current assignment and version.

Judge wording: “This is our simulated Masroofi card. The Parent chooses a fixed reward and
spending rules. Task completion needs Parent confirmation. Children can then practice a money
decision and see why a purchase is allowed or declined. A real card would require a future
licensed issuing partner and separate validation.”
