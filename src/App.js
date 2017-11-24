import React, { Component } from 'react';
import { Button, TitleBar, Window } from 'react-desktop/macOs';
import './App.css';
import { convertCanvasToDataURL } from './helpers';

export default class extends Component {
    constructor(props) {
        super(props);

        this.state = {
            firstHref: null,
            secondHref: null,
            thirdHref: null,
            imageLoaded: false,
        };
        this.openPanorama = this.openPanorama.bind(this);
        this.processPanorama = this.processPanorama.bind(this);
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
        const { firstCanvas, secondCanvas, thirdCanvas, selectedFile } = App;
        const originalImage = new Image();

        originalImage.onload = function () {
            const { width, height } = originalImage;
            const cardPixels = width / 3;
            const heightOffset = Math.max(height / 2 - cardPixels, 0);

            const cardcWidth = (firstCanvas.width = secondCanvas.width = thirdCanvas.width = cardPixels);
            const cardcHeight = (firstCanvas.height = secondCanvas.height = thirdCanvas.height = cardPixels);

            const firstCtx = firstCanvas.getContext('2d');
            const secondCtx = secondCanvas.getContext('2d');
            const thirdCtx = thirdCanvas.getContext('2d');

            firstCtx.clearRect(0, 0, cardcWidth, cardcHeight);
            secondCtx.clearRect(0, 0, cardcWidth, cardcHeight);
            thirdCtx.clearRect(0, 0, cardcWidth, cardcHeight);
            firstCtx.imageSmoothingQuality = secondCtx.imageSmoothingQuality = thirdCtx.imageSmoothingQuality =
                'high';

            [
                {
                    ctx: firstCtx,
                    xOffset: 0,
                },
                {
                    ctx: secondCtx,
                    xOffset: cardPixels,
                },
                {
                    ctx: thirdCtx,
                    xOffset: 2 * cardPixels,
                },
            ].forEach(({ ctx, xOffset }) => {
                ctx.drawImage(
                    originalImage,
                    xOffset,
                    heightOffset,
                    cardPixels,
                    cardPixels,
                    0,
                    0,
                    cardcWidth,
                    cardcHeight,
                );
            });

            const firstHref = convertCanvasToDataURL(firstCanvas, 'original');
            const secondHref = convertCanvasToDataURL(secondCanvas, 'original');
            const thirdHref = convertCanvasToDataURL(thirdCanvas, 'original');
            App.setState({
                firstHref,
                secondHref,
                thirdHref,
            });
        };
        originalImage.src = URL.createObjectURL(selectedFile);
    }

    setFileSelector(element) {
        const App = this;
        this.fileSelector = element;
        element.onchange = function () {
            App.selectedFile = this.files[0];
            App.setState(
                {
                    imageLoaded: true,
                    originalHref: '#',
                },
                App.processPanorama,
            );
        };
    }

    renderCrop() {
        const { imageLoaded, firstHref, secondHref, thirdHref } = this.state;
        if (imageLoaded) {
            return (
                <div className="App-Window-main-pane">
                    <img src={firstHref} className="App-Window-card-canvas" alt=""/>
                    <img src={secondHref} className="App-Window-card-canvas" alt=""/>
                    <img src={thirdHref} className="App-Window-card-canvas" alt=""/>
                    <div className="App-Window__hidden-item">
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
                <Window chrome height="550px" padding="10px" className="App-Window">
                    <TitleBar title="Instagram Panorama Creator"/>
                    <div className="App-Window-side-pane">
                        <Button
                            color="blue"
                            onClick={this.openPanorama}
                            className="App-Window__select-button"
                        >
                            Select Panorama
                        </Button>
                        <input
                            className="App-Window__hidden-item"
                            type="file"
                            ref={this.setFileSelector}
                        />
                    </div>
                    {this.renderCrop()}
                </Window>
            </div>
        );
    }
}
