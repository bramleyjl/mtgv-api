# MTG Versioner API

A RESTful API service that processes Magic: the Gathering card lists and returns complete "packages" containing all available printings of those cards with customizable sorting and filtering options.

## Overview

MTG Versioner API allows you to:

- Submit a list of Magic: the Gathering cards and receive all available printings
- Filter results by game platform (paper, MTGO, Arena)
- Sort results by various criteria (newest, oldest, most expensive, least expensive)
- Generate random card packages for exploration
- Export card packages in various formats (TCGPlayer, text)

The API serves as a backend for card collection management tools, deck builders, or any application that needs access to Magic card print information with filtering capabilities.

## Installation & Setup

1. **Prerequisites:**
   - Node.js (v23+ required)
   - npm (comes with Node.js)
   - MongoDB (v4.4+)

2. **Clone the repository:**
   ```bash
   git clone https://github.com/bramleyjl/mtgv-api.git
   cd mtgv-api
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Configure environment variables:**
   - Copy or create a `.env` file in the root directory with:
     ```env
     # Server Configuration
     PORT=4000
     NODE_ENV=development
     
     # Database Configuration
     DB_URL= # leave empty for local MongoDB
     DB_NAME=MTGVersioner
     
     # Environment Flags
     RENDER=false
     DOCKER_ENV=false
     
     # External Services (optional)
     REDIS_URL=redis://localhost:6379
     TCG_CLIENT_ID=your_tcgplayer_client_id
     TCG_CLIENT_SECRET=your_tcgplayer_client_secret
     
     # Logging (optional)
     LOG_LEVEL=info
     ```
   
   **Environment-specific configurations:**
   
   - **Local Development**: Leave `DB_URL` empty (defaults to `mongodb://127.0.0.1:27017`)
   - **Docker**: Set `DOCKER_ENV=true` and use `mongodb://host.docker.internal:27017`
   - **Staging (Render)**: Set `NODE_ENV=staging`, `RENDER=true`, and `DB_URL` to MongoDB Atlas
   - **Production**: Set `NODE_ENV=production`, `RENDER=true`, and `DB_URL` to production MongoDB

5. **Import card data from Scryfall:**
   ```bash
   npm run pullBulkData
   ```
   - If successful, you will see a `Database updated: <#> entries added` log message.

6. **Run the API server:**
   - For development:
     ```bash
     npm run dev
     ```
   - For production:
     ```bash
     npm start
     ```
   - The API will be available at `http://localhost:4000` (or the port specified in your .env file).

7. **Docker (optional):**
   - Build and run the application in Docker:
     ```bash
     npm run docker:build
     npm run docker:run
     ```

8. **Cloud Deployment:**
   
   **Staging Environment (Render):**
   ```env
   NODE_ENV=staging
   RENDER=true
   PORT=4000
   DB_URL=mongodb+srv://username:password@cluster.mongodb.net/MTGVersioner
   DB_NAME=MTGVersioner
   LOG_LEVEL=info
   ```

   **Production Environment:**
   ```env
   NODE_ENV=production
   RENDER=true
   PORT=4000
   DB_URL=mongodb+srv://username:password@cluster.mongodb.net/MTGVersioner
   DB_NAME=MTGVersioner
   LOG_LEVEL=warn
   REDIS_URL=redis://your-redis-instance:6379
   TCG_CLIENT_ID=your_production_client_id
   TCG_CLIENT_SECRET=your_production_client_secret
   ```

   **Deployment Steps:**
   1. Set environment variables in your hosting platform
   2. Run `npm run pullBulkData:staging` or `npm run pullBulkData:production` to populate the database
   3. Start the service with `npm start`

   **Automated Database Updates:**
   - See `deploy/render-cron.yaml` for automated daily updates
   - Use `npm run ssh:staging` to SSH into staging environment
   - Use `npm run ssh:prod` to SSH into production environment
   - See `deploy/README.md` for detailed deployment configuration

---

## Caching Architecture

MTG Versioner API uses in-memory caching (via NodeCache) to improve performance and reduce redundant database queries. Caching is applied at multiple levels:

### 1. Card Search Cache
- **Purpose:** Caches results of card name searches (autocomplete, fuzzy search).
- **TTL:** 30 minutes
- **Key:** Hash of the search query and unique-names-only flag.
- **Location:** Centralized in the Card model (`searchByName`).

### 2. Card Lookup Cache
- **Purpose:** Caches lookups of card printings by name, Scryfall ID, or other queries.
- **TTL:** 1 hour
- **Key:** Hash of the query and projection fields.
- **Location:** Centralized in the Card model (`find_by`).

### 3. Card Package Cache
- **Purpose:** Caches the result of creating a card package for a specific card list & game.
- **TTL:** 30 minutes
- **Key:** Hash of the normalized card list (sorted, with counts) and the selected game.
- **Location:** In the CardPackageCreator service.
- **Note:** Sorting is applied after cache retrieval to maximize cache hits.

### Cache Invalidation & Monitoring
- Caches are automatically invalidated after their TTL expires.
- All caches are in-memory and reset on server restart.

## API Routes

### Card Packages

#### Create a Card Package

---
`POST /card_package`

Creates a package with all available printings for a list of cards.

**Query Parameters:**

- `game` (optional): Game platform to include. Options: `paper`, `mtgo`, `arena`. Default: `paper`
- `defaultSelection` (optional): Sorting method for card prints. Options: `newest`, `oldest`, `most_expensive`, `least_expensive`. Default: `newest`

**Request Body:**

```json
{
  "card_list": [
    {
      "name": "Lightning Bolt",
      "count": 4
    },
    {
      "name": "Counterspell",
      "count": 3
    }
  ]
}
```

> **Note:** Basic lands (Plains, Island, Swamp, Mountain, Forest) are not yet supported in queries.

**Response:**

```json
{
  "card_package": {
    "card_list": [
      { "name": "Lightning Bolt", "count": 4 },
      { "name": "Counterspell", "count": 3 }
    ],
    "game": "paper",
    "default_selection": "newest",
    "package_entries": [
      {
        "count": 4,
        "oracle_id": ["e8200bef-458f-42ad-90d8-c3cda69e1d1e"],
        "name": "Lightning Bolt",
        "card_prints": [
          {
            "scryfall_id": "5c5c1534-5c33-4983-8a2f-7e79ab5e6922",
            "oracle_id": ["e8200bef-458f-42ad-90d8-c3cda69e1d1e"],
            "tcgplayer_id": 232745,
            "name": "Lightning Bolt",
            "sanitized_name": "lightning_bolt",
            "games": ["paper", "mtgo"],
            "set": "CLB",
            "set_name": "Commander Legends: Battle for Baldur's Gate",
            "collector_number": "187",
            "image_uris": [
              {
                "small": "https://cards.scryfall.io/small/front/5/c/5c5c1534-5c33-4983-8a2f-7e79ab5e6922.jpg?1674142707",
                "normal": "https://cards.scryfall.io/normal/front/5/c/5c5c1534-5c33-4983-8a2f-7e79ab5e6922.jpg?1674142707"
              }
            ],
            "released_at": "2022-06-10",
            "prices": {
              "usd": "0.14",
              "usd_foil": "0.25",
              "eur": "0.10",
              "tix": "0.03"
            },
            "finishes": ["nonfoil", "foil"]
          }
        ],
        "selected_print": "5c5c1534-5c33-4983-8a2f-7e79ab5e6922",
        "user_selected": false
      }
    ]
  }
}
```

**Error Responses:**

- `400 Bad Request`: Invalid card list format
- `500 Internal Server Error`: Server-side processing error

#### Generate Random Card Package

---
`GET /card_package/random`

Generates a package with random cards.

**Query Parameters:**

- `count` (required): Number of random cards to include (1-100)
- `game` (optional): Game platform to include. Default: `paper`
- `defaultSelection` (optional): Sorting method. Default: `newest`

**Response:** Identical format as standard card package creation

#### Export Card Package

---
`POST /card_package/export`

Exports a card package's selected card_prints in the specified format.

**Query Parameters:**

- `type` (required): Export format. Options: `tcgplayer`, `text`

**Request Body**

```json
{
  "selectedCards": [
    {
      "count": 4,
      "scryfall_id": "5c5c1534-5c33-4983-8a2f-7e79ab5e6922"
    },
    {
      "count": 3,
      "scryfall_id": "72b6bf82-5f5b-4030-9470-daad1f11d6fb"
    }
  ]
}
```

**Response for type=text:**

```json
{
  "export_text": "4 Lightning Bolt CLB 187\n3 Counterspell NCC 88",
  "type": "text"
}
```

**Response for type=tcgplayer:**

```json
{
  "export_text": "https://www.tcgplayer.com/massentry?productline=Magic&c=4-232745||3-233081",
  "type": "tcgplayer"
}
```

In the TCGPlayer URL format, each card is represented as `{count}-{tcgplayer_id}` and multiple cards are joined with `||`.

**Error Responses:**

- `400 Bad Request`: Invalid export type or card package
- `500 Internal Server Error`: Server-side processing error

## Error Handling

All API endpoints return standard HTTP status codes:

- `200 OK`: Request succeeded
- `400 Bad Request`: Invalid request parameters or body
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server-side error

Error responses include detailed messages:

```json
{
  "error": "Error message",
  "status": 400,
  "details": {
    "provided": [...],
    "allowed": [...]
  }
}
```

## Legal & Disclaimer

MTG Versioner is an unofficial Fan Content project, not produced, endorsed, supported, or affiliated with Wizards of the Coast.

Magic: The Gathering and its respective properties are copyright Wizards of the Coast, LLC, a subsidiary of Hasbro, Inc. ©1993-2025 Wizards. All Rights Reserved.

Card images, mana symbols, card data, and other recognizable aspects of Magic: The Gathering are trademarks and copyrights of Wizards of the Coast.

This application is developed under Wizards of the Coast's [Fan Content Policy](https://company.wizards.com/en/legal/fancontentpolicy).

Scryfall is a trademark of Scryfall, LLC and is not affiliated with this application.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Authors

- [John Bramley](https://github.com/bramleyjl)
