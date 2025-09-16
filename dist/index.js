/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 914:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const os = __nccwpck_require__(857);
/**
 * Commands
 *
 * Command Format:
 *   ##[name key=value;key=value]message
 *
 * Examples:
 *   ##[warning]This is the user warning message
 *   ##[set-secret name=mypassword]definitelyNotAPassword!
 */
function issueCommand(command, properties, message) {
    const cmd = new Command(command, properties, message);
    process.stdout.write(cmd.toString() + os.EOL);
}
exports.issueCommand = issueCommand;
function issue(name, message = '') {
    issueCommand(name, {}, message);
}
exports.issue = issue;
const CMD_STRING = '::';
class Command {
    constructor(command, properties, message) {
        if (!command) {
            command = 'missing.command';
        }
        this.command = command;
        this.properties = properties;
        this.message = message;
    }
    toString() {
        let cmdStr = CMD_STRING + this.command;
        if (this.properties && Object.keys(this.properties).length > 0) {
            cmdStr += ' ';
            for (const key in this.properties) {
                if (this.properties.hasOwnProperty(key)) {
                    const val = this.properties[key];
                    if (val) {
                        // safely append the val - avoid blowing up when attempting to
                        // call .replace() if message is not a string for some reason
                        cmdStr += `${key}=${escape(`${val || ''}`)},`;
                    }
                }
            }
        }
        cmdStr += CMD_STRING;
        // safely append the message - avoid blowing up when attempting to
        // call .replace() if message is not a string for some reason
        const message = `${this.message || ''}`;
        cmdStr += escapeData(message);
        return cmdStr;
    }
}
function escapeData(s) {
    return s.replace(/\r/g, '%0D').replace(/\n/g, '%0A');
}
function escape(s) {
    return s
        .replace(/\r/g, '%0D')
        .replace(/\n/g, '%0A')
        .replace(/]/g, '%5D')
        .replace(/;/g, '%3B');
}
//# sourceMappingURL=command.js.map

/***/ }),

/***/ 484:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const command_1 = __nccwpck_require__(914);
const os = __nccwpck_require__(857);
const path = __nccwpck_require__(928);
/**
 * The code to exit an action
 */
var ExitCode;
(function (ExitCode) {
    /**
     * A code indicating that the action was successful
     */
    ExitCode[ExitCode["Success"] = 0] = "Success";
    /**
     * A code indicating that the action was a failure
     */
    ExitCode[ExitCode["Failure"] = 1] = "Failure";
})(ExitCode = exports.ExitCode || (exports.ExitCode = {}));
//-----------------------------------------------------------------------
// Variables
//-----------------------------------------------------------------------
/**
 * sets env variable for this action and future actions in the job
 * @param name the name of the variable to set
 * @param val the value of the variable
 */
function exportVariable(name, val) {
    process.env[name] = val;
    command_1.issueCommand('set-env', { name }, val);
}
exports.exportVariable = exportVariable;
/**
 * exports the variable and registers a secret which will get masked from logs
 * @param name the name of the variable to set
 * @param val value of the secret
 */
function exportSecret(name, val) {
    exportVariable(name, val);
    // the runner will error with not implemented
    // leaving the function but raising the error earlier
    command_1.issueCommand('set-secret', {}, val);
    throw new Error('Not implemented.');
}
exports.exportSecret = exportSecret;
/**
 * Prepends inputPath to the PATH (for this action and future actions)
 * @param inputPath
 */
function addPath(inputPath) {
    command_1.issueCommand('add-path', {}, inputPath);
    process.env['PATH'] = `${inputPath}${path.delimiter}${process.env['PATH']}`;
}
exports.addPath = addPath;
/**
 * Gets the value of an input.  The value is also trimmed.
 *
 * @param     name     name of the input to get
 * @param     options  optional. See InputOptions.
 * @returns   string
 */
function getInput(name, options) {
    const val = process.env[`INPUT_${name.replace(/ /g, '_').toUpperCase()}`] || '';
    if (options && options.required && !val) {
        throw new Error(`Input required and not supplied: ${name}`);
    }
    return val.trim();
}
exports.getInput = getInput;
/**
 * Sets the value of an output.
 *
 * @param     name     name of the output to set
 * @param     value    value to store
 */
function setOutput(name, value) {
    command_1.issueCommand('set-output', { name }, value);
}
exports.setOutput = setOutput;
//-----------------------------------------------------------------------
// Results
//-----------------------------------------------------------------------
/**
 * Sets the action status to failed.
 * When the action exits it will be with an exit code of 1
 * @param message add error issue message
 */
function setFailed(message) {
    process.exitCode = ExitCode.Failure;
    error(message);
}
exports.setFailed = setFailed;
//-----------------------------------------------------------------------
// Logging Commands
//-----------------------------------------------------------------------
/**
 * Writes debug message to user log
 * @param message debug message
 */
function debug(message) {
    command_1.issueCommand('debug', {}, message);
}
exports.debug = debug;
/**
 * Adds an error issue
 * @param message error issue message
 */
function error(message) {
    command_1.issue('error', message);
}
exports.error = error;
/**
 * Adds an warning issue
 * @param message warning issue message
 */
function warning(message) {
    command_1.issue('warning', message);
}
exports.warning = warning;
/**
 * Writes info to log with console.log.
 * @param message info message
 */
function info(message) {
    process.stdout.write(message + os.EOL);
}
exports.info = info;
/**
 * Begin an output group.
 *
 * Output until the next `groupEnd` will be foldable in this group
 *
 * @param name The name of the output group
 */
function startGroup(name) {
    command_1.issue('group', name);
}
exports.startGroup = startGroup;
/**
 * End an output group.
 */
function endGroup() {
    command_1.issue('endgroup');
}
exports.endGroup = endGroup;
/**
 * Wrap an asynchronous function call in a group.
 *
 * Returns the same type as the function itself.
 *
 * @param name The name of the group
 * @param fn The function to wrap in the group
 */
function group(name, fn) {
    return __awaiter(this, void 0, void 0, function* () {
        startGroup(name);
        let result;
        try {
            result = yield fn();
        }
        finally {
            endGroup();
        }
        return result;
    });
}
exports.group = group;
//# sourceMappingURL=core.js.map

/***/ }),

/***/ 226:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const https = __nccwpck_require__(692);
const Buffer = (__nccwpck_require__(181).Buffer);

const NO_URL_ERROR = 'No Slack URL configured.';

function isString(str) {
  return typeof str === 'string';
}

module.exports = (url) => {
  const pub = {};

  pub.request = (data) => {
    return new Promise((resolve, reject) => {
      if (!url) {
        return reject(NO_URL_ERROR);
      }

      post(url, JSON.stringify(data)).then((resBody) => {
        if (resBody !== 'ok') {
          reject(resBody);
        } else {
          resolve();
        }
      }).catch(reject);
    });
  };

  pub.send = (options) => {
    if (isString(options)) {
      options = { text: options };
    }

    const data = Object.assign({}, options);

    // Move the fields into attachments
    if (options.fields) {
      if (!data.attachments) {
        data.attachments = [];
      }

      data.attachments.push({
        fallback: 'Alert details',
        fields: Object.values(options.fields).map((value, index) => {
          const title = Object.keys(options.fields)[index];

          return {
            title,
            value,
            short: (value + '').length < 25
          };
        })
      });

      delete(data.fields);
    }

    // Remove the default icon_emoji if icon_url was set in options. Otherwise the default emoji will always override the url
    if (options.icon_url && !options.icon_emoji) {
      delete(data.icon_emoji);
    }

    return pub.request(data);
  };

  pub.extend = (defaults) => (options) => {
    if (isString(options)) {
      options = { text: options };
    }

    return pub.send(Object.assign({}, defaults, options));
  };

  pub.success = pub.extend({
    channel: '#alerts',
    icon_emoji: ':trophy:',
    username: 'Success'
  });

  pub.bug = pub.extend({
    channel: '#bugs',
    icon_emoji: ':bomb:',
    username: 'Bug'
  });

  pub.alert = pub.extend({
    channel: '#alerts',
    icon_emoji: ':warning:',
    username: 'Alert'
  });

  return pub;
};

// Based off of https://stackoverflow.com/a/50891354
function post(url, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, { method: 'POST' }, (res) => {
      const chunks = [];
      res.on('data', data => chunks.push(data));
      res.on('end', () => {
        let resBody = Buffer.concat(chunks).toString();

        switch (res.headers['content-type']) {
          case 'application/json':
            resBody = JSON.parse(resBody);
            break;
        }

        resolve(resBody);
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(body);
    }

    req.end();
  });
}


/***/ }),

/***/ 181:
/***/ ((module) => {

"use strict";
module.exports = require("buffer");

/***/ }),

/***/ 692:
/***/ ((module) => {

"use strict";
module.exports = require("https");

/***/ }),

/***/ 857:
/***/ ((module) => {

"use strict";
module.exports = require("os");

/***/ }),

/***/ 928:
/***/ ((module) => {

"use strict";
module.exports = require("path");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId].call(module.exports, module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
const core = __nccwpck_require__(484);

const slack_webhook = core.getInput('slack_webhook', {
  required: true
});
const slack = __nccwpck_require__(226)(slack_webhook);

slack.onError = function (err) {
  core.error(`Error ${err}, action may still succeed though`);
};

// most @actions toolkit packages have async methods
async function run() {
  try {
    let attachment = {};
    attachment.fallback = core.getInput('fallback', {
      required: false
    });
    attachment.color = core.getInput('color', {
      required: false
    });
    attachment.pretext = core.getInput('pretext', {
      required: false
    });
    attachment.author_name = core.getInput('author_name', {
      required: false
    });
    attachment.author_link = core.getInput('author_link', {
      required: false
    });
    attachment.author_icon = core.getInput('author_icon', {
      required: false
    });
    attachment.title = core.getInput('title', {
      required: false
    });
    attachment.title_link = core.getInput('title_link', {
      required: false
    });
    attachment.text = core.getInput('text', {
      required: false
    });
    attachment.image_url = core.getInput('image_url', {
      required: false
    });
    attachment.thumb_url = core.getInput('thumb_url', {
      required: false
    });
    attachment.footer = core.getInput('footer', {
      required: false
    });
    attachment.footer_icon = core.getInput('footer_icon', {
      required: false
    });

    const channel = core.getInput('channel', {
      required: true
    });
    const icon_url = core.getInput('icon_url', {
      required: true
    });
    const username = core.getInput('username', {
      required: true
    });

    const default_attachment = {
      "title": `${process.env.GITHUB_REPOSITORY}`,
      "title_link": `https://github.com/${process.env.GITHUB_REPOSITORY}`,
      "color": attachment.color,
      "text": `${process.env.GITHUB_REF}`,
      "author_name": `${process.env.GITHUB_ACTOR}`,
      "author_link": `https://github.com/${process.env.GITHUB_ACTOR}`,
      "author_icon": `https://github.com/${process.env.GITHUB_ACTOR}.png`,
      "footer": `action -> ${process.env.GITHUB_EVENT_NAME}`,
      "thumb_url":"https://avatars0.githubusercontent.com/u/44036562?s=200&v=4"
    }

    var final_attachment = {};
    if (attachment.length == 0) {
      final_attachment = default_attachment;
    } else {
      final_attachment = attachment;
    }

    slack.send({
      channel: channel,
      icon_url: icon_url,
      username: username,
      attachments: [ final_attachment ]
    });
  } catch (error) {
    core.setFailed(error.message);
  }
}

run()

module.exports = __webpack_exports__;
/******/ })()
;