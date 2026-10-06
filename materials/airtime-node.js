// Node runner: loads assets/ami-sample.js and assets/airtime-live.js exactly as the browser does
// and prints the canon as JSON. Compare with: python3 materials/build-ami-airtime.py --json .
const fs = require("fs"), path = require("path"), vm = require("vm");
const repo = process.argv[2] || path.join(__dirname, "..");
const ctx = { window: {} }; ctx.window.window = ctx.window;
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(repo, "assets/ami-sample.js"), "utf8"), ctx);
const api = require(path.join(path.resolve(repo), "assets/airtime-live.js"));
process.stdout.write(JSON.stringify(api.canon(ctx.window.AMI_SAMPLE)));
