import React, { Component } from 'react';
import { Button, Text, TitleBar, Window } from 'react-desktop/macOs';
import './App.css';

function downloadCanvas(target, canvas, fileName) {
    return function() {
        document.getElementById(target).href = canvas
            .toDataURL('image/png')
            .replace(
                /^data:image\/[^;]*/,
                `data:application/octet-stream;headers=Content-Disposition%3A%20attachment%3B%20filename=${
                    fileName
                }.png`
            );
    };
}

export default class extends Component {
    constructor(props) {
        super(props);

        this.state = {
            imageLoaded: false,
            selectedFile: null,
        };
        this.fileSelector = null;
        this.originalCanvas = null;
        this.openPanorama = this.openPanorama.bind(this);
        this.setFileSelector = this.setFileSelector.bind(this);
    }

    openPanorama() {
        const { fileSelector } = this;
        if (fileSelector && document.createEvent) {
            const mouseEvent = document.createEvent('MouseEvents');
            mouseEvent.initEvent('click', true, false);
            fileSelector.dispatchEvent(mouseEvent);
        }
    }

    processPanorama() {
        const App = this;
        const { originalCanvas, state: { selectedFile } } = App;
        const originalImage = new Image();

        originalImage.onload = function() {
            const ctx = originalCanvas.getContext('2d');
            const { width, height } = originalImage;
            const cardPixels = width / 3;
            const heightOffset = Math.max(height / 2 - cardPixels, 0);

            originalCanvas.width = cardPixels * 3;
            originalCanvas.height = cardPixels;
            const { width: cWidth, height: cHeight } = originalCanvas;
            ctx.clearRect(0, 0, cWidth, cHeight);
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(
                originalImage,
                0,
                heightOffset,
                3 * cardPixels,
                cardPixels,
                0,
                0,
                cWidth,
                cHeight
            );
        };
        originalImage.src = URL.createObjectURL(selectedFile);
        console.log(selectedFile.width);
        App.setState({});
    }

    setFileSelector(element) {
        const App = this;
        this.fileSelector = element;
        element.onchange = function() {
            App.setState(
                {
                    imageLoaded: true,
                    selectedFile: this.files[0],
                },
                App.processPanorama
            );
        };
    }

    renderCrop() {
        const { originalCanvas, state: { imageLoaded, selectedFile } } = this;
        if (imageLoaded && selectedFile) {
            return (
                <div>
                    <div>
                        <canvas
                            ref={c => (this.originalCanvas = c)}
                            className="App-Window-original-canvas"
                        />
                        <a
                            onClick={downloadCanvas(
                                'downloadOriginal',
                                originalCanvas,
                                'original.png'
                            )}
                            id="downloadOriginal"
                        >
                            download
                        </a>
                    </div>
                    <div>
                        <canvas
                            ref={c => (this.firstCanvas = c)}
                            className="App-Window-card-canvas"
                        />
                        <canvas
                            ref={c => (this.secondCanvas = c)}
                            className="App-Window-card-canvas"
                        />
                        <canvas
                            ref={c => (this.thirdCanvas = c)}
                            className="App-Window-card-canvas"
                        />
                    </div>
                </div>
            );
        }
        return '';
    }

    render() {
        return (
            <div>
                <Window chrome height="300px" padding="10px" className="App-Window">
                    <TitleBar title="Instagram Panorama Creator" />
                    <Button
                        color="blue"
                        onClick={this.openPanorama}
                        className="App-Window__select-button"
                    >
                        Select Panorama
                    </Button>
                    <br />
                    <input
                        className="App-Window__hidden-item"
                        type="file"
                        ref={this.setFileSelector}
                    />
                    {this.renderCrop()}
                </Window>
            </div>
        );
    }
}
