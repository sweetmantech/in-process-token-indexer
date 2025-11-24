"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabase = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const consts_js_1 = require("../consts.js");
if (!consts_js_1.SUPABASE_URL || !consts_js_1.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variable');
}
exports.supabase = (0, supabase_js_1.createClient)(consts_js_1.SUPABASE_URL, consts_js_1.SUPABASE_SERVICE_ROLE_KEY);
