# comunidad-antesis

Rails 8 monolith for comunidad-antesis, using PostgreSQL, Solid Queue, Solid Cache, and Inertia with React, Vite, and Tailwind CSS.

## Stack

- Ruby 3.4.7
- Rails 8.0.5
- PostgreSQL
- Inertia Rails, React, Vite, and Tailwind CSS
- Solid Queue and Solid Cache
- RSpec

## Setup

```bash
bundle install
npm install
cp .env.example .env
bin/rails db:prepare
```

## Development

```bash
./serve-dev
```

Opens a tmux session (`comunidad-antesis`) with three panes: the Rails
server on `http://localhost:${RAILS_PORT:-3000}`, the Vite dev server (HMR),
and the Solid Queue worker. Detach with `Ctrl-b d`; stop with
`tmux kill-session -t comunidad-antesis`.

## Production-Style Serve

```bash
./serve
```

Precompiles assets, then opens a tmux session with two panes: the Rails
server (production, bound to `0.0.0.0`, stdout logging) and the Solid Queue
worker. Requires tmux. No Docker/Kamal — deploys to a single bare-metal/VPS
host.

## Verification

```bash
bundle exec rspec
bin/vite build
```

Health check:

```bash
curl http://localhost:${RAILS_PORT:-3000}/health
```
