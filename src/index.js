const Promise = require("bluebird");
const path = require("path");
const fs = Promise.promisifyAll(require("fs"));
const fse = require("fs-extra");
const Mustache = require("mustache");
const chokidar = require("chokidar");
const moment = require("moment");

const env = process.env.NODE_ENV || "dev";

const appPaths = {
  public: "public",
  src: "src",
  pages: "pages",
  partials: "partials",
  scripts: "scripts",
  images: "images",
  css: "css"
};

const LOG = {
  debug: msg => {
    const time = moment().format("YYYY-MM-DD HH:mm:ss");
    console.log(`${env} ${time} ${msg}`);
  },
  error: err => {
    const time = moment().format("YYYY-MM-DD HH:mm:ss");
    console.log(time);
    console.error(err);
  }
};

Promise.resolve().then(async () => {
  await main();
});

const main = async () => {
  LOG.debug("Running app in " + env);
  await generateSite();

  if (env === "dev") {
    watchFiles();
  }
};

const generateSite = async () => {
  await copyAssets();
  await buildContent();
};

const copyAssets = async () => {
  LOG.debug("copying assets: empty public, copy images, copy scripts, copy css");
  await fse.emptyDir(appPaths.public);
  await copyImages();
  await copyScripts();
  await copyCss();
  LOG.debug("done copying assets");
};

const copyImages = () => {
  return fse.copy(path.join(appPaths.src, appPaths.images), path.join(appPaths.public, appPaths.images));
};

const copyScripts = () => {
  return fse.copy(path.join(appPaths.src, appPaths.scripts), path.join(appPaths.public, appPaths.scripts));
};

const copyCss = () => {
  return fse.copy(path.join(appPaths.src, appPaths.css), path.join(appPaths.public, appPaths.css));
};

const buildContent = async () => {
  LOG.debug("start building content");
  const pages = await compilePages();
  await writePages(pages);
  LOG.debug("done building content");
};

const compilePages = async () => {
  const partials = await loadPartials();

  const result = {};
  const pagesDir = path.join(appPaths.src, appPaths.pages);
  const fileNames = await fs.readdirAsync(pagesDir);
  for (const fileName of fileNames) {
    const name = path.parse(fileName).name;
    const fileContent = await fs.readFileAsync(path.join(pagesDir, fileName));
    result[name] = Mustache.render(fileContent.toString(), {}, partials);
  }
  return result;
};

const loadPartials = async () => {
  const result = {};
  const partialsDir = path.join(appPaths.src, appPaths.partials);
  const fileNames = await fs.readdirAsync(partialsDir);
  for (const fileName of fileNames) {
    const name = path.parse(fileName).name;
    const content = await fs.readFileAsync(path.join(partialsDir, fileName));
    result[name] = content.toString();
  }
  return result;
};

const writePages = async pages => {
  for (const page of Object.keys(pages)) {
    await fs.writeFileAsync(path.join(appPaths.public, page + ".html"), pages[page]);
  }
};

const watchFiles = () => {
  const watcher = chokidar.watch(
    [
      path.join(appPaths.src, appPaths.partials),
      path.join(appPaths.src, appPaths.pages),
      path.join(appPaths.src, appPaths.css),
      path.join(appPaths.src, appPaths.scripts),
      path.join(appPaths.src, appPaths.images)
    ],
    {
      ignored: /(^|[\/\\])\../, // chokidar will watch folders recursively
      ignoreInitial: false,
      persistent: true
    }
  );

  setTimeout(() => {
    LOG.debug("watching files");
    LOG.debug(JSON.stringify(watcher.getWatched()));
  }, 5000);

  watcher.on("change", async path => {
    LOG.debug("changed " + path + ", recompiling");
    try {
      await generateSite();
    } catch (err) {
      LOG.error(err);
    }
  });

  // catch ctrl+c event and exit normally
  process.on("SIGINT", function() {
    watcher.close();
  });
};
