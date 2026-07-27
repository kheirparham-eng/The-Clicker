# Security Specification for Firestore Rules

## Data Invariants
1. A save document corresponds to a valid username string.
2. Anyone can read and write game save states to allow seamless cloud saving with custom usernames or guest accounts.
3. User game saves must adhere to structural payload size boundaries.

## The Dirty Dozen Payloads (Negative Tests)
1. Write 2MB string payload to points -> REJECTED
2. Write non-object to itemsOwned -> REJECTED
3. Write empty username -> REJECTED
4. Write invalid ID path -> REJECTED
