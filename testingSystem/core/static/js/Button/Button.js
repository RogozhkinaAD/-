class Button extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const { type, onClick, title, size, href, target } = this.props;

        const imageClass = "img-button w" + (typeof size === 'undefined' ? 24 : size);

        if (typeof href !== "undefined") {
            return <a href={href} target={typeof target !== "undefined" ? target : ""}>
                <img
                    src={"/static/js/Button/images/" + type +  ".svg"}
                    onClick={onClick}
                    title={title}
                    className={imageClass}
                />
            </a>;

        } else {
            return <img
                src={"/static/js/Button/images/" + type +  ".svg"}
                onClick={onClick}
                title={title}
                className={imageClass}
            />;
        }
    }
}