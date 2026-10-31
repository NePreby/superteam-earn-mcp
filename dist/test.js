"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_assert_1 = __importDefault(require("node:assert"));
const node_test_1 = __importDefault(require("node:test"));
const api_1 = require("./api");
(0, node_test_1.default)("fetchLiveListings retrieves listings with valid schema", async () => {
    const listings = await (0, api_1.fetchLiveListings)({ minReward: 100 });
    node_assert_1.default.ok(Array.isArray(listings));
    node_assert_1.default.ok(listings.length > 0);
    const first = listings[0];
    node_assert_1.default.ok(first.title);
    node_assert_1.default.ok(first.slug);
});
(0, node_test_1.default)("fetchLiveGrants retrieves active grant programs", async () => {
    const grants = await (0, api_1.fetchLiveGrants)();
    node_assert_1.default.ok(Array.isArray(grants));
    node_assert_1.default.ok(grants.length > 0);
    const grant = grants[0];
    node_assert_1.default.ok(grant.title);
    node_assert_1.default.ok(grant.slug);
});
