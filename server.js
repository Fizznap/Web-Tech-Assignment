const express = require('express');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');
const chromium  = require('@sparticuz/chromium');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Directories ─────────────────────────────────────────────────────────────
const screenshotsDir = path.join(__dirname, 'outputs', 'screenshots');
const pdfDir        = path.join(__dirname, 'outputs', 'pdf');
[screenshotsDir, pdfDir].forEach(d => { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); });

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/outputs', express.static(path.join(__dirname, 'outputs')));

// ─── Hardcoded Experiment Data ────────────────────────────────────────────────
const experimentData = {
  exp1: {
    title: "HTML Basics",
    code: `<!DOCTYPE html>
<html>
<head>
<title>{{name}}'s Webpage</title>
</head>
<body style="background-color:#f0f0f0;">
<h1>Welcome, {{name}}!</h1>
<h2>1. Formatting &amp; Elements</h2>
<p>This is a <b>bold</b> word, an <i>italicized</i> one, and a <u>underlined</u> name.</p>
<h2>2. Hyperlink</h2>
<p>Check out <a href="https://google.com" target="_blank">Google</a> for more info.</p>
<h2>3. Images</h2>
<img src="https://placehold.co/150x150" alt="Sample Image" width="150" height="150">
<h2>4. Lists</h2>
<ul>
<li>HTML Basics</li>
<li>Web Design</li>
<li>{{name}}'s Projects</li>
</ul>
<h2>5. Frames (Inline Frame)</h2>
<iframe src="https://wikipedia.org" width="100%" height="300"></iframe>
</body>
</html>`
  },

  exp2: {
    title: "HTML + CSS3",
    code: `<html>
<head>
<title>{{name}} - HTML + CSS3 Experiment</title>
<style>
body { background: burlywood; font-family: Arial; }
h2 { color: blue; }
.box { background-color: yellow; padding: 6px; }
#link { color: white; }
ul { color: purple; list-style-type: square; }
table, th, td { border: 0.5px solid black; border-collapse: collapse; padding: 5px; }
a:hover { color: red; }
p::first-letter { font-size: 18px; color: purple; }
img { width: 120px; border-radius: 10px; }
</style>
</head>
<body>
<h2>{{name}} - HTML Experiment</h2>
<p class="box"><b>Bold</b>, <i>Italic</i>, <u>Underline</u></p>
<a id="link" href="https://example.com" target="_blank">Visit Site</a>
<h3>Image</h3>
<img src="https://cdn2.thecatapi.com/images/MTY3ODIyMQ.jpg" alt="Cute Cat">
<h3>List</h3>
<ul><li>HTML</li><li>CSS</li><li>{{name}}'s Projects</li></ul>
<ol><li>One</li><li>Two</li></ol>
<h3>Table</h3>
<table><tr><th>Name</th><th>Age</th></tr><tr><td>{{name}}</td><td>20</td></tr></table>
<h3>Form</h3>
<form>
<input type="text" placeholder="Name">
<input type="email" placeholder="Email">
<input type="submit">
</form>
</body>
</html>`
  },

  exp3: {
    title: "Bootstrap 5",
    code: `<!DOCTYPE html>
<html>
<head>
<title>with bootstrap 5</title>
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
<h1 class="display-1 text-center bg-dark text-white">{{name}}</h1>
<div class="container text-center mt-4">
<div class="row">
<div class="col"><input type="text" class="form-control" placeholder="First name"></div>
<div class="col"><input type="text" class="form-control" placeholder="Last name"></div>
</div>
<form class="row g-3 mt-3">
<div class="col-md-6"><label class="form-label">Email</label><input type="email" class="form-control"></div>
<div class="col-md-6"><label class="form-label">Password</label><input type="password" class="form-control"></div>
<div class="col-12"><label class="form-label">Address</label><input type="text" class="form-control" placeholder="1234 Main St"></div>
<div class="col-md-6"><label class="form-label">City</label><input type="text" class="form-control"></div>
<div class="col-md-4"><label class="form-label">State</label><select class="form-select"><option>Maharashtra</option></select></div>
<div class="col-md-2"><label class="form-label">Zip</label><input type="text" class="form-control"></div>
<div class="col-12"><input type="checkbox"> Check me out</div>
<div class="col-12"><button type="submit" class="btn btn-primary">Sign in</button></div>
</form>
</div>
</body>
</html>`
  },

  exp4: {
    title: "JavaScript Concepts",
    code: `<!DOCTYPE html>
<html>
<head><title>JavaScript Concepts Demo</title></head>
<body>
<h2>JavaScript Concepts Demo - {{name}}</h2>
<button id="btn">Click Me</button>
<div id="output"></div>
<script>
let name = "{{name}}";
const pi = 3.14159;
var age = 19;
let sum = 10 + 5;
let product = 10 * 5;
let isAdult = age >= 18;
if (isAdult) { console.log(name + " is an adult."); }
for (let i = 0; i < 3; i++) { console.log("Loop iteration: " + i); }
function greet(user) { return "Hello, " + user + "!"; }
class Person {
  constructor(name, age) { this.name = name; this.age = age; }
  introduce() { return "Hi, I'm " + this.name + ", and I'm " + this.age + " years old."; }
}
let person1 = new Person("{{name}}", 19);
let fruits = ["Apple", "Banana", "Cherry"];
fruits.push("Mango");
let message = "JavaScript is powerful!";
let today = new Date();
document.getElementById("output").innerHTML =
  "<p>" + greet(name) + "</p>" +
  "<p>" + person1.introduce() + "</p>" +
  "<p>Sum: " + sum + ", Product: " + product + "</p>" +
  "<p>Fruits: " + fruits.join(", ") + "</p>" +
  "<p>Message: " + message.toUpperCase() + " (Length: " + message.length + ")</p>" +
  "<p>Date: " + today.toDateString() + "</p>";
document.getElementById("btn").addEventListener("click", function() { alert("Button clicked!"); });
<\/script>
</body>
</html>`
  },

  exp5: {
    title: "React.js Basics",
    code: `<!DOCTYPE html>
<html>
<head>
<title>{{name}} - React Basic</title>
<script src="https://unpkg.com/react@18/umd/react.development.js"><\/script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"><\/script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"><\/script>
</head>
<body>
<div id="root"></div>
<script type="text/babel">
function App() {
  const [count, setCount] = React.useState(0);
  return (
    <div>
      <h1>Hello React - {{name}}</h1>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Click Me</button>
    </div>
  );
}
ReactDOM.createRoot(document.getElementById("root")).render(<App />);
<\/script>
</body>
</html>`
  },

  exp6: {
    title: "Node.js + Express",
    code: `const express = require("express");
const app = express();
const PORT = 3000;

app.get("/", (req, res) => {
  res.send("Welcome to Express App");
});

function greet(name, callback) {
  console.log("Hello " + "World");
  callback();
}
greet("{{name}}", function() {
  console.log("Callback executed!");
});

console.log("Start");
setTimeout(() => {
  console.log("Inside setTimeout (Event Loop)");
}, 0);
console.log("End");

app.get("/user", (req, res) => {
  res.send("User Route Working!");
});

app.listen(PORT, () => {
  console.log("Server running on http://localhost:" + PORT);
});`,
    terminalOutput: `Processing user...
Hello {{name}}
Start
End
Server running on http://localhost:3000
This runs after 2 seconds (Event Loop)`
  },

  exp7: {
    title: "Cisco Router RIP Configuration",
    code: `Router 1 (R1)
enable
configure terminal
interface gig0/0
ip address 192.168.1.1 255.255.255.0
no shutdown
interface gig0/1
ip address 10.0.0.1 255.255.255.0
no shutdown
router rip
version 2
network 192.168.1.0
network 10.0.0.0
end
write memory`,
    terminalOutput: `Pinging 192.168.3.2 with 32 bytes of data:
Reply from 192.168.3.2: bytes=32 time=1ms TTL=126
Reply from 192.168.3.2: bytes=32 time=1ms TTL=126
Reply from 192.168.3.2: bytes=32 time=2ms TTL=126
Reply from 192.168.3.2: bytes=32 time=1ms TTL=126
Packets: Sent=4, Received=4, Lost=0 (0% loss)
Minimum = 1ms, Maximum = 2ms, Average = 1ms`
  }
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function applyName(str, name) {
  return str.replace(/\{\{name\}\}/g, name || 'Student');
}

// ─── Screenshot Generator ─────────────────────────────────────────────────────
async function generateScreenshot(expNumber, expEntry, studentName, outputPath) {
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath(),
    headless: chromium.headless,
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1000, height: 700 });

  const expNum = parseInt(expNumber);

  if ([1, 2, 3, 4, 5].includes(expNum)) {
    // Render the actual HTML code in a browser window
    const renderedCode = applyName(expEntry.code, studentName);
    await page.setContent(renderedCode, { waitUntil: 'networkidle0', timeout: 15000 }).catch(() => {});
    if ([4, 5].includes(expNum)) {
      // Give JS / React a bit more time to execute
      await new Promise(r => setTimeout(r, 2500));
    }
  } else {
    // Exp 6: dark terminal - green text
    // Exp 7: dark terminal - white text
    const termText = applyName(expEntry.terminalOutput || '', studentName);
    const textColor = expNum === 6 ? '#4af626' : '#f0f0f0';
    const label = expNum === 6
      ? 'node server.js'
      : 'Router# ping 192.168.3.2';

    const termHtml = `<!DOCTYPE html>
<html>
<head>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #1a1a1a; padding: 24px; font-family: 'Courier New', Courier, monospace; }
  .terminal {
    background: #0d0d0d;
    border: 1px solid #333;
    border-radius: 8px;
    padding: 24px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.6);
  }
  .bar {
    display: flex; gap: 8px; margin-bottom: 18px;
  }
  .dot { width: 13px; height: 13px; border-radius: 50%; }
  .red { background: #ff5f57; }
  .yellow { background: #febc2e; }
  .green { background: #28c840; }
  .prompt { color: #888; font-size: 13px; margin-bottom: 12px; }
  .prompt span { color: ${textColor}; }
  pre {
    color: ${textColor};
    font-size: 14px;
    line-height: 1.7;
    white-space: pre-wrap;
    word-break: break-all;
  }
</style>
</head>
<body>
<div class="terminal">
  <div class="bar"><div class="dot red"></div><div class="dot yellow"></div><div class="dot green"></div></div>
  <div class="prompt">user@lab:~$ <span>${label}</span></div>
  <pre>${termText.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
</div>
</body>
</html>`;

    await page.setContent(termHtml, { waitUntil: 'load' });
  }

  await page.screenshot({ path: outputPath });
  await browser.close();
}

// ─── Routes ───────────────────────────────────────────────────────────────────
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

app.get('/download/:filename', (req, res) => {
  const filePath = path.join(pdfDir, req.params.filename);
  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.status(404).send('File not found');
  }
});

app.post('/generate', async (req, res) => {
  try {
    console.log("--> Received /generate request");
    const { name, rollno, date } = req.body;
    let experiments = req.body.experiments;

    if (!experiments) experiments = [];
    if (!Array.isArray(experiments)) experiments = [experiments];
    experiments = experiments.map(e => parseInt(e));

    // ── Step 1: Screenshots (skip exp 6 & 7 — they use inline text output) ────
    console.log("--> Generating screenshots...");
    const screenshotUrls = {};

    for (const exp of experiments) {
      if ([6, 7].includes(exp)) {
        console.log(`    [Screenshot] Exp ${exp} skipped (uses inline text output)`);
        screenshotUrls[`exp${exp}`] = '';
        continue;
      }
      const key = `exp${exp}`;
      const filename = `${key}_${Date.now()}.png`;
      const outputPath = path.join(screenshotsDir, filename);
      await generateScreenshot(exp, experimentData[key], name, outputPath);
      screenshotUrls[key] = `http://localhost:${PORT}/outputs/screenshots/${filename}`;
      console.log(`    [Screenshot] Exp ${exp} done`);
    }

    // ── Step 2: Assemble experiment HTML pages ────────────────────────────────
    console.log("--> Assembling experiment pages...");
    const experimentPages = [];

    for (const exp of experiments) {
      const key = `exp${exp}`;
      const entry = experimentData[key];
      const screenshotUrl = screenshotUrls[key];

      const displayCode = applyName(entry.code, name);
      const safeCode = displayCode.replace(/&(?!amp;|lt;|gt;|quot;|#)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

      const templatePath = path.join(__dirname, 'templates', `exp${exp}.html`);
      let template = fs.existsSync(templatePath)
        ? fs.readFileSync(templatePath, 'utf8')
        : fs.readFileSync(path.join(__dirname, 'templates', 'exp1.html'), 'utf8');

      template = template
        .replace(/\{\{name\}\}/g, name || '')
        .replace(/\{\{rollno\}\}/g, rollno || '')
        .replace(/\{\{date\}\}/g, date || '')
        .replace(/\{\{title\}\}/g, entry.title)
        .replace(/\{\{code\}\}/g, safeCode)
        .replace(/\{\{screenshotPath\}\}/g, screenshotUrl);

      experimentPages.push(template);
    }

    // ── Step 4: Build PDF ─────────────────────────────────────────────────────
    console.log("--> Compiling final PDF...");

    const coverHtml = `
      <div style="text-align:center; display:flex; flex-direction:column; justify-content:center; height:100vh; page-break-after:always;">
        <h1>College Of Engineering</h1>
        <h2>Web Technology Lab Report</h2>
        <h3>Academic Year: 2023–2024</h3>
        <br><br>
        <div style="font-size:1.4em; text-align:left; margin:0 auto; width:320px; line-height:2;">
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Roll No:</strong> ${rollno}</p>
          <p><strong>Date:</strong> ${date}</p>
        </div>
      </div>`;

    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Lab Report – ${name}</title>
  <style>
    /* ── Global Typography ─────────────────────────────── */
    body {
      font-family: Arial, sans-serif;
      font-size: 12px;
      margin: 0; padding: 0; color: #000;
    }
    h1, h2, h3, h4, strong, label, td, th, p {
      font-family: Arial, sans-serif;
      font-size: 12px;
    }
    h1 { font-size: 18px; }
    h2 { font-size: 14px; border-bottom: 2px solid #333; padding-bottom: 6px; text-align: center; }
    h3 { font-size: 13px; color: #222; margin-top: 20px; margin-bottom: 4px; }
    p  { line-height: 1.65; text-align: justify; margin: 4px 0; }
    /* ── Code Blocks ─────────────────────────────────────── */
    pre, code, .code-block {
      font-family: 'Courier New', Courier, monospace;
      font-size: 10px;
    }
    pre {
      background: #f5f5f5;
      padding: 12px;
      border-radius: 4px;
      border: 1px solid #ddd;
      white-space: pre-wrap;
      word-break: break-all;
      overflow: hidden;
      line-height: 1.5;
    }
    /* ── Layout Helpers ─────────────────────────────────── */
    .experiment-page { page-break-after: always; }
    .experiment-page:last-child { page-break-after: auto; }
    .info-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
    .info-table td { padding: 2px 0; font-family: Arial, sans-serif; font-size: 12px; }
    .output-img-wrap { text-align: center; margin: 12px 0; }
    img { max-width: 100%; border: 1px solid #ccc; border-radius: 4px; }
    .caption { font-style: italic; color: #555; text-align: center; font-size: 11px; }
  </style>
</head>
<body>
  ${coverHtml}
  ${experimentPages.join('\n')}
</body>
</html>`;

    const pdfFilename = `lab_report_${(name || 'student').replace(/\s+/g, '_')}_${Date.now()}.pdf`;
    const pdfFilePath = path.join(pdfDir, pdfFilename);

    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });
    const page = await browser.newPage();
    await page.setContent(fullHtml, { waitUntil: 'networkidle0', timeout: 30000 });
    // Allow fonts to fully paint before capturing PDF
    await new Promise(r => setTimeout(r, 500));
    await page.pdf({
      path: pdfFilePath,
      format: 'A4',
      margin: { top: '15mm', right: '15mm', bottom: '15mm', left: '15mm' },
      printBackground: true
    });
    await browser.close();

    console.log(`--> PDF created: ${pdfFilename}`);
    res.json({ success: true, downloadUrl: `/download/${pdfFilename}` });

  } catch (err) {
    console.error("--> [ERROR]", err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀  AI Lab Generator running → http://localhost:${PORT}\n`);
});
