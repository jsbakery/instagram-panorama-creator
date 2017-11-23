import React, { Component } from 'react';
import { Button, TitleBar, Window } from 'react-desktop/macOs';
import './App.css';
import { convertCanvasToDataURL } from './helpers';

export default class extends Component {
    constructor(props) {
        super(props);

        this.state = {
            originalHref: '#',
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
        const { originalCanvas, firstCanvas, secondCanvas, thirdCanvas, selectedFile } = App;
        const originalImage = new Image();

        originalImage.onload = function () {
            const { width, height } = originalImage;
            const cardPixels = width / 3;
            const heightOffset = Math.max(height / 2 - cardPixels, 0);

            const ocWidth = originalCanvas.width = cardPixels * 3;
            const ocHeight = originalCanvas.height = cardPixels;
            const cardcWidth = firstCanvas.width = secondCanvas.width = thirdCanvas.width = cardPixels;
            const cardcHeight = firstCanvas.height = secondCanvas.height = thirdCanvas.height = cardPixels;

            const originalCtx = originalCanvas.getContext('2d');
            const firstCtx = firstCanvas.getContext('2d');
            const secondCtx = secondCanvas.getContext('2d');
            const thirdCtx = thirdCanvas.getContext('2d');

            originalCtx.clearRect(0, 0, ocWidth, ocHeight);
            firstCtx.clearRect(0, 0, cardcWidth, cardcHeight);
            secondCtx.clearRect(0, 0, cardcWidth, cardcHeight);
            thirdCtx.clearRect(0, 0, cardcWidth, cardcHeight);
            originalCtx.imageSmoothingQuality = firstCtx.imageSmoothingQuality = secondCtx.imageSmoothingQuality = thirdCtx.imageSmoothingQuality = 'high';

            originalCtx.drawImage(
                originalImage,
                0,
                heightOffset,
                3 * cardPixels,
                cardPixels,
                0,
                0,
                ocWidth,
                ocHeight,
            );

            firstCtx.drawImage(
                originalImage,
                0,
                heightOffset,
                cardPixels,
                cardPixels,
                0,
                0,
                cardcWidth,
                cardcHeight,
            );
            secondCtx.drawImage(
                originalImage,
                cardPixels,
                heightOffset,
                cardPixels,
                cardPixels,
                0,
                0,
                cardcWidth,
                cardcHeight,
            );
            thirdCtx.drawImage(
                originalImage,
                2 * cardPixels,
                heightOffset,
                cardPixels,
                cardPixels,
                0,
                0,
                cardcWidth,
                cardcHeight,
            );
            /* TODO EXPAND TO PROPER IMAGES AND DOWNLOADS
            const originalHref = convertCanvasToDataURL(originalCanvas, 'original');
            App.setState({ originalHref });*/
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
        const {
            imageLoaded,
            firstHref,
            secondHref,
            thirdHref,
        } = this.state;
        if (imageLoaded) {
            return (
                <div>
                    <div>
                        <canvas
                            ref={c => (this.originalCanvas = c)}
                            className="App-Window-original-canvas"
                        />
                    </div>
                    <div style={{display: 'none'}}>
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
                    <div>
                        <img src={firstHref} className="App-Window-card-canvas"/>
                        <img src={secondHref} className="App-Window-card-canvas"/>
                        <img src={thirdHref} className="App-Window-card-canvas"/>
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
                    <TitleBar title="Instagram Panorama Creator"/>
                    <Button
                        color="blue"
                        onClick={this.openPanorama}
                        className="App-Window__select-button"
                    >
                        Select Panorama
                    </Button>
                    <br/>
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
