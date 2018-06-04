'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

// Native
var _require = require('url'),
    URL = _require.URL;

var _require2 = require('path'),
    join = _require2.join;

var fs = require('fs');

var _require3 = require('util'),
    promisify = _require3.promisify;

var _require4 = require('os'),
    tmpdir = _require4.tmpdir;

// Packages


var registryUrl = require('registry-url');

var writeFile = promisify(fs.writeFile);
var mkdir = promisify(fs.mkdir);
var readFile = promisify(fs.readFile);
var compareVersions = function compareVersions(a, b) {
	return a.localeCompare(b, 'en-US', { numeric: true });
};
var encode = function encode(value) {
	return encodeURIComponent(value).replace(/^%40/, '@');
};

var getFile = function () {
	var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(details, distTag) {
		var rootDir, subDir, name;
		return regeneratorRuntime.wrap(function _callee$(_context) {
			while (1) {
				switch (_context.prev = _context.next) {
					case 0:
						rootDir = tmpdir();
						subDir = join(rootDir, 'update-check');


						if (!fs.existsSync(subDir)) {
							mkdir(subDir);
						}

						name = details.name + '-' + distTag + '.json';


						if (details.scope) {
							name = details.scope + '-' + name;
						}

						return _context.abrupt('return', join(subDir, name));

					case 6:
					case 'end':
						return _context.stop();
				}
			}
		}, _callee, undefined);
	}));

	return function getFile(_x, _x2) {
		return _ref.apply(this, arguments);
	};
}();

var evaluateCache = function () {
	var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(file, time, interval) {
		var content, _JSON$parse, lastUpdate, latest, nextCheck;

		return regeneratorRuntime.wrap(function _callee2$(_context2) {
			while (1) {
				switch (_context2.prev = _context2.next) {
					case 0:
						if (!fs.existsSync(file)) {
							_context2.next = 8;
							break;
						}

						_context2.next = 3;
						return readFile(file, 'utf8');

					case 3:
						content = _context2.sent;
						_JSON$parse = JSON.parse(content), lastUpdate = _JSON$parse.lastUpdate, latest = _JSON$parse.latest;
						nextCheck = lastUpdate + interval;

						// As long as the time of the next check is in
						// the future, we don't need to run it yet

						if (!(nextCheck > time)) {
							_context2.next = 8;
							break;
						}

						return _context2.abrupt('return', {
							shouldCheck: false,
							latest: latest
						});

					case 8:
						return _context2.abrupt('return', {
							shouldCheck: true,
							latest: null
						});

					case 9:
					case 'end':
						return _context2.stop();
				}
			}
		}, _callee2, undefined);
	}));

	return function evaluateCache(_x3, _x4, _x5) {
		return _ref2.apply(this, arguments);
	};
}();

var updateCache = function () {
	var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(file, latest, lastUpdate) {
		var content;
		return regeneratorRuntime.wrap(function _callee3$(_context3) {
			while (1) {
				switch (_context3.prev = _context3.next) {
					case 0:
						content = JSON.stringify({
							latest: latest,
							lastUpdate: lastUpdate
						});
						_context3.next = 3;
						return writeFile(file, content, 'utf8');

					case 3:
					case 'end':
						return _context3.stop();
				}
			}
		}, _callee3, undefined);
	}));

	return function updateCache(_x6, _x7, _x8) {
		return _ref3.apply(this, arguments);
	};
}();

var loadPackage = function loadPackage(url, authInfo) {
	return new Promise(function (resolve, reject) {
		var options = {
			host: url.hostname,
			path: url.pathname,
			port: url.port,
			headers: {
				accept: 'application/vnd.npm.install-v1+json; q=1.0, application/json; q=0.8, */*'
			},
			timeout: 2000
		};

		if (authInfo) {
			options.headers.authorization = authInfo.type + ' ' + authInfo.token;
		}

		var _require5 = require(url.protocol === 'https:' ? 'https' : 'http'),
		    get = _require5.get;

		get(options, function (response) {
			var statusCode = response.statusCode;


			if (statusCode !== 200) {
				var error = new Error('Request failed with code ' + statusCode);
				error.code = statusCode;

				reject(error);

				// Consume response data to free up RAM
				response.resume();
				return;
			}

			var rawData = '';
			response.setEncoding('utf8');

			response.on('data', function (chunk) {
				rawData += chunk;
			});

			response.on('end', function () {
				try {
					var parsedData = JSON.parse(rawData);
					resolve(parsedData);
				} catch (e) {
					reject(e);
				}
			});
		}).on('error', reject).on('timeout', reject);
	});
};

var getMostRecent = function () {
	var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(_ref5, distTag) {
		var full = _ref5.full,
		    scope = _ref5.scope;
		var regURL, url, spec, registryAuthToken, authInfo, version;
		return regeneratorRuntime.wrap(function _callee4$(_context4) {
			while (1) {
				switch (_context4.prev = _context4.next) {
					case 0:
						regURL = registryUrl(scope);
						url = new URL(full, regURL);
						spec = null;
						_context4.prev = 3;
						_context4.next = 6;
						return loadPackage(url);

					case 6:
						spec = _context4.sent;
						_context4.next = 20;
						break;

					case 9:
						_context4.prev = 9;
						_context4.t0 = _context4['catch'](3);

						if (!(_context4.t0.code && String(_context4.t0.code).startsWith(4))) {
							_context4.next = 19;
							break;
						}

						// We only want to load this package for when we
						// really need to use the token
						registryAuthToken = require('registry-auth-token');
						authInfo = registryAuthToken(regURL, { recursive: true });
						_context4.next = 16;
						return loadPackage(url, authInfo);

					case 16:
						spec = _context4.sent;
						_context4.next = 20;
						break;

					case 19:
						throw _context4.t0;

					case 20:
						version = spec['dist-tags'][distTag];

						if (version) {
							_context4.next = 23;
							break;
						}

						throw new Error('Distribution tag ' + distTag + ' is not available');

					case 23:
						return _context4.abrupt('return', version);

					case 24:
					case 'end':
						return _context4.stop();
				}
			}
		}, _callee4, undefined, [[3, 9]]);
	}));

	return function getMostRecent(_x9, _x10) {
		return _ref4.apply(this, arguments);
	};
}();

var defaultConfig = {
	interval: 3600000,
	distTag: 'latest'
};

var getDetails = function getDetails(name) {
	var spec = {
		full: encode(name)
	};

	if (name.includes('/')) {
		var parts = name.split('/');

		spec.scope = parts[0];
		spec.name = parts[1];
	} else {
		spec.scope = null;
		spec.name = name;
	}

	return spec;
};

module.exports = function () {
	var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(pkg, config) {
		var details, time, _Object$assign, distTag, interval, file, latest, shouldCheck, _ref7, comparision;

		return regeneratorRuntime.wrap(function _callee5$(_context5) {
			while (1) {
				switch (_context5.prev = _context5.next) {
					case 0:
						if (!((typeof pkg === 'undefined' ? 'undefined' : _typeof(pkg)) !== 'object')) {
							_context5.next = 2;
							break;
						}

						throw new Error('The first parameter should be your package.json file content');

					case 2:
						details = getDetails(pkg.name);
						time = Date.now();
						_Object$assign = Object.assign({}, defaultConfig, config), distTag = _Object$assign.distTag, interval = _Object$assign.interval;
						_context5.next = 7;
						return getFile(details, distTag);

					case 7:
						file = _context5.sent;
						latest = null;
						shouldCheck = true;
						_context5.next = 12;
						return evaluateCache(file, time, interval);

					case 12:
						_ref7 = _context5.sent;
						shouldCheck = _ref7.shouldCheck;
						latest = _ref7.latest;

						if (!shouldCheck) {
							_context5.next = 21;
							break;
						}

						_context5.next = 18;
						return getMostRecent(details, distTag);

					case 18:
						latest = _context5.sent;
						_context5.next = 21;
						return updateCache(file, latest, time);

					case 21:
						comparision = compareVersions(pkg.version, latest);

						if (!(comparision === -1)) {
							_context5.next = 24;
							break;
						}

						return _context5.abrupt('return', {
							latest: latest,
							fromCache: !shouldCheck
						});

					case 24:
						return _context5.abrupt('return', null);

					case 25:
					case 'end':
						return _context5.stop();
				}
			}
		}, _callee5, undefined);
	}));

	return function (_x11, _x12) {
		return _ref6.apply(this, arguments);
	};
}();
