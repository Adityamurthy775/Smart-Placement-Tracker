# Demo accounts

Four accounts, one per role. Create them with:

```
cd backend
npm run seed:demo
```

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@example.com` | `Demo@12345` |
| Teacher | `teacher@example.com` | `Demo@12345` |
| HR | `hr@example.com` | `Demo@12345` |
| Student | `student@example.com` | `Demo@12345` |

Sign in at `/login`.

`seed-demo.js` upserts by email, so re-running it is safe — it refreshes the
password and profile rather than creating duplicates. It only ever touches
`@example.com` addresses; no real account is read, modified or deleted. The
student and teacher accounts also get their side documents (`StudentModel` /
`TeacherModel`) so profile-driven screens have data to render instead of
erroring on a missing ref.

The script repeats the `dns.setServers` / `setDefaultResultOrder("ipv4first")`
lines from `server.js`. Without them Atlas SRV lookups fail on this network
with `querySrv ECONNREFUSED _mongodb._tcp.<cluster>.mongodb.net` — the seed
would not be able to reach the same database the server can.

**Change the password and emails before this is ever pointed at a real
database.**
