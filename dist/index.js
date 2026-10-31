#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const api_1 = require("./api");
const server = new index_js_1.Server({
    name: "superteam-earn-mcp",
    version: "1.0.0",
}, {
    capabilities: {
        tools: {},
        resources: {},
        prompts: {},
    },
});
// 1. Tool Definitions
server.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "search_listings",
                description: "Filter and browse active bounties, projects, and hackathons on Superteam Earn by type, skill, region, and reward.",
                inputSchema: {
                    type: "object",
                    properties: {
                        type: {
                            type: "string",
                            enum: ["bounty", "project", "hackathon", "all"],
                            description: "Listing type to filter",
                        },
                        minReward: {
                            type: "number",
                            description: "Minimum reward threshold in USD/USDC",
                        },
                        skill: {
                            type: "string",
                            description: "Relevant skill (e.g. Rust, Frontend, Content, Python)",
                        },
                        region: {
                            type: "string",
                            description: "Geographic chapter/region restriction (e.g. Vietnam, Global, India)",
                        },
                        status: {
                            type: "string",
                            enum: ["OPEN", "ALL"],
                            description: "Listing status filter",
                        },
                    },
                },
            },
            {
                name: "get_listing",
                description: "Retrieve comprehensive details, eligibility criteria, sponsor data, and questions for a specific listing slug.",
                inputSchema: {
                    type: "object",
                    properties: {
                        slug: {
                            type: "string",
                            description: "The listing slug (e.g. 'chimp-on-metaplex')",
                        },
                    },
                    required: ["slug"],
                },
            },
            {
                name: "list_grants",
                description: "Fetch all active grants and acceleration funds on Superteam Earn.",
                inputSchema: {
                    type: "object",
                    properties: {},
                },
            },
            {
                name: "search",
                description: "Perform global free-text search across all listings, bounties, and grants on Superteam Earn.",
                inputSchema: {
                    type: "object",
                    properties: {
                        query: {
                            type: "string",
                            description: "Search keywords (e.g. 'DeFi', 'Solana agent', 'Telegram')",
                        },
                    },
                    required: ["query"],
                },
            },
            {
                name: "register_agent",
                description: "Register an autonomous AI agent on Superteam Earn to receive an Agent API key and claim code.",
                inputSchema: {
                    type: "object",
                    properties: {
                        name: { type: "string", description: "Agent identifier" },
                        description: { type: "string", description: "Capability summary" },
                        skills: {
                            type: "array",
                            items: { type: "string" },
                            description: "Skills supported by agent",
                        },
                    },
                    required: ["name", "description"],
                },
            },
            {
                name: "submit_work",
                description: "Submit completed work URL and metadata for an agent-eligible Superteam Earn listing.",
                inputSchema: {
                    type: "object",
                    properties: {
                        apiKey: { type: "string", description: "Earn Agent API Key" },
                        listingId: { type: "string", description: "Target listing ID" },
                        submissionUrl: { type: "string", description: "Public repository or proof link" },
                        otherInfo: { type: "string", description: "Optional execution notes or transcript" },
                    },
                    required: ["apiKey", "listingId", "submissionUrl"],
                },
            },
        ],
    };
});
// 2. Tool Execution
server.setRequestHandler(types_js_1.CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
        switch (name) {
            case "search_listings": {
                const results = await (0, api_1.fetchLiveListings)(args);
                return {
                    content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
                };
            }
            case "get_listing": {
                const slug = String(args?.slug || "");
                const details = await (0, api_1.fetchListingDetails)(slug);
                return {
                    content: [{ type: "text", text: JSON.stringify(details, null, 2) }],
                };
            }
            case "list_grants": {
                const grants = await (0, api_1.fetchLiveGrants)();
                return {
                    content: [{ type: "text", text: JSON.stringify(grants, null, 2) }],
                };
            }
            case "search": {
                const q = String(args?.query || "");
                const res = await (0, api_1.searchListings)(q);
                return {
                    content: [{ type: "text", text: JSON.stringify(res, null, 2) }],
                };
            }
            case "register_agent": {
                const reg = await (0, api_1.registerAgent)(args);
                return {
                    content: [{ type: "text", text: JSON.stringify(reg, null, 2) }],
                };
            }
            case "submit_work": {
                const { apiKey, listingId, submissionUrl, otherInfo } = args;
                const sub = await (0, api_1.submitAgentWork)(apiKey, { listingId, submissionUrl, otherInfo });
                return {
                    content: [{ type: "text", text: JSON.stringify(sub, null, 2) }],
                };
            }
            default:
                throw new Error(`Unknown tool: ${name}`);
        }
    }
    catch (error) {
        return {
            isError: true,
            content: [{ type: "text", text: `Tool error: ${error.message}` }],
        };
    }
});
// 3. Resources Definition
server.setRequestHandler(types_js_1.ListResourcesRequestSchema, async () => {
    return {
        resources: [
            {
                uri: "superteam://rules/skill.md",
                name: "Superteam Earn Agent Skill Guidelines",
                mimeType: "text/markdown",
                description: "Official rules and code of conduct for AI agents building and earning on Superteam Earn.",
            },
            {
                uri: "superteam://rules/heartbeat.md",
                name: "Agent Keep-Alive Heartbeat Specification",
                mimeType: "text/markdown",
                description: "Heartbeat protocol for active registered agents.",
            },
        ],
    };
});
server.setRequestHandler(types_js_1.ReadResourceRequestSchema, async (request) => {
    const { uri } = request.params;
    if (uri === "superteam://rules/skill.md") {
        return {
            contents: [
                {
                    uri,
                    mimeType: "text/markdown",
                    text: `# Superteam Earn Agent Guidelines
- Autonomous builders must provide verifiable proof of work (GitHub / deployment links).
- Respect local fee markets, human-in-the-loop validation, and anti-plagiarism standards.
- Payouts route securely to verified Solana wallets.`,
                },
            ],
        };
    }
    if (uri === "superteam://rules/heartbeat.md") {
        return {
            contents: [
                {
                    uri,
                    mimeType: "text/markdown",
                    text: `# Superteam Earn Heartbeat Protocol
Ping /api/agents/status periodically to preserve active status.`,
                },
            ],
        };
    }
    throw new Error(`Resource not found: ${uri}`);
});
// 4. Prompts Definition
server.setRequestHandler(types_js_1.ListPromptsRequestSchema, async () => {
    return {
        prompts: [
            {
                name: "draft_submission",
                description: "Interactive prompt assisting builders and agents in drafting clean, high-impact submission proposals for a target listing.",
            },
        ],
    };
});
server.setRequestHandler(types_js_1.GetPromptRequestSchema, async (request) => {
    if (request.params.name === "draft_submission") {
        return {
            description: "Draft a Superteam Earn submission proposal",
            messages: [
                {
                    role: "user",
                    content: {
                        type: "text",
                        text: "Analyze the listing requirements, format a crisp technical proposal, cite reproducible benchmarks/proofs, and ensure Solana wallet validation.",
                    },
                },
            ],
        };
    }
    throw new Error(`Prompt not found: ${request.params.name}`);
});
async function run() {
    const transport = new stdio_js_1.StdioServerTransport();
    await server.connect(transport);
    console.error("🚀 Superteam Earn MCP Server running on stdio transport.");
}
run().catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
});
