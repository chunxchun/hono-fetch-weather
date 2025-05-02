import Handlebars from "handlebars";

export const genHTML = async (content: string) => {
    try {
        const html = await Handlebars.compile({ content })
        console.log('Generate HTML success');
        return html;
    } catch (err) {
        throw new Error("Error generating HTML:" + err);
    }
}
