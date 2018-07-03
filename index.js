const fp = require('fastify-plugin');
const get = require('lodash.get');
const caniuse = require("caniuse-api");
const {lookup} = require("useragent");

const UserAgentToCanIUseShit = {
    'Android': 'android',
    'BlackBerry WebKit': 'bb',
    'Chrome Mobile': 'and_chr',
    'Chrome': 'chrome',
    'Edge': 'edge',
    'Firefox Mobile': 'and_ff',
    'Firefox': 'firefox',
    'IE Mobile': 'ie_mob',
    'IE': 'ie',
    'Mobile Safari': 'ios_saf',
    'Opera Mini': 'op_mini',
    'Opera Mobile': 'op_mob',
    'Opera': 'opera',
    'Safari': 'safari'
};

module.exports = fp(function (fastify, opts, next) {

    const features = get(opts, "features", []);
    const partially = get(opts, "partially", []);
    const whatShouldIdo = get(opts, "action", "https://www.browser-update.org/update-browser.html");
    const actionType = typeof whatShouldIdo === "function" ? "callback" : "redirect";


    const featureList = [];
    for (const feature of features) featureList.push({feature, partially: false});
    for (const feature of partially) featureList.push({feature, partially: true});
    let min = {};
    for (const feature of featureList) {
        const supportedBrowsers = caniuse.getSupport(feature.feature);
        for (const Browser in supportedBrowsers) {
            if (!supportedBrowsers.hasOwnProperty(Browser)) continue;
            if (!min[Browser]) min[Browser] = [];
            if (feature.partially) {
                if (supportedBrowsers[Browser].a) {
                    min[Browser].push(supportedBrowsers[Browser].a);
                } else if (supportedBrowsers[Browser].y) {
                    min[Browser].push(supportedBrowsers[Browser].y);
                } else {
                    min[Browser] = [-1];
                }
            } else {
                if (supportedBrowsers[Browser].y) {
                    min[Browser].push(supportedBrowsers[Browser].y);
                } else {
                    min[Browser] = [-1];
                }
            }
        }
    }
    for (const Browser in min) {
        if (!min.hasOwnProperty(Browser)) continue;
        min[Browser].sort((a,b) => b - a);
        min[Browser] = get(min, `${Browser}[0]`, -1);
        min[Browser] = min[Browser] === -1 ? Infinity : min[Browser];
    }

    fastify.addHook('preHandler', function (request, reply, done) {
        const useragent = request.headers["user-agent"];
        if (!useragent) return done();
        const { family, major, minor } = lookup(useragent);
        const BrowserVersion = parseFloat(`${major}.${minor}`);
        if (Number.isNaN(BrowserVersion)) return done();
        const allowedMin = min[UserAgentToCanIUseShit[family]] || -1;
        if (allowedMin === -1) return done();
        if (Number.isNaN(allowedMin)) return done();
        if (BrowserVersion < allowedMin) {
            if (actionType === "callback") {
                return whatShouldIdo(request, reply, done);
            } else {
                reply.redirect(whatShouldIdo);
            }
            return done();
        }
        done();
    });

    next()
}, {
    fastify: '^1.0.0-rc.1',
    name: "fastify-require-feature"
});