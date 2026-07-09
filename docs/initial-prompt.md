APPLICATIONAME = comunidad-antesis

YOUR APPLICATION SPECIFICATION

The application setup must adhere to the following technical specifications:

---

### Core Environment & Versioning

- **Application Name:** `APPLICATIONNAME`
    
- **Ruby Version:** Use **Ruby 3.4.7** (managed via `rbenv`).
    
- **Configuration Files:**
    
    - Create a `.ruby-version` file specifying `3.4.7`.
        
    - Hardcode the Ruby version within the `Gemfile`.
        
- **Git Configuration:** Provide a robust `.gitignore` including defaults for macOS (`.DS_Store`), Rails `tmp/` folders, `log/` files, environment variables, and rails credentials and keys for encryption
    

### Database & Storage Architecture

- **Engine:** PostgreSQL.
    
- **Database Provisioning:** Initialize three standard environments:
    
    - `APPLICATIONNAME_production`
        
    - `APPLICATIONNAME_development`
        
    - `APPLICATIONNAME_test`
        
- **Unified Schema:** Utilize a single database schema for all application data.
    
- **Postgres-Backed Services:**
    
    - **Cache:** Configure Rails to use PostgreSQL as the cache store.
        
    - **Active Job:** Configure the background job queue to run through PostgreSQL (e.g., using `solid_queue`). And to display all the STDOUT when running bin/jobs
        
    - **Schema Integration:** Ensure all cache and job-related tables are included in the primary database schema.
        

### Testing & Reliability

- **Testing Framework:** Replace default Minitest with **RSpec**.
    
- **Health Monitoring:**
    
    - Implement a `/health` endpoint managed by a dedicated controller.
        
    - **Logic:** Return a `200 OK` status only if all dependencies are operational.
        
    - **Checks:** Verify the database connection, and validate any attached services.

## Libraries

* Install the https://github.com/httprb/http gem when we need to call a third party with a custom client.
* Install the inertia library and make sure all frontend work is pure react with props passed from the controller.

## Helper scripts

Add a ./serve-dev file to run the server and related in development use tmx sessions
Add a ./serve file to run the server in production, build the app first, run all the required services together

Example of the serve-dev, the serve file should follow the same strategy (tmux panes)
```
#!/bin/bash

# Load environment variables
set -a
[ -f .env ] && . .env
set +a

rails assets:precompile

SESSION="APPLICATIONNAME"

# Kill existing session if any
tmux kill-session -t "$SESSION" 2>/dev/null

# Create session with first pane: Rails
tmux new-session -d -s "$SESSION" -n main

# Split into 3 panes
tmux split-window -h -t "$SESSION"
tmux split-window -v -t "$SESSION"

# Pane 0: Rails server
tmux send-keys -t "$SESSION:main.1" "source .env && be rails s -p $RAILS_PORT -b 0.0.0.0" C-m

# Pane 2: Solid Queue worker
tmux send-keys -t "$SESSION:main.3" "source .env && RAILS_LOG_TO_STDOUT=1 bin/jobs" C-m

# Attach to session
tmux attach -t "$SESSION"
```

## Documentation

Add a README.md that explains the purpose of the project the architecture and how to run it and install it. 

Add a docs folder where you store this as initial_prompt.md 

Modify this to add new panes for every extra service that it is needed

## AGENTS

Add claude.md after building the app.
Include in the instructions

## Features

This is an application to promote a Digital Ebook accesible through this page for the spanish speaking community.
The book is 
'/Users/grillermo/c/comunidad-antesis/project/MaquetaCompleta-ManualDelColorVivo-VER1 (1).pdf'
The page should use the same design system as the ebook, font and colors, spacing, details.

This application, what you will build, contains:
* A landing page with three sections to promote the ebook. this is the root / path
    * Read the intro of the book and create this page. 
        Goal of the page Capture email addresses by offering a discount of the ebook
        Design: Above-the-fold only. No scrolling required.
        Layout: A two-column layout. The left column features a bold headline, a short 2-3 sentence hook, and a simple email capture form. The right column features a high-quality 3D mockup of the ebook cover.
        Save the user email in a NewsletterEmail model
* Add authentication with username and password using devise, no registration, just login. 
* A rails resource called Ebook that has many Sections.
    * Replicate the Index as one section
    * Break down the ebook according to the index in sections one url per section.
        Add all the content of the PDF as sections.
            For example Materiales y Herramientas (page 13) is one section/one url, it includes in that page the subsections 
            herramientas básicas, Materiales para teñir, Materiales para teñir con índigo, Materiales para extraer pigmentos, Materiales para preparar pintura y aglutinantes.
    * Provide links from the index to the individual pages.
    * Only for authenticated users.

* Commenting system: the authenticated users can participate in a reddit style page to comment.
    * Each Section has_many comments.
    * Every user gets a role (Admin, Commenter, viewer), admins can delete ANY comment, commenter can add new comments, and viewer can only see comments but not add.
    * Each comment can be replied to, which results in nested comments. The number of nesting levels is unlimited.
    * Comment text supports simple Markdown formatting rules. So users can use bold, italic, strikethrough, insert links, images, tables, code blocks etc.
    * Top-level comment can be marked sticky by the admin, which pins it at the top of the list.
    * Comments can be edited and deleted, either by the author or by a admin
    * Users can upvote and downvote comments, updating their score
    * Users can choose to get notified about replies to their comments. Admins also get notified about every comment and can approve it directly with a link from the email.
    * A simple Administration UI, allows the admin to approve, delete or rewrite comments

Ask me questions, many questions
