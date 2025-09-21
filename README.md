# Wollok Web Tools

[![npm version](https://badge.fury.io/js/wollok-web-tools.svg)](https://badge.fury.io/js/wollok-web-tools) [![Node.js CI](https://github.com/uqbar-project/wollok-web-tools/actions/workflows/node.js.yml/badge.svg)](https://github.com/uqbar-project/wollok-web-tools/actions/workflows/node.js.yml) ![GitHub License](https://img.shields.io/github/license/uqbar-project/wollok-web-tools)

Web tools for Wollok programming language, such as

- Wollok Game
- Dynamic Diagram

It will contain both client & server dependencies.

## 💻 Installing it locally

```bash
npm install  # or npm i
```

## 🚀 How to publish this package

- Make sure you have the latest version set in `package.json`
- Also take some time and explain the changes in the `CHANGELOG.md` file
- It's always good to tag the current `main` branch into a tag

```bash
git tag -a v1.1.10 -m "1.1.10"
git push origin v1.1.10
```

(replace `v1.1.10` with the version you want to publish)

- Create also a release: go to [this link](https://github.com/uqbar-project/wollok-web-tools/releases/new), and create a new release with the tag you just created. 
  - The title should be the version number (no 'v' prefix)
  - The description should be the changes in the `CHANGELOG.md` file
  - Uncheck "Set as a pre-release"
  - Check "Set as the latest release"
  - Click "Publish release"

- Run `npm run build` in order to generate `dist` folder
- Then simply run

```bash
npm publish
```

You'll need a npm user with publishing permissions.

## 👩‍💻 Contributing

All contributions are welcome!

- See [installation instructions for developers](https://uqbar-project.github.io/wollok-ts/pages/How-To-Contribute/Developer-environment.html)
- You can [join the Discord channel!](https://discord.gg/ZstgCPKEaa)
- There's a list of [good first issues](https://github.com/uqbar-project/wollok-web-tools/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22) to tackle, but in case of any hesitation you can always ping @PalumboN or @fdodino
- You can fork the project and [create a *Pull Request*](https://help.github.com/articles/creating-a-pull-request-from-a-fork/). If you've never collaborated with an open source project before, you might want to read [this guide](https://akrabat.com/the-beginners-guide-to-contributing-to-a-github-project/)

__Powered by [Uqbar](https://uqbar.org/)__


