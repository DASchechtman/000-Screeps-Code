import { HtmlGenerator } from "./HtmlGenerator"

export class Output {
    
    private html: HtmlGenerator

    constructor() {
        this.html = new HtmlGenerator()
    }
    
    Log(data: any): void {
        console.log(data)
    }

    LogTable(table: Array<Array<any>>, sep: string = "|"): void {
        const output_table = this.html.Table()

        for (let table_row of table) {
            const output_row = this.html.Tr()
            for (let j = 0; j < table_row.length; j++) {
               let msg = ` ${table_row[j]} ${sep}`
               if (j === 0) {
                   msg = `${sep}${msg}`
               }
               const output_col = this.html.Th(msg)
               output_row.body?.push(output_col)
            }
            output_table.body?.push(output_row)
        }

        this.html.AddToBody(output_table)
        console.log(this.html.GetOutput())
    }
}