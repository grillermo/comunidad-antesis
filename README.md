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

This runs Rails on `http://localhost:${RAILS_PORT:-3000}`, Vite, and Solid Queue.

## Production-Style Serve

```bash
./serve
```

This runs Rails bound to `0.0.0.0` with stdout logging and Solid Queue.

## Verification

```bash
bundle exec rspec
bin/vite build
```

Health check:

```bash
curl http://localhost:${RAILS_PORT:-3000}/health
```
