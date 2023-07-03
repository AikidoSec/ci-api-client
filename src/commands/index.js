/*
Each Command should export an object with at least one key: 'cliSetup' for
the command to be automatically loaded into the commander instance
*/

import apiKey from './apiKey.js';
import scan from './scan.js';
import upload from './upload.js';

export default { apiKey, scan, upload };
