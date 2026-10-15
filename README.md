# TAU Moodle AutoFill for Chrome

A lightweight Chrome extension (Manifest V3) designed to automate login prompts across Tel Aviv University (TAU) portals, including Moodle and university SSO login pages.

---

## ⚠️ Important Security & Privacy Notice

* **Unencrypted Local Storage:** Credentials (Student ID, username, and password) are saved directly in your browser's local storage (`chrome.storage.local`) in **plaintext (unencrypted)**. They are never sent to any external server or third-party service, but anyone with direct access to your local browser profile or dev tools can view them.
* **Do Not Use on Public Computers:** Do not use or store your credentials with this extension on shared computers (such as campus computer labs or library terminals).
* **Built with AI:** This project was developed and scaffolded with the assistance of Artificial Intelligence (AI). Review the source code before running it in your environment.

---

## Features

* **Student ID Autofill:** Automatically populates your 9-digit Israeli ID number (תעודת זהות).
* **Optional Credentials:** Supports storing an optional TAU username and password for zero-click authentication.
* **Auto-Submit:** Optional setting to automatically submit login forms upon detection.
* **Hebrew Form Detection:** Smart DOM matching configured specifically for TAU's Hebrew authentication layouts and dynamic form renders.
* **Context Menu Support:** Right-click anywhere on a TAU page and select **"Fill TAU Form"** to trigger manual autofill.

---

## Installation

Since this extension is not currently published on the Chrome Web Store, you can load it manually as an unpacked extension:

1. **Download or Clone the Repository:**
   ```bash
   git clone [https://github.com/eladth/TAU-Moodle-AutoFill-for-Chrome.git](https://github.com/eladth/TAU-Moodle-AutoFill-for-Chrome.git)
