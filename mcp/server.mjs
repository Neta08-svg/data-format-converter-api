#!/usr/bin/env node
// formatforge MCP server — exposes the live https://data.wrapper-agency.com API as
// MCP tools so agents can call it natively. Thin wrapper over /api/v1.
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const BASE = process.env.FORMATFORGE_BASE || "https://data.wrapper-agency.com";
const server = new McpServer({ name: 'formatforge', version: "1.0.0" });

server.registerTool(
  'convert_format',
  {
    description: 'Convert structured data between JSON, CSV, TSV, YAML and XML.',
    inputSchema: {
      data: z.string().describe('The input payload to convert'),
      from: z.string().describe('Source format: json, csv, tsv, yaml, xml'),
      to: z.string().describe('Target format: json, csv, tsv, yaml, xml')
    },
  },
  async (args) => {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(args)) {
      if (v !== undefined && v !== null && v !== "") qs.set(k, String(v));
    }
    const r = await fetch(`${BASE}/api/v1/convert?${qs.toString()}`);
    return { content: [{ type: "text", text: await r.text() }] };
  }
);

await server.connect(new StdioServerTransport());
