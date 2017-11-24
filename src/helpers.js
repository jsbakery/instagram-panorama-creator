export function convertCanvasToDataURL(canvas) {
    try {
        return canvas.toDataURL('image/png');
    } catch (e) {
        console.error(e);
    }
}

export function convertCanvasToBlob(canvas) {
    try {
        return new Promise(resolve => canvas.toBlob(blob => resolve(URL.createObjectURL(blob))));
    } catch (e) {
        console.error(e);
    }
}