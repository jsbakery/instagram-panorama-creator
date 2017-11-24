export function convertCanvasToDataURL(canvas) {
    try {
        return canvas.toDataURL('image/png');
    } catch (e) {
        console.error(e);
    }
}
