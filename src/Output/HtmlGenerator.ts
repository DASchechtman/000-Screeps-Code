import { HtmlElement } from "../CompilerTyping/Interfaces";

export class HtmlGenerator {
    private readonly html: HtmlElement
    private readonly head_index: number
    private readonly body_index: number

    constructor() {
        const head: HtmlElement = {
            open_tag: "<head>",
            close_tag: "</head>",
            body: new Array()
        }

        const body: HtmlElement = {
            open_tag: "<body>",
            close_tag: "</body>",
            body: new Array()
        }

        this.html = {
            open_tag: "<html>",
            close_tag: "</html>",
            body: [head, body]
        }

        this.head_index = 0
        this.body_index = 1
    }

    private Add(index: number, element: HtmlElement) {
        const body = this.html.body!!
        body[index].body?.push(element)
    }

    private DataToEl(data: any): HtmlElement {
        if ((data as HtmlElement).open_tag === undefined) {
            data = this.P(data)
        }
        return data
    }

    private Parse(context: HtmlGenerator, element: HtmlElement): string {
        let output = ""
        if (element.body) {
            output += element.open_tag
            for (let child of element.body) {
                output += context.Parse(context, child)
            }
            output += element.close_tag
        }
        else if (element.text){
            output = `${element.open_tag}${element.text}${element.close_tag}`
        }
        return output
    }

    P(data: any): HtmlElement {
        return {
            open_tag: "<p>",
            close_tag: "</p>",
            body: null,
            text: `${data}`
        }
    }

    Table(): HtmlElement {
        return {
            open_tag: "<table>",
            close_tag: "</table>",
            body: new Array()
        }
    }

    Tr(): HtmlElement {
        return {
            open_tag: "<tr>",
            close_tag: "</tr>",
            body: new Array()
        }
    }

    Th(data: HtmlElement | any): HtmlElement {
        let th: HtmlElement

        if ((data as HtmlElement).open_tag !== undefined) {
            th = {
                open_tag: "<th>",
                close_tag: "</th>",
                body: [data]
            }
        }
        else {
            th = {
                open_tag: "<th>",
                close_tag: "</th>",
                body: null,
                text: `${data}`
            }
        }

        return th
    }

    AddToBody(data: HtmlElement | any) {
        data = this.DataToEl(data)
        this.Add(this.body_index, data)
    }

    AddToHead(data: HtmlElement | any) {
        data = this.DataToEl(data)
        this.Add(this.head_index, data)
    }

    GetOutput() {
        const html_output = this.html
        const head_num = this.head_index
        const body_num = this.body_index

        const head = this.Parse(this, html_output.body!![head_num])
        const body = this.Parse(this, html_output.body!![body_num])

        const full_output =  `${html_output.open_tag}${head}${body}${html_output.close_tag}`
        return full_output
    } 
}