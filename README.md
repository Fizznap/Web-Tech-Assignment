# AI Lab Report Generator

A complete, production-ready web application that automatically generates styled multi-experiment PDF lab reports. It reads student details, optional reference PDFs, connects to the Claude API to generate technical formal content, and uses Puppeteer to render completely realistic mockup screenshots and compile the final PDF.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure Environment Variables:
   - Rename `.env.example` to `.env`
   - Paste your actual Anthropic API Key (e.g. `sk-ant-xxx...`) into the `ANTHROPIC_API_KEY` mapping.

3. Run the App:
   ```bash
   npm start
   ```
   *The server runs on http://localhost:3000 by default.*

## Usage
1. Open the web interface in your browser.
2. Enter your Name, Roll Number, and Date.
3. Upload an optional reference PDF.
4. Select the experiments you wish to generate.
5. Click **Generate PDF**, wait for the progress to complete, and download your final highly-formatted, offline-ready PDF.
"# Web-Tech-Assignment" 
