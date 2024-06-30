# Beefy Finance APY & TVL Tracker

## Project Description

The Beefy Finance APY & TVL Tracker is a tool designed to monitor and analyze the Annual Percentage Yield (APY) and Total Value Locked (TVL) of vaults on the Beefy Finance platform. This project fetches real-time data, stores it in a MongoDB database, and calculates custom scores based on historical APY and TVL data.

## Key Features

1. **APY Data Retrieval**: Fetches the latest APY data from the Beefy Finance API.
2. **TVL Data Retrieval**: Obtains the latest TVL data and merges it with APY data.
3. **Data Storage**: Saves and updates data in a MongoDB database.
4. **Score Calculation**: Uses a custom algorithm to calculate scores based on APY and TVL history.
5. **Automatic Updates**: Allows for regular data updates to track vault performance over time.

## Prerequisites

- Node.js (version 14 or higher recommended)
- MongoDB
- npm or yarn

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/your-name/beefy-finance-tracker.git
   cd beefy-finance-tracker
   ```

2. Install dependencies:
   ```
   npm install
   ```
   or
   ```
   yarn install
   ```

3. Set up environment variables:
   Create a `.env` file in the project root and add:
   ```
   MONGODB_URI=your_mongodb_uri
   PORT=3000
   ```

## Usage

1. To generate initial APY data:
   ```
   npm run generate-apy
   ```

2. To update APY data:
   ```
   npm run update-apy
   ```

3. To start the server:
   ```
   npm start
   ```

## Project Structure

- `src/`
  - `model/`: Contains MongoDB schemas
  - `utils/`: Utility functions
  - `routes/`: API route definitions
  - `app.js`: Application entry point
- `scripts/`: Scripts for data generation and updates

## API Endpoints

- `GET /api/scores`: Retrieves the score table for all vaults
- `GET /api/apy/:vault`: Retrieves APY history for a specific vault
- `GET /api/tvl/:vault`: Retrieves TVL history for a specific vault

## Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

## Contact


