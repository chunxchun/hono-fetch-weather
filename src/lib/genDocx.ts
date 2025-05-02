import { Document, ImageRun, Packer, Paragraph, Tab, Table, TableCell, TableRow, TextRun } from "docx";

import { getR2ImageHandler } from "../handlers/getImageHandler";
import { Context } from "hono";

const createTableCell = async (text: string, image: Buffer) => {
    return new TableCell({
        children: [
            new Paragraph({
                text: text,
                children: [
                    new ImageRun({
                        data: image,
                        type: 'png',
                        transformation: { width: 300, height: 300 }
                    })
                ]
            }),
        ]
    })
}
const create2x2Table = async (c: Context) => {
    const table = new Table({
        rows: [
            new TableRow({
                children: [
                    await createTableCell('1', Buffer.from(await getR2ImageHandler('sc', c))),
                    await createTableCell('2', Buffer.from(await getR2ImageHandler('sc', c)))
                ]
            })
        ]
    })
    return table;
}

export const generateDocx = async (data: string, c: Context) => {
    try {
        const doc = new Document({
            sections: [
                {
                    properties: {},
                    children: [
                        new Table({
                            rows: [
                                new TableRow({
                                    children: [
                                        await createTableCell('1', Buffer.from(await getR2ImageHandler('sc', c))),
                                        await createTableCell('2', Buffer.from(await getR2ImageHandler('sc', c)))
                                    ]
                                })
                            ]
                        }),
                        new Paragraph({
                            children: [
                                new TextRun("Hello World"),
                                new TextRun({
                                    text: "Foo Bar",
                                    bold: true,
                                    size: 40,
                                }),
                                new TextRun({
                                    children: [new Tab(), "Github is the best"],
                                    bold: true,
                                }),
                            ],
                        }),
                    ],
                },
            ],
        });

        const buffer = await Packer.toBuffer(doc);
        return buffer;
    } catch (error) {
        throw error;

    }
}
