const axios = require("axios");
const FormData = require("form-data");

const {
  existsSync,
  watchFile,
  readFileSync,
  statSync,
  createReadStream,
} = require("fs");

const INDEX_REGEX = /^index[0-9]{1,}\.ts/;
const INDEX_PATH = "./media/index.m3u8";

function watcher() {
  if (!existsSync(INDEX_PATH)) {
    console.error("index.m3u8 not found!");

    process.exit(0);
  }

  const STATS = {};

  watchFile(INDEX_PATH, () => {
    readFileSync(INDEX_PATH, "utf-8")
      .split("\n")
      .filter((line) => INDEX_REGEX.test(line))
      .forEach(async (filename) => {
        const stats = statSync(`./media/${filename}`);

        if (STATS[filename] && STATS[filename].mtime >= stats.mtime) {
          return;
        }

        STATS[filename] = stats;

        await write(filename);
      });

    write("index.m3u8");
  });
}

async function write(filename) {
  const data = new FormData();

  data.append("file", createReadStream(`./media/${filename}`));

  const query = new URLSearchParams();

  query.append("create", true);
  query.append("arg", `/media/${filename}`);

  const url = new URL("http://127.0.0.1:5001/api/v0/files/write");

  url.search = query;

  const config = {
    method: "post",
    url: url.toString(),
    headers: {
      ...data.getHeaders(),
    },
    data,
  };

  try {
    const { data } = await axios(config);

    console.log(`Uploaded /media/${filename}`);

    return data;
  } catch (error) {
    console.error(error);

    return null;
  }
}

async function ls() {
  const query = new URLSearchParams();

  query.append("arg", `/media`);

  const url = new URL("http://127.0.0.1:5001/api/v0/files/ls");

  url.search = query;

  const config = {
    method: "post",
    url: url.toString(),
  };

  try {
    const { data } = await axios(config);

    if (!data["Entries"]) {
      return null;
    }

    return data.map(({ Name: name }) => name);
  } catch (error) {
    console.error(error.message);

    console.error(":::ls:", error.message);

    return null;
  }
}

async function rm(folder) {
  const query = new URLSearchParams();

  query.append("arg", folder);
  query.append("recursive", true);

  const url = new URL("http://127.0.0.1:5001/api/v0/files/rm");

  url.search = query;

  const config = {
    method: "post",
    url: url.toString(),
  };

  try {
    await axios(config);

    return true;
  } catch (error) {
    console.error(":::rm:error:", error.message);

    return null;
  }
}

async function mkdir(folder) {
  const query = new URLSearchParams();

  query.append("arg", folder);

  const url = new URL("http://127.0.0.1:5001/api/v0/files/mkdir");

  url.search = query;

  const config = {
    method: "post",
    url: url.toString(),
  };

  try {
    await axios(config);

    return true;
  } catch (error) {
    console.error(":::mkdir:error", error.message);

    return null;
  }
}

async function init() {
  // await rm("/media");
  // await mkdir("/media");

  watcher();
}

init();
