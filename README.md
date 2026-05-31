# Coown: Home Co-ownership Informational Platform

A premium, modern informational website built with Vanilla HTML5, CSS3, and JavaScript, designed to help friends, families, and partners navigate the co-ownership journey. This project is structured to be deployed easily onto GitHub Pages.

## Features
- **Modern Responsive Design:** Crafted with high-fidelity typography, deep navy and violet base gradients, emerald mint highlights, glassmorphism headers, and smooth micro-animations.
- **Interactive Cost-Splitting Calculator:** Estimate monthly individual mortgage contributions, utility shares, and equity based on down-payment splits and income ratios.
- **Step-by-Step Roadmap:** A visual guide mapping out the journey from choosing partners to signing legal co-ownership agreements and moving in.
- **Frictionless FAQ Accordion:** Interactive FAQ system addressing title types, mortgage liabilities, and exit strategies.
- **Form System:** Newsletter subscribe forms with micro-animations and active styling.

## Getting Started

### Local Development
To view and edit the project locally, you don't need any complex build configurations. Simply open `index.html` in your web browser. 

Alternatively, to run a lightweight local development server (which ensures smooth routing and asset loading):
1. **Using VS Code Live Server:** Install the "Live Server" extension, open the directory, and click "Go Live" in the bottom-right corner.
2. **Using Python:** Run the following command in your terminal:
   ```bash
   python -m http.server 8000
   ```
   Then open `http://localhost:8000` in your browser.
3. **Using Node/npx:** Run:
   ```bash
   npx serve .
   ```

### Deploying to GitHub Pages
To publish this website on GitHub Pages:
1. Push the contents of this repository to your GitHub account (e.g., `main` branch).
2. Go to the **Settings** tab of your GitHub repository.
3. Scroll down or click **Pages** in the left sidebar.
4. Under **Build and deployment**, select **Deploy from a branch** under Source.
5. Choose your branch (usually `main` or `master`) and folder (`/ (root)`), then click **Save**.
6. Within a couple of minutes, your site will be live at `https://<your-username>.github.io/<repository-name>/`.
