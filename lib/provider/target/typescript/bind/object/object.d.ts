import { NSchemaInterface } from "../../../../../model";
import { TypeScript } from "../../typescript";
export declare class NObject {
    typescript: TypeScript | undefined;
    init(nschema: NSchemaInterface): Promise<boolean>;
}
declare const obj: NObject;
export default obj;
