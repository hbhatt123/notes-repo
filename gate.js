/*
 * gate.js
 * ---------------------------------------------------------------
 * A lightweight, client-side password screen. This is a deterrent
 * against casual visitors and keeps the page itself from being
 * skimmable at a glance — it is NOT real access control. Every file
 * in this repo (data.js, assets/*, this file itself) is still
 * directly fetchable by anyone who knows or guesses the URL, since
 * GitHub Pages has no server-side auth. Real protection would mean
 * hosting behind something like Cloudflare Access instead.
 *
 * The password itself is never stored — only its SHA-256 hash is
 * compared against, computed via the browser's built-in
 * crypto.subtle so no library is needed.
 * ---------------------------------------------------------------
 */

(function () {
  "use strict";

  const UNLOCK_KEY = "prep_gate_unlocked";
  // SHA-256 of the site password. Change PASSWORD_HASH (not a plaintext
  // password) to rotate it — compute a new hash with:
  //   node -e "console.log(require('crypto').createHash('sha256').update('newpassword').digest('hex'))"
  const PASSWORD_HASH = "f489c58bbd493dd777efe3cc95d3d06324b9940ac2b1dc25a3858499d7f8ed08";

  async function sha256Hex(text) {
    const bytes = new TextEncoder().encode(text);
    const digest = await crypto.subtle.digest("SHA-256", bytes);
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  function unlock() {
    try {
      localStorage.setItem(UNLOCK_KEY, "1");
    } catch (e) {
      // ignore
    }
    document.documentElement.classList.remove("gate-locked");
  }

  function isUnlocked() {
    try {
      return localStorage.getItem(UNLOCK_KEY) === "1";
    } catch (e) {
      return false;
    }
  }

  function initGateForm() {
    const form = document.getElementById("gate-form");
    const input = document.getElementById("gate-password");
    const errorEl = document.getElementById("gate-error");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      errorEl.textContent = "";
      const value = input.value;
      const hash = await sha256Hex(value);
      if (hash === PASSWORD_HASH) {
        unlock();
      } else {
        errorEl.textContent = "Wrong password.";
        input.select();
      }
    });
  }

  // If already unlocked, the inline head script already removed the
  // locked class before paint — nothing else to do. Otherwise wire up
  // the form once the DOM exists.
  if (!isUnlocked()) {
    document.addEventListener("DOMContentLoaded", initGateForm);
  }
})();
