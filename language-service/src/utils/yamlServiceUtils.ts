import { getLineOffsets } from "./arrUtils";
import { TextDocument, Position } from "vscode-languageserver-types";

function is_EOL(c: number) {
    return (c === 0x0A/* LF */) || (c === 0x0D/* CR */);
}

export function completionHelper(document: TextDocument, textDocumentPosition: Position) {
    // Get the string we are looking at via a substring
    const lineNumber: number = textDocumentPosition.line;
    const lineOffsets: number[] = getLineOffsets(document.getText());
    const start: number = lineOffsets[lineNumber];  // Start of where the autocompletion is happening
    let end = 0;                                    // End of where the autocompletion is happening

    if (lineOffsets[lineNumber + 1] !== undefined) {
        end = lineOffsets[lineNumber + 1];
    } else {
        end = document.getText().length;
    }

    while (end - 1 >= 0 && is_EOL(document.getText().charCodeAt(end - 1))) {
        end--;
    }

    const textLine = document.getText().substring(start, end);

    // Check if the string we are looking at is a node
    if (textLine.indexOf(":") === -1) {
        // We need to add the ":" to load the nodes
        let newText = "";

        // This is for the empty line case
        const trimmedText = textLine.trim();
        if (trimmedText.length === 0 || (trimmedText.length === 1 && trimmedText[0] === '-')) {
            // Add a temp node that is in the document but we don't use at all.
            newText = document.getText().substring(0, start + textLine.length) + "h:\r\n" + document.getText().substr(lineOffsets[lineNumber + 1] || document.getText().length);
        } else {
            // Add a semicolon to the end of the current line so we can validate the node
            newText = document.getText().substring(0, start + textLine.length) + ":\r\n" + document.getText().substr(lineOffsets[lineNumber + 1] || document.getText().length);
        }

        return {
            newText,
            newPosition: textDocumentPosition,
        };

    } else {
        // All the nodes are loaded
        textDocumentPosition.character = textDocumentPosition.character - 1;
        return {
            newText: document.getText(),
            newPosition: textDocumentPosition,
        };
    }
}
