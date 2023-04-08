import React from "react";
import { itemsNumbers, itemsWebdings, itemsEmoji } from "../constants/items";

class Game extends React.Component {
    constructor(props) {
        super(props);

        let allCookies = document.cookie;
        let counter = 42;
        let cookieMatch = allCookies.match(new RegExp("(^| )counter=([^;]+)"));
        if (cookieMatch) {
            counter = parseInt(cookieMatch[2], 10);
        }

        this.state = {
            isRunning: false,
            winner: null,
            score: null,
            counter,
            items: itemsWebdings,
        };
        this.finishHandler = this.finishHandler.bind(this);
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick() {
        const { isRunning } = this.state;

        if (!isRunning) {
            this.setState({ winner: null });
            this._child1.forceUpdateHandler();
            this._child2.forceUpdateHandler();
            this._child3.forceUpdateHandler();

            this.setState({ isRunning: true });
        }
    }

    // Event handlers for when the switchers are clicked to change icons on items
    onNumbersClick = () => {
        this.setState({
            items: itemsNumbers,
        });
    };

    onWebdingsClick = () => {
        this.setState({
            items: itemsWebdings,
        });
    };

    onEmojiClick = () => {
        this.setState({
            items: itemsEmoji,
        });
    };

    static matches = [];

    // A function called when a child component has finished spinning
    finishHandler(value) {
        if (Game.matches.length < 3) {
            Game.matches.push(value);
        }

        // When there are three matches, update the counter, the cookie and the state of the component
        if (Game.matches.length === 3) {
            const { counter } = this.state;
            const results = Game.matches.every((match) => match === value);

            const newCounter = counter - 1;
            let expires = new Date();
            expires.setHours(23, 59, 59, 999);
            document.cookie =
                `counter=${newCounter};expires=` +
                expires.toUTCString() +
                `;path=/`;

            this.setState((prevState) => ({
                winner: results,
                score: prevState.score + value * 100,
                counter: newCounter,
                isRunning: false,
            }));
            Game.matches.length = [];
        }
    }

    render() {
        const { winner, score, counter } = this.state;
        const redButton = counter > 0 && (
            <RedButton onClick={this.handleClick} />
        );
        const counterBlock =
            counter > 0 ? (
                <div className="absolute text-5xl mt-20 w-32 pb-[0.15em] text-center rounded-full counter">
                    <span>{counter}</span>
                </div>
            ) : (
                <h2 className="block absolute mt-20 text-4xl end-text">
                    That's all for today! Come back tomorrow!
                </h2>
            );
        const winText = winner && (
            <h2 className="block absolute text-3xl mt-[8.3rem] win-text">
                You won! Your score: {score}
            </h2>
        );

        return (
            <div className="flex flex-col items-center box">
                <div className="flex flex-row justify-around w-full switchers-row">
                    <button
                        onClick={this.onNumbersClick}
                        className="w-24 h-12 switcher"
                    >
                        Numbers
                    </button>
                    <button
                        onClick={this.onWebdingsClick}
                        className="w-24 h-12 switcher"
                    >
                        Webdings
                    </button>
                    <button
                        onClick={this.onEmojiClick}
                        className="w-24 h-12 switcher"
                    >
                        Emoji
                    </button>
                </div>
                {counterBlock}
                {winText}
                <div className="flex flex-row mt-12 w-[48rem] px-16 py-4 justify-between spinner-container">
                    <Spinner
                        id={1}
                        items={this.state.items}
                        onFinish={this.finishHandler}
                        ref={(child) => {
                            this._child1 = child;
                        }}
                        timer="4000"
                    />
                    <Spinner
                        id={2}
                        items={this.state.items}
                        onFinish={this.finishHandler}
                        ref={(child) => {
                            this._child2 = child;
                        }}
                        timer="4400"
                    />
                    <Spinner
                        id={3}
                        items={this.state.items}
                        onFinish={this.finishHandler}
                        ref={(child) => {
                            this._child3 = child;
                        }}
                        timer="5200"
                    />
                </div>
                <div className="flex flex-row w-32 h-32 mb-4">{redButton}</div>
            </div>
        );
    }
}

class RedButton extends React.Component {
    render() {
        return (
            <button
                onClick={this.props.onClick}
                className="px-4 py-2 text-white red-button"
            >
                Start
            </button>
        );
    }
}

class Spinner extends React.Component {
    itemsRef = [];

    state = {
        position: 0,
    };

    iconHeight = 12;
    timer = null;

    constructor(props) {
        super(props);
        this.forceUpdateHandler = this.forceUpdateHandler.bind(this);
        for (let i = 0; i <= 10; i++) {
            this.itemsRef.push(React.createRef());
        }
    }

    slider = React.createRef();

    // Start function to return a random number to use for initial position
    start() {
        return Math.floor(Math.random() * 10) * this.iconHeight * -1;
    }

    forceUpdateHandler() {
        this.reset();
    }

    reset() {
        clearInterval(this.timer);
        this.setState({
            position: this.start(),
            timeRemaining: this.props.timer,
        });
        this.timer = setInterval(() => {
            this.tick();
        }, 100);
    }

    // Method used to simulate the rolling of the spinner
    roll() {
        // Calculates the new position of the spinner
        let pos = this.state.position - this.iconHeight;

        // If the spinner has reached the end, resets it to the beginning
        if (this.state.position === this.iconHeight * -9) {
            pos = 0;
        }

        // Updates the state with the new position of the spinner
        this.setState({
            position: pos,
            timeRemaining: this.state.timeRemaining - 100,
        });
    }

    // Method used to get the id of the winning item
    getWinId() {
        // Gets the coordinates of the slider
        const sliderCord = this.slider.current.getBoundingClientRect();

        // Loops through each item ref to get its coordinates
        for (const ref of this.itemsRef) {
            // If the ref doesn't exist at the moment, exits the method
            if (!ref.current) return;

            // Gets the coordinates of the item
            const cord = ref.current.blockRef.current.getBoundingClientRect();

            // Calculates the center of the item
            const itemCenter = cord.y + cord.height / 2;

            // Calculates the winning coordinates
            const winCord = {
                top: sliderCord.y + cord.height,
                bottom: sliderCord.y + cord.height * 2,
            };

            // If the center of the item is within the winning coordinates, calls the 'onFinish' method passed as a prop with the id of the winning item
            if (itemCenter > winCord.top && itemCenter < winCord.bottom) {
                this.props.onFinish(ref.current.props.id);
            }
        }
    }

    // Method used to update the state on each tick of the timer
    tick() {
        // If the time remaining is zero, clears the timer and gets the winning id
        if (this.state.timeRemaining <= 0) {
            clearInterval(this.timer);
            this.getWinId();
        } else {
            this.roll();
        }
    }

    componentDidMount() {
        clearInterval(this.timer);
        this.setState({
            position: this.start(),
            timeRemaining: this.props.timer,
        });
    }

    render() {
        const { position } = this.state;

        return (
            <div
                ref={this.slider}
                className="slider flex overflow-hidden h-[36rem] w-48"
            >
                <div
                    style={{ transform: `translateY( ${position}rem)` }}
                    className="track h-full relative"
                >
                    {[...Array(12)].map((_, i) => (
                        <Item
                            id={i}
                            key={i}
                            symbol={this.props.items[i].symbol}
                            ref={this.itemsRef[i]}
                        />
                    ))}
                </div>
            </div>
        );
    }
}

class Item extends React.Component {
    constructor(props) {
        super(props);
        this.blockRef = React.createRef();
    }

    render() {
        return (
            <div
                ref={this.blockRef}
                className="item flex items-center text-8xl overflow-h h-48 w-48 justify-center"
            >
                {this.props.symbol}
            </div>
        );
    }
}

export default Game;
