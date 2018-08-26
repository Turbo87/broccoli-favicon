import Plugin from 'broccoli-caching-writer';
import FaviconsJs from 'favicons';

import config from './config';

import fs from 'fs';
import path from 'path';
import deepMerge from 'lodash.merge';
import { parse as parseHtml } from 'himalaya';


export default class Favicon extends Plugin {
  constructor(node, options = {}) {
    super([node], {
      name: options.name,
      annotation: options.annotation
    });

    this.config = deepMerge({}, config, options);
  }

  build() {
    let { iconPath, faviconsConfig } = this.config;
    iconPath = path.join(this.inputPaths[0], iconPath);

    if (!fs.existsSync(iconPath)) {
      return Promise.resolve()
    }

    return this._generateFavicons(iconPath, faviconsConfig).then(this._onSuccess.bind(this));
  }

  _onSuccess(response) {
    let parsedHtml = parseHtml(response.html.join(''));

    this._saveFiles(response.images.concat(response.files))

    return this.config.onSuccess(response.html, parsedHtml);
  }

  _generateFavicons(imagePath, options = {}) {
    return new Promise((resolve, reject) => {
      return FaviconsJs(imagePath, options, (error, response) => {
        if (error) {
          reject(new Error(`${error.name}: ${error.message}`));
        } else {
          resolve(response);
        }
      });
    });
  }

  _saveFiles(files) {
    files.forEach((file) => fs.writeFileSync(path.join(this.outputPath, file.name), file.contents));
  }
}
