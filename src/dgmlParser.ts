import * as xml2js from 'xml2js';
import { Dgml } from './dgml';

export class DgmlParser {
    public async parse(contents: string): Promise<Dgml> {
        return xml2js.parseStringPromise(contents);
    }
}
