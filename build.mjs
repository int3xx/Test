// Copies src -> dist, minifies HTML/CSS, and protects the JavaScript.
// Uses javascript-obfuscator when installed (npm install); otherwise falls back to an XOR+base64 loader.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const SRC = "src", OUT = "dist";
fs.rmSync(OUT, { recursive: true, force: true });
fs.cpSync(SRC, OUT, { recursive: true });

const minHtml = (s) => s.replace(/<!--[\s\S]*?-->/g, "").replace(/>\s+</g, "><").replace(/\s{2,}/g, " ").trim();
const minCss = (s) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\s*([{}:;,>])\s*/g, "$1").replace(/;}/g, "}").trim();

async function protect(code) {
  try {
    const { default: JO } = await import("javascript-obfuscator");
    return JO.obfuscate(code, {
      compact: true, stringArray: true, stringArrayEncoding: ["rc4"], stringArrayThreshold: 1,
      rotateStringArray: true, controlFlowFlattening: true, controlFlowFlatteningThreshold: 0.6,
      deadCodeInjection: true, deadCodeInjectionThreshold: 0.3, identifierNamesGenerator: "hexadecimal",
      splitStrings: true, splitStringsChunkLength: 6, numbersToExpressions: true, simplify: true,
      selfDefending: true, disableConsoleOutput: true,
    }).getObfuscatedCode();
  } catch {
    console.warn("javascript-obfuscator not found, using built-in XOR loader");
    const key = crypto.randomBytes(16);
    const bytes = Buffer.from(code, "utf8").map((b, i) => b ^ key[i % key.length]);
    return `(function(d,k){var s=atob(d),a=new Uint8Array(s.length),i;for(i=0;i<s.length;i++)a[i]=s.charCodeAt(i)^k[i%k.length];(0,eval)(new TextDecoder().decode(a))})("${bytes.toString("base64")}",[${[...key]}]);`;
  }
}

(function walk(dir) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) walk(p);
    else if (p.endsWith(".html")) fs.writeFileSync(p, minHtml(fs.readFileSync(p, "utf8")));
    else if (p.endsWith(".css")) fs.writeFileSync(p, minCss(fs.readFileSync(p, "utf8")));
  }
})(OUT);

const js = path.join(OUT, "assets/app.js");
fs.writeFileSync(js, await protect(fs.readFileSync(js, "utf8")));
console.log("Built ->", OUT);
