import RNFS from 'react-native-fs';
import { getDocument } from "pdfjs-dist"

export async function searchWord(path: string, word: string) {
    const data = await RNFS.readFile(path, 'base64');
    const pdf = await getDocument({ data: Buffer.from(data, 'base64') }).promise;

    const results: { page: number; rects: any[] }[] = [];

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const content = await page.getTextContent();

        const matches: any[] = [];

        for (const item of content.items as any[]) {
            const text = item.str;
            if (!text) continue;

            const index = text.toLowerCase().indexOf(word.toLowerCase());
            if (index !== -1) {
                matches.push({
                    x: item.transform[4],
                    y: item.transform[5],
                    width: item.width,
                    height: item.height
                });
            }
        }

        if (matches.length > 0) {
            results.push({ page: pageNum, rects: matches });
        }
    }

    return results;
}
