const express = require('express');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());  // Enable CORS

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// Function to split text into multiple lines
function splitText(text, maxLength) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    words.forEach((word) => {
        if ((currentLine + word).length <= maxLength) {
            currentLine += (currentLine === '' ? '' : ' ') + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    });

    if (currentLine) {
        lines.push(currentLine);
    }

    return lines;
}

// Function to adapt font size based on text length
function getAdaptedFontSize(text, cellSize) {
    const baseFontSize = 16;  // Default font size
    const maxLength = 10;  // Max number of characters that can fit comfortably in a cell

    if (text.length <= maxLength) {
        return baseFontSize;  // Keep the default font size for short text
    }

    // Reduce font size proportionally for longer text
    return Math.max(baseFontSize * (maxLength / text.length), 10);  // Minimum font size of 10
}

// Endpoint for generating PDF
app.post('/generate-pdf', async (req, res) => {
    try {
        const { gridSize, items } = req.body;

        // Create a new PDF document
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([500, 500]);  // Adjust the page size as needed
        const { width, height } = page.getSize();  // Get page dimensions
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);  // Embed standard font

        const cellSize = 100;  // Size of each cell
        const padding = 10;    // Padding inside each cell
        const startX = (width - (cellSize * gridSize)) / 2;  // Center the grid horizontally
        const startY = height - (cellSize * gridSize) - 50;  // Offset vertically for better alignment

        // Set default font color
        const textColor = rgb(0, 0, 0);  // Black text

        // Calculate the middle index for "FREE SPACE"
        const middleIndex = Math.floor(gridSize / 2);

        // Draw the grid and text
        let x, y;
        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                const index = row * gridSize + col;

                // Calculate the position of the current cell
                x = startX + col * cellSize;
                y = startY + (gridSize - row - 0.5) * cellSize;  // Adjusted y-coordinate

                // Draw the cell border
                page.drawRectangle({
                    x, 
                    y,
                    width: cellSize,
                    height: cellSize,
                    borderWidth: 2,
                    borderColor: rgb(0, 0, 0),  // Black border color
                    color: rgb(1, 1, 1)  // Optional: Cell background color (white)
                });

                // If this is the center cell, write "FREE SPACE"
                if (row === middleIndex && col === middleIndex) {
                    const lines = ['FREE', 'SPACE'];  // Predefined lines

                    // Calculate the start position for vertical centering
                    const lineHeight = 18;  // Set line height for spacing
                    const totalTextHeight = lines.length * lineHeight;  // Total height for both lines
                    const textY = y + (cellSize / 2);  // Center vertically in the cell
                    const textX = x + (cellSize / 2);  // Center horizontally

                    // Draw each line of the text for "FREE SPACE"
                    lines.forEach((line, i) => {
                        const lineY = textY - i * lineHeight;  // Adjust for each line's height
                        const textWidth = font.widthOfTextAtSize(line, 16);  // Get text width to center it
                        const lineX = textX - (textWidth / 2);  // Center the line

                        // Draw each line of the text
                        page.drawText(line, {
                            x: lineX,
                            y: lineY,
                            size: 16,  // Font size for "FREE SPACE"
                            color: textColor,
                            font,
                        });
                    });
                } else {
                    // Calculate text position and adapt font size for other cells
                    const item = items[index] || '';  // Get the item or leave empty if none
                    const adaptedFontSize = getAdaptedFontSize(item, cellSize);

                    // Split long text into multiple lines
                    const lines = splitText(item, Math.floor(cellSize / adaptedFontSize * 1.5));  // Approx. fit lines in cell width
                    const lineHeight = adaptedFontSize + 2;  // Spacing between lines

                    // Calculate where to start drawing the text (center vertically)
                    const textY = y + cellSize / 2 + (lines.length * lineHeight) / 2 - lineHeight;  // Center vertically in the cell

                    lines.forEach((line, i) => {
                        const textX = x + (cellSize / 2) - (font.widthOfTextAtSize(line, adaptedFontSize) / 2);  // Center text horizontally
                        const lineY = textY - i * lineHeight;  // Move down for each line

                        // Draw each line of the text
                        page.drawText(line, {
                            x: textX,
                            y: lineY,
                            size: adaptedFontSize,
                            color: textColor,
                            font,
                        });
                    });
                }
            }
        }

        // Serialize the PDF to bytes (ArrayBuffer)
        const pdfBytes = await pdfDoc.save();

        // Set proper headers for binary response
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="bingo.pdf"');
        res.send(Buffer.from(pdfBytes));  // Send binary data
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).send('Failed to generate PDF');
    }
});

// Start server
app.listen(3000, () => {
    console.log('Server running on port 3000');
});
