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

## Installation & Dependencies

### Prerequisites

The following dependencies are required to run MTG Versioner API:

- Node.js (v16+) & npm
- MongoDB (v4.4+)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/bramleyjl/mtgv-api.git
   cd mtgv-api
   ```

2. Install required NPM packages:

   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory with the following variables:

   ```env
   DB_URL=mongodb://localhost:27017/
   DB_NAME=MTGVersioner
   ENVIRONMENT=localhost
   BULK_DATA_COLLECTION=cardData
   PORT=4000
   ```

4. Import card data from Scryfall:

   ```bash
   npm run pullBulkData
   ```

   If successful, you will see a `Database updated: <#> entries added` log message.

### Running the API

Start the development server:

```bash
npm run dev
```

Or for production:

```bash
npm start
```

The API will be available at `http://localhost:4000` (or the port specified in your .env file).

## API Routes

### Card Packages

#### Create a Card Package

---
`POST /card_package`

Creates a package with all available printings for a list of cards.

**Query Parameters:**

- `games` (optional): Array of game platforms to include. Options: `paper`, `mtgo`, `arena`. Default: `paper`
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
    "games": ["paper"],
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
          },
          // Additional prints...
        ],
        "selected_print": "5c5c1534-5c33-4983-8a2f-7e79ab5e6922",
        "user_selected": false
      },
      // Additional package entries...
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
- `games` (optional): Array of game platforms to include. Default: `paper`
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
