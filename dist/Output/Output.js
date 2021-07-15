"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Output = void 0;
const HtmlGenerator_1 = require("./HtmlGenerator");
class Output {
    constructor() {
        this.html = new HtmlGenerator_1.HtmlGenerator();
    }
    Log(data) {
        console.log(data);
    }
    LogTable(table, sep = "|") {
        var _a, _b;
        const output_table = this.html.Table();
        for (let table_row of table) {
            const output_row = this.html.Tr();
            for (let j = 0; j < table_row.length; j++) {
                let msg = ` ${table_row[j]} ${sep}`;
                if (j === 0) {
                    msg = `${sep}${msg}`;
                }
                const output_col = this.html.Th(msg);
                (_a = output_row.body) === null || _a === void 0 ? void 0 : _a.push(output_col);
            }
            (_b = output_table.body) === null || _b === void 0 ? void 0 : _b.push(output_row);
        }
        this.html.AddToBody(output_table);
        console.log(this.html.GetOutput());
    }
}
exports.Output = Output;
