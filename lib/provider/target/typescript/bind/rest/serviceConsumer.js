"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = require("../../helpers");
const typescript_1 = require("../../typescript");
const common_1 = require("./common");
function renderOperationsInterface(nschema, context, operations) {
    return Object.keys(operations)
        .map(op => {
        const operation = operations[op];
        const { inMessage, outMessage } = common_1.getOperationDetails(operation);
        return `
  /**
   *${common_1.addSpace((operation.description || "").replace(/\n/g, "\n   * "))}
${inMessage.data
            .map(par => {
            return `   * @param ${par.name} -${common_1.addSpace((par.description || "").replace(/\n/g, "\n   * "))}`;
        })
            .join("\n")}
   * @param $ctx - Operation context. Optional argument (The service always sends it but you may not implement it in your class)
   * @returns ${outMessage.data
            .map(d => {
            return (d.description || "").replace(/\n/g, "\n   * ");
        })
            .join(", ") || `{${typescript_1.messageType(nschema, context, false, outMessage)}}`}
   */
  ${op}(${inMessage.data
            .map((par, $i) => {
            return `${par.name}: ${typescript_1.default.typeName(par.type, nschema, "", "", context, true)}`;
        })
            .join(", ")}${inMessage.data.length ? `, ` : ``}$ctx: { request: Request, response: Response }): Promise<${typescript_1.messageType(nschema, context, true, outMessage)}>;`;
    })
        .join("\n");
}
function renderOperationsForClass(nschema, context, operations) {
    const protecteds = Object.keys(operations)
        .map(op => {
        const operation = operations[op];
        const { method, bodyArguments, headerArguments, inMessage, outMessage, route, routeArguments, queryArguments } = common_1.getOperationDetails(operation);
        return `
  /**
   *${common_1.addSpace((operation.description || "").replace(/\n/g, "\n   * "))}
${inMessage.data
            .map(par => {
            return `   * @param ${par.name} -${common_1.addSpace((par.description || "").replace(/\n/g, "\n   * "))}`;
        })
            .join("\n")}
   * @param $ctx - Operation context
   * @returns ${outMessage.data
            .map(d => {
            return (d.description || "").replace(/\n/g, "\n   * ");
        })
            .join(", ") || `{${typescript_1.messageType(nschema, context, false, outMessage)}}`}
   */
  public abstract async ${op}(${inMessage.data
            .map((par, $i) => {
            return `${par.name}: ${typescript_1.default.typeName(par.type, nschema, "", "", context, true)}`;
        })
            .join(", ")}${inMessage.data.length ? `, ` : ``}$ctx?: { request: Request, response: Response } /*: { request: Request, response: Response } */): Promise<${typescript_1.messageType(nschema, context, true, outMessage)}>;
`;
    })
        .join("\n");
    const abstracts = Object.keys(operations)
        .map(op => {
        const operation = operations[op];
        const { method, bodyArguments, headerArguments, inMessage, outMessage, route, routeArguments, queryArguments } = common_1.getOperationDetails(operation);
        return `
  /**
   * Raw operation. This is what the service actually calls.
   *${common_1.addSpace((operation.description || "").replace(/\n/g, "\n   * "))}
${inMessage.data
            .map(par => {
            return `   * @param ${par.name} -${common_1.addSpace((par.description || "").replace(/\n/g, "\n   * "))}`;
        })
            .join("\n")}
   * @returns ${outMessage.data
            .map(d => {
            return (d.description || "").replace(/\n/g, "\n   * ");
        })
            .join(", ") || `{${typescript_1.messageType(nschema, context, false, outMessage)}}`}
   */
  protected async $raw${op}(${inMessage.data
            .map((par, $i) => {
            return `${par.name}: ${typescript_1.default.typeName(par.type, nschema, "", "", context, true)}`;
        })
            .join(", ")}${inMessage.data.length ? `, ` : ``}$ctx?: { request: Request, response: Response } /*: { request: Request, response: Response } */): Promise<${typescript_1.messageType(nschema, context, true, outMessage)}> {
    this.emit("callStarted", { name: "${op}", timestamp: new Date() });
    const result = await this.${op}(${inMessage.data
            .map((par, $i) => {
            return `${par.name}`;
        })
            .join(", ")}${inMessage.data.length ? `, ` : ``}$ctx);
    this.emit("callCompleted", { name: "${op}", timestamp: new Date(), context: $ctx });
    return result;
  }`;
    })
        .join("\n");
    return `${protecteds}
${abstracts}`;
}
function renderConstructorForClass(nschema, context, config, operations) {
    return Object.keys(operations)
        .map(op => {
        const operation = operations[op];
        const { method, bodyArguments, headerArguments, inMessage, outMessage, route, routeArguments, queryArguments } = common_1.getOperationDetails(operation);
        return `    webserver.add($verbs.${common_1.getHttpVerb(operations[op].method || "get")}<${typescript_1.messageType(nschema, context, true, inMessage)}, ${typescript_1.messageType(nschema, context, true, outMessage)}>({
      route: '${route ||
            op.replace(/\{([^\}]+?)\}/g, (match, g1) => {
                return `:${g1}`;
            })}',
      //contentType: 'application/json',
      inputMap: (req: Request): ${typescript_1.messageType(nschema, context, true, inMessage)} => {
        const input: any = {};
${routeArguments
            .map(p => {
            return `      input${helpers_1.renderPropertyAccessor(p.name)} = ${common_1.realTypeMap(p, `req.params${helpers_1.renderPropertyAccessor(p.name)}`)};
`;
        })
            .join("")}${queryArguments.map(p => {
            return `        input${helpers_1.renderPropertyAccessor(p.name)} = ${common_1.realTypeMap(p, `req.query${helpers_1.renderPropertyAccessor(p.name)}`)};
        `;
        }).join(`,
        `)}${headerArguments.map(p => {
            return `input${helpers_1.renderPropertyAccessor(p.name)} = ${common_1.realTypeMap(p, `req.header('${p.headerName || `X-${p.name}`}')`)};`;
        }).join(`
        `)}${bodyArguments.length === 1
            ? `              input${helpers_1.renderPropertyAccessor(bodyArguments[0].name)} = req.body;`
            : `${bodyArguments.length
                ? `${bodyArguments.map((p, idx) => {
                    return `input${helpers_1.renderPropertyAccessor(p.name)} = req.body[${idx}];
`;
                }).join(`
            `)}`
                : ``}`}

            const result = input as ${typescript_1.messageType(nschema, context, true, inMessage)};
                return result;
            }
        }, (input: ${typescript_1.messageType(nschema, context, true, inMessage)}, request: Request, response: Response) => {
            return this.$raw${op}(${inMessage.data.length === 1
            ? "input, "
            : inMessage.data
                .map(p => {
                return `input${helpers_1.renderPropertyAccessor(p.name)}, `;
            })
                .join("")} {request, response})
                .catch(
                    (e: ResponseError) => {
                        response.statusMessage = e.message;
                        response.status(e.statusCode || 500);
                        this.emit('operationError', { name: '${op}', timestamp: new Date(), error: e, response: response });
                        return undefined;
                    });
        })${config.routePrefix ? `, "${config.routePrefix}"` : ``});`;
    })
        .join("\n");
}
function render(nschema, context, config, target) {
    if (!context.imports["{events}"]) {
        context.imports["{events}"] = {};
    }
    context.imports["{events}"].EventEmitter = true;
    if (!context.imports["{ninejs/modules/ninejs-server}"]) {
        context.imports["{ninejs/modules/ninejs-server}"] = {};
    }
    context.imports["{ninejs/modules/ninejs-server}"].NineJs = true;
    if (!context.imports["{ninejs/modules/webserver/WebServer}"]) {
        context.imports["{ninejs/modules/webserver/WebServer}"] = {};
    }
    context.imports["{ninejs/modules/webserver/WebServer}"].default = "WebServer";
    context.imports["{ninejs/modules/webserver/WebServer}"].Request = true;
    context.imports["{ninejs/modules/webserver/WebServer}"].Response = true;
    context.imports["{ninejs/modules/webserver/WebServer}"].ResponseError = true;
    if (!context.imports["{ninejs/modules/webserver/Rest}"]) {
        context.imports["{ninejs/modules/webserver/Rest}"] = {};
    }
    context.imports["{ninejs/modules/webserver/Rest}"]["*"] = "$verbs";
    context.imports["{ninejs/modules/webserver/Rest}"].get = true;
    context.imports["{ninejs/modules/webserver/Rest}"].post = true;
    return `export interface ${config.name} {
${renderOperationsInterface(nschema, context, config.operations)}
  on(eventName: "callStarted", handler: (eventData: { name: string, timestamp: Date }) => any): this;
  on(eventName: "callCompleted", handler: (eventData: { name: string, timestamp: Date, result: any }) => any): this;
  on(eventName: "operationError", handler: (eventData: { name: string, timestamp: Date, error: Error }) => any): this;
  on(eventName: string, handler: () => any): this;
}

export abstract class ${config.name}Base extends EventEmitter implements ${config.name} {

  constructor(private config: any, ninejs: NineJs, webserver: WebServer) {
    super();
${renderConstructorForClass(nschema, context, config, config.operations)}
  }
${renderOperationsForClass(nschema, context, config.operations)}
}
`;
}
exports.render = render;
//# sourceMappingURL=serviceConsumer.js.map