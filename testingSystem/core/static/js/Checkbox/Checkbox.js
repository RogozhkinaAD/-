class Checkbox extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const { checked, callback } = this.props;

        return <img
            src={"/static/js/Checkbox/" + (!checked ? "un" : "") + "checked.svg"}
            onClick={() => {callback();}}
            className="checkbox"
        />;
    }
}