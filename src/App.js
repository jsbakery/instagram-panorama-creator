import React, { Component } from 'react';
import { Button, TitleBar, Window, Text, ProgressCircle } from 'react-desktop/macOs';
import './App.css';
import { convertCanvasToBlob } from './helpers';

export default class extends Component {
    constructor(props) {
        super(props);

        this.state = {
            firstHref: null,
            secondHref: null,
            thirdHref: null,
            imageLoaded: false,
            heightPanDiff: 0,
            isLoading: false,
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
        const {
            firstCanvas,
            secondCanvas,
            thirdCanvas,
            selectedFile,
            state: { heightPanDiff },
        } = App;
        const originalImage = new Image();

        originalImage.onload = function() {
            const { width, height } = originalImage;
            const cardPixels = Math.min(width / 3, height);
            const heightOffset = Math.min(
                Math.max(height / 2 - cardPixels / 2 + heightPanDiff, 0),
                height - cardPixels
            );
            const widthOffset = (width - 3 * cardPixels) / 2;

            const cardcWidth = (firstCanvas.width = secondCanvas.width = thirdCanvas.width = cardPixels);
            const cardcHeight = (firstCanvas.height = secondCanvas.height = thirdCanvas.height = cardPixels);

            const firstCtx = firstCanvas.getContext('2d');
            const secondCtx = secondCanvas.getContext('2d');
            const thirdCtx = thirdCanvas.getContext('2d');

            firstCtx.clearRect(0, 0, cardcWidth, cardcHeight);
            secondCtx.clearRect(0, 0, cardcWidth, cardcHeight);
            thirdCtx.clearRect(0, 0, cardcWidth, cardcHeight);

            [
                {
                    ctx: firstCtx,
                    xOffset: widthOffset,
                },
                {
                    ctx: secondCtx,
                    xOffset: widthOffset + cardPixels,
                },
                {
                    ctx: thirdCtx,
                    xOffset: widthOffset + 2 * cardPixels,
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
                    cardcHeight
                );
            });

            Promise.all([
                convertCanvasToBlob(firstCanvas),
                convertCanvasToBlob(secondCanvas),
                convertCanvasToBlob(thirdCanvas),
            ]).then(([firstHref, secondHref, thirdHref]) =>
                App.setState({
                    firstHref,
                    secondHref,
                    thirdHref,
                    isLoading: false,
                })
            );
        };
        originalImage.src = URL.createObjectURL(selectedFile);
    }

    setFileSelector(element) {
        const App = this;
        this.fileSelector = element;
        element.onchange = function() {
            if (this.files && this.files[0]) {
                App.selectedFile = this.files[0];
                App.setState(
                    {
                        imageLoaded: true,
                        heightPanDiff: 0,
                        isLoading: true,
                    },
                    App.processPanorama
                );
            }
        };
    }

    renderCrop() {
        const { imageLoaded, firstHref, secondHref, thirdHref, isLoading } = this.state;
        if (imageLoaded) {
            return (
                <div className="App-Window-main-pane">
                    <img src={firstHref} className="App-Window-card-canvas" alt="" download />
                    <img src={secondHref} className="App-Window-card-canvas" alt="" download />
                    <img src={thirdHref} className="App-Window-card-canvas" alt="" download />
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

    setHeightPan(heightPanDiff) {
        this.setState({ heightPanDiff, isLoading: true }, this.processPanorama);
    }

    renderPanControls() {
        const { imageLoaded, heightPanDiff, isLoading } = this.state;
        if (imageLoaded && !isLoading) {
            return (
                <div className="App-Window-controls">
                    <Text>Offset: {heightPanDiff}px</Text>
                    <br />
                    <Button
                        color="gray"
                        className="App-Window__control-button"
                        onClick={() => this.setHeightPan(heightPanDiff - 10)}
                    >
                        moveUp
                    </Button>
                    <Button
                        color="gray"
                        className="App-Window__control-button"
                        onClick={() => this.setHeightPan(heightPanDiff + 10)}
                    >
                        moveDown
                    </Button>
                </div>
            );
        }

        return isLoading ? (
            <div className="App-Window-controls">
                <ProgressCircle size={50} />
            </div>
        ) : (
            ''
        );
    }

    render() {
        return (
            <div>
                <Window chrome height="550px" padding="10px" className="App-Window">
                    <TitleBar title="Instagram Panorama Creator" />
                    <div className="App-Window-side-pane">
                        <div>
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
                        {this.renderPanControls()}
                    </div>
                    {this.renderCrop()}
                </Window>
            </div>
        );
    }
}
