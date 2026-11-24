// टीचर साइट की ताज़ा फ़ाइलें लेकर ऐप के लिए तैयार करता है (www फ़ोल्डर)।
// कोई बदलाव अपनी जगह न मिले तो बिल्ड रुक जाता है, ताकि चुपचाप गलत ऐप न बने।
const fs = require("fs");
const { P } = require("./patches");
const SITE = "https://sushilsirsitamarhi.github.io/Sikshksathi-/";
const NEEDED = ["index.html", "manifest.webmanifest"];
const OPTIONAL = ["quiz.html", "icon-192.png", "icon-512.png"];
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
async function get(f) {
  for (let i = 1; i <= 5; i++) {
    try {
      const r = await fetch(SITE + f + "?v=" + Date.now());
      if (r.ok) return Buffer.from(await r.arrayBuffer());
      console.log("कोशिश " + i + ": " + f + " (" + r.status + ")");
    } catch (e) { console.log("कोशिश " + i + ": " + f + " (" + e.message + ")"); }
    await wait(4000 * i);
  }
  return null;
}
(async () => {
  fs.rmSync("www", { recursive: true, force: true });
  fs.mkdirSync("www");
  for (const f of NEEDED) {
    const b = await get(f);
    if (!b) { console.error("ज़रूरी फ़ाइल नहीं मिली: " + f); process.exit(1); }
    fs.writeFileSync("www/" + f, b);
  }
  for (const f of OPTIONAL) {
    const b = await get(f);
    if (b) fs.writeFileSync("www/" + f, b); else console.log("छोड़ा (ज़रूरी नहीं): " + f);
  }
  let h = fs.readFileSync("www/index.html", "utf8").replace(/\r\n/g, "\n");
  // साइट के सुधार: जो न मिले उसे छोड़ दो (ऐप फिर भी बनेगा), और लॉग में लिख दो
  for (const p of P) {
    if (h.includes(p.b)) continue;
    if (h.includes(p.a)) { h = h.replace(p.a, () => p.b); console.log("लगाया: " + p.name); }
    else console.log("छोड़ा (जगह नहीं मिली): " + p.name);
  }
  const swap = (a, b) => { if (!h.includes(a)) { console.error("बदलाव की जगह नहीं मिली: " + a.slice(0, 60)); process.exit(1); } h = h.replace(a, b); };
  swap('var STORE="web"', 'var STORE="indus"');
  swap('if("serviceWorker" in navigator)navigator.serviceWorker.register("sw.js")', 'if(false)navigator.serviceWorker.register("sw.js")');
  swap('return location.origin+location.pathname.replace(/[^\\/]*$/,"")+"quiz.html?id="+id', 'return "' + SITE + 'quiz.html?id="+id');
  fs.writeFileSync("www/index.html", h);
  console.log("www तैयार।");
})();
