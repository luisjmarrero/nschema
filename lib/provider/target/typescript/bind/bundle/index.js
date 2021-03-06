"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chalk = require("chalk");
const path_1 = require("path");
const __1 = require("../..");
const logging_1 = require("../../../../../logging");
const utils_1 = require("../../../../../utils");
const helpers_1 = require("../../helpers");
const rest_1 = require("../rest");
const { yellow, blue, green } = chalk;
function computeBundleImportMatrix(arr, localNamespace, namespaceMapping) {
    const rootContext = Object.assign(Object.assign({}, __1.buildTypeScriptContext()), { skipWrite: true });
    arr.forEach((item) => {
        Object.keys(item.imports).forEach((importName) => {
            if (!rootContext.imports[importName]) {
                rootContext.imports[importName] = {};
            }
            const namespace = item.imports[importName];
            Object.keys(namespace).forEach((name) => {
                rootContext.imports[importName][name] = item.imports[importName][name];
            });
        });
    });
    return helpers_1.computeImportMatrix(localNamespace, namespaceMapping, rootContext);
}
async function execute(parentConfig, nschema) {
    if (parentConfig.type !== "bundle") {
        throw new Error("Invalid bundle task");
    }
    if (!parentConfig.target) {
        throw new Error("Invalid TypeScript bundle task");
    }
    const parentConfigAny = parentConfig;
    const config = utils_1.updateNamespace(Object.assign(Object.assign({}, parentConfig), { $fileName: parentConfigAny.$fileName }));
    const target = parentConfig.target[0];
    const namespaceMapping = target.$namespaceMapping || {};
    const newTarget = rest_1.checkAndFixTarget(target, namespaceMapping);
    const arr = parentConfig.list || [];
    const waitables = arr.map(async (cur) => {
        logging_1.writeDebugLog(`bundle - ts - generating ${cur.type} ${cur.namespace || ""} :: ${cur.name}`);
        return await nschema.generate(parentConfig, cur, { skipWrite: true });
    });
    const dblarr = await Promise.all(waitables);
    const reducedArr = dblarr.reduce((acc, next) => {
        if (nschema.isArray(next)) {
            return acc.concat(next.filter((item) => {
                return item && item.generated && item.context;
            }));
        }
        else {
            if (next && next.generated) {
                return acc.concat([next]);
            }
            else {
                return acc;
            }
        }
    }, []);
    const results = reducedArr.map((item) => {
        return item.generated;
    });
    if (!results.length) {
        return Promise.resolve(false);
    }
    let result = results.join("\n");
    const imports = computeBundleImportMatrix(reducedArr.map((item) => item.context), config.namespace || "", namespaceMapping);
    result = `${newTarget.$header
        ? `/* ${newTarget.$header} */
`
        : ""}${imports
        ? `
${imports}`
        : ""}${result}`;
    result = __1.formatCode(result);
    const location = newTarget.location;
    const filepath = location.startsWith(".")
        ? path_1.resolve(process.cwd(), location, newTarget.$fileName || config.$fileName || `${config.namespace}.ts`)
        : path_1.resolve(location, newTarget.$fileName || config.$fileName || `${config.namespace}.ts`);
    logging_1.writeLog(logging_1.LogLevel.Default, `${yellow("bundle")}: ts - ${blue("writing")} to file: ${green(filepath)}`);
    return nschema.writeFile(filepath, result).then(undefined, (err) => {
        logging_1.writeError("error: ");
        logging_1.writeError(JSON.stringify(err, null, 2));
    });
}
const bundle = {
    description: "Handles the concept of namespacing (TypeScript only) in the generation process",
    execute,
    language: "typescript",
    name: "bundle-typescript-objects",
    serviceType: "*",
    type: "*",
    bind(bindName) {
        return bindName !== "rest-serverless";
    }
};
const exportable = {
    async init(nschema) {
        return nschema.register("customBundle", bundle);
    }
};
exports.default = exportable;
