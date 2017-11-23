export function convertCanvasToDataURL(canvas) {
    try {
        return canvas
            .toDataURL('image/png')
            /*.replace(
                /^data:image\/[^;]*!/,
                'data:application/octet-stream'
            )*/;
    } catch(e) {
        console.error(e);
    }
}
