"use strict";

/*
Практическое задание
Используя наработки практического задания прошлого урока, 
создайте веб-версию приложения.
Сделайте так, чтобы при запуске она:
● показывала содержимое текущей директории;
● давала возможность навигации по каталогам из исходной папки;
● при выборе файла показывала его содержимое.
*/

import express from "express";
import pkgColors from "colors";
import favicon from "serve-favicon";
import { lstatSync, readdirSync, readFileSync, readFile } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { parse } from "node-html-parser";

const { green, underline } = pkgColors;
const HOSTNAME = "127.0.0.1";
const PORT = 3000;
const app = express();
const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const isDir = (path) => {
  return lstatSync(path).isDirectory();
};

router.get("*", (req, res) => {
  if (req.originalUrl.match(/style.css/)) {
    res.writeHead(200, { "Content-type": "text/css" });
    const css = readFileSync(join(__dirname + "/public/css/style.css"), {
      encoding: "utf8",
    });
    res.write(css);
    return res.end();
  }

  if (isDir(join(__dirname, req.originalUrl))) {
    readFile(join(__dirname + "/public/index.html"), "utf8", (err, html) => {
      if (err) {
        throw err;
      }
      const subDir = parse(html);
      const elListSubDir = subDir.querySelector(".list");
      let currPath = readdirSync(join(__dirname, req.originalUrl));
      let lastIndex = req.baseUrl.lastIndexOf("/");
      let prevPath = req.baseUrl.substring(0, lastIndex);

      if (req.baseUrl !== "") {
        elListSubDir.appendChild(
          parse(`<li class="item dots"><a href="${join(prevPath)}">..</a></li>`)
        );
      }

      currPath.map((item) =>
        isDir(join(__dirname, req.originalUrl, item))
          ? elListSubDir.appendChild(
              parse(
                `<li class="item dir"><a href="${
                  req.baseUrl + "/" + item
                }"><i class="fa fa-folder" aria-hidden="true"></i>${item}</a></li>`
              )
            )
          : elListSubDir.appendChild(
              parse(
                `<li class="item"><a href="${
                  req.baseUrl + "/" + item
                }">${item}</a></li>`
              )
            )
      );

      res.writeHead(200, { "Content-Type": "text/html" });
      return res.end(subDir.toString());
    });
  } else {
    readFile(join(__dirname + req.originalUrl), "utf8", (err, data) => {
      if (err) {
        throw err;
      }
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(data.toString());
    });
  }
});

app.use(favicon(__dirname + "/public/favicon.ico"));
app.use("*", router);

app.listen(PORT, HOSTNAME, () => {
  console.log(
    `${green("Server running at:")} ${underline(`http://${HOSTNAME}:${PORT}`)}`
  );
});
