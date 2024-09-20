prepare .env from .env.example

# front

bun install
bun run dev

# back

bun install
create db
use query from db.sql
bun run dev
