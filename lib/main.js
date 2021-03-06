"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
const compare_versions_1 = __importDefault(require("compare-versions"));
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        const { repo, payload, issue } = github.context;
        if (payload.action !== 'opened') {
            console.log('No issue or PR was opened, skipping');
            return;
        }
        // Do nothing if its not a pr or issue
        const isIssue = !!payload.issue;
        const isPR = !!payload.pull_request;
        if (!isIssue && !isPR) {
            console.log('The event that triggered this action was not a pull request or issue, skipping.');
            return;
        }
        // Get client and context
        const client = new github.GitHub(core.getInput('github-token', { required: true }));
        const milestones = yield client.issues.listMilestonesForRepo(Object.assign(Object.assign({}, repo), { state: 'open' }));
        if (milestones.data.length === 0) {
            console.log('There are no milestones, skipping.');
            return;
        }
        const sortedMilestones = milestones.data.sort((a, b) => {
            return compare_versions_1.default(a.title, b.title);
        });
        const smallestVersion = sortedMilestones[0];
        yield client.issues.update(Object.assign(Object.assign({}, repo), { issue_number: issue.number, milestone: smallestVersion.number }));
        core.setOutput('milestone', smallestVersion);
    });
}
run().catch(err => {
    core.setFailed(err.message);
});
